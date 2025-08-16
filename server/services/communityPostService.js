const CommunityPost = require('../models/CommunityPostSchema');
const Project = require('../models/Project');

class CommunityPostService {
  // Validate if a project belongs to the user
  static async validateUserProject(projectId, userId) {
    if (!projectId) return true; // projectId is optional
    
    const project = await Project.findOne({ 
      _id: projectId, 
      $or: [
        { creator: userId },
        { 'collaborators.user': userId }
      ]
    });
    
    return !!project;
  }

  // Create a new community post
  static async createPost(postData, userId) {
    // Validate required fields
    if (!postData.postId || !postData.type || !postData.content) {
      throw new Error('Missing required fields');
    }

    // Validate collaboration-specific fields
    if (postData.type === 'collab') {
      if (!postData.title || !postData.skillsNeeded || !postData.status) {
        throw new Error('Missing required fields for collaboration post');
      }
    }

    // Validate project ownership if projectId is provided
    if (postData.projectId) {
      const isValidProject = await this.validateUserProject(postData.projectId, userId);
      if (!isValidProject) {
        throw new Error('Project not found or you do not have access to this project');
      }
    }

    // Check for duplicate postId
    const existingPost = await CommunityPost.findOne({ postId: postData.postId });
    if (existingPost) {
      throw new Error('Post with this ID already exists');
    }

    // Create the post
    const post = new CommunityPost({
      ...postData,
      authorId: userId,
      createdAt: new Date()
    });

    return await post.save();
  }

  // Get all posts with pagination and filtering
  static async getAllPosts(options = {}) {
    const { page = 1, limit = 10, type, tags } = options;
    const skip = (page - 1) * limit;

    let query = {};
    if (type) query.type = type;
    if (tags && tags.length > 0) query.tags = { $in: tags };

    const posts = await CommunityPost.find(query)
      .populate('authorId', 'name email')
      .populate('projectId', 'title description')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await CommunityPost.countDocuments(query);

    return {
      posts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalPosts: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    };
  }

  // Get user's posts
  static async getUserPosts(userId, options = {}) {
    const { page = 1, limit = 10, type } = options;
    const skip = (page - 1) * limit;

    let query = { authorId: userId };
    if (type) query.type = type;

    const posts = await CommunityPost.find(query)
      .populate('authorId', 'name email')
      .populate('projectId', 'title description')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await CommunityPost.countDocuments(query);

    return {
      posts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalPosts: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    };
  }

  // Get a single post by ID
  static async getPostById(postId) {
    const post = await CommunityPost.findOne({ postId })
      .populate('authorId', 'name email')
      .populate('projectId', 'title description creator');
    
    if (!post) {
      throw new Error('Post not found');
    }

    return post;
  }

  // Update a post
  static async updatePost(postId, updateData, userId) {
    const existingPost = await CommunityPost.findOne({ postId });
    
    if (!existingPost) {
      throw new Error('Post not found');
    }

    if (existingPost.authorId.toString() !== userId) {
      throw new Error('Unauthorized: You can only update your own posts');
    }

    // Validate project ownership if projectId is being updated
    if (updateData.projectId && updateData.projectId !== existingPost.projectId?.toString()) {
      const isValidProject = await this.validateUserProject(updateData.projectId, userId);
      if (!isValidProject) {
        throw new Error('Project not found or you do not have access to this project');
      }
    }

    // Validate collaboration fields if type is collab
    if (updateData.type === 'collab') {
      if (!updateData.title || !updateData.skillsNeeded || !updateData.status) {
        throw new Error('Missing required fields for collaboration post');
      }
    }

    const updatedPost = await CommunityPost.findOneAndUpdate(
      { postId },
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('authorId', 'name email')
     .populate('projectId', 'title description');

    return updatedPost;
  }

  // Delete a post
  static async deletePost(postId, userId) {
    const existingPost = await CommunityPost.findOne({ postId });
    
    if (!existingPost) {
      throw new Error('Post not found');
    }

    if (existingPost.authorId.toString() !== userId) {
      throw new Error('Unauthorized: You can only delete your own posts');
    }

    await CommunityPost.findOneAndDelete({ postId });
    return { message: 'Post deleted successfully' };
  }

  // Add a reply to a post
  static async addReply(postId, replyData, userId) {
    const post = await CommunityPost.findOne({ postId });
    
    if (!post) {
      throw new Error('Post not found');
    }

    const reply = {
      replyId: replyData.replyId,
      authorId: userId,
      content: replyData.content,
      timestamp: new Date()
    };

    post.replies.push(reply);
    await post.save();

    return post;
  }

  // Like/unlike a post
  static async toggleLike(postId, userId) {
    const post = await CommunityPost.findOne({ postId });
    
    if (!post) {
      throw new Error('Post not found');
    }

    // Check if user already liked the post
    const userIndex = post.likedBy.findIndex(id => id.toString() === userId);
    
    if (userIndex > -1) {
      // User already liked, so unlike
      post.likedBy.splice(userIndex, 1);
      post.likes = Math.max(0, post.likes - 1);
    } else {
      // User hasn't liked, so like
      post.likedBy.push(userId);
      post.likes = post.likes + 1;
    }

    await post.save();
    
    // Return populated post
    return await CommunityPost.findOne({ postId })
      .populate('authorId', 'name email')
      .populate('projectId', 'title description');
  }

  // Add a comment to a post
  static async addComment(postId, commentData, userId, userName) {
    const post = await CommunityPost.findOne({ postId });
    
    if (!post) {
      throw new Error('Post not found');
    }

    const comment = {
      commentId: commentData.commentId || `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text: commentData.text,
      authorId: userId,
      authorName: userName,
      likes: 0,
      likedBy: [],
      createdAt: new Date()
    };

    post.comments.push(comment);
    await post.save();

    // Return the updated post with populated fields
    return await CommunityPost.findOne({ postId })
      .populate('authorId', 'name email')
      .populate('projectId', 'title description');
  }

  // Get comments for a post
  static async getComments(postId) {
    const post = await CommunityPost.findOne({ postId }).select('comments');
    
    if (!post) {
      throw new Error('Post not found');
    }

    return post.comments || [];
  }

  // Like/unlike a comment
  static async toggleCommentLike(postId, commentId, userId) {
    const post = await CommunityPost.findOne({ postId });
    
    if (!post) {
      throw new Error('Post not found');
    }

    const comment = post.comments.find(c => c.commentId === commentId);
    if (!comment) {
      throw new Error('Comment not found');
    }

    // Check if user already liked the comment
    const userIndex = comment.likedBy.findIndex(id => id.toString() === userId);
    
    if (userIndex > -1) {
      // User already liked, so unlike
      comment.likedBy.splice(userIndex, 1);
      comment.likes = Math.max(0, comment.likes - 1);
    } else {
      // User hasn't liked, so like
      comment.likedBy.push(userId);
      comment.likes = comment.likes + 1;
    }

    await post.save();
    
    // Return the updated post with populated fields
    return await CommunityPost.findOne({ postId })
      .populate('authorId', 'name email')
      .populate('projectId', 'title description');
  }

  // Delete a comment
  static async deleteComment(postId, commentId, userId) {
    const post = await CommunityPost.findOne({ postId });
    
    if (!post) {
      throw new Error('Post not found');
    }

    const commentIndex = post.comments.findIndex(c => c.commentId === commentId);
    if (commentIndex === -1) {
      throw new Error('Comment not found');
    }

    const comment = post.comments[commentIndex];
    if (comment.authorId.toString() !== userId) {
      throw new Error('Unauthorized: You can only delete your own comments');
    }

    post.comments.splice(commentIndex, 1);
    await post.save();

    // Return the updated post with populated fields
    return await CommunityPost.findOne({ postId })
      .populate('authorId', 'name email')
      .populate('projectId', 'title description');
  }
}

module.exports = CommunityPostService;
