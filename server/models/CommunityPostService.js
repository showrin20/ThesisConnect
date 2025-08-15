const CommunityPost = require('../models/CommunityPost');
const Project = require('../models/Project');

class CommunityPostService {
  // Create a new community post
  static async createPost(data, userId) {
    if (!userId) throw new Error('User authentication required');

    // Validate project ownership if projectId provided
    if (data.projectId) {
      const project = await Project.findById(data.projectId);
      if (!project || project.creator.toString() !== userId) {
        throw new Error('Invalid project selected. You can only link your own projects.');
      }
    }

    const post = new CommunityPost({
      postId: data.postId || `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: data.type,
      authorId: userId,
      projectId: data.projectId || null,
      title: data.title || undefined,
      content: data.content,
      skillsNeeded: data.skillsNeeded || [],
      status: data.status || 'open',
      tags: data.tags || [],
      likes: 0,
      likedBy: []
    });

    await post.save();
    return post;
  }

  // Get all posts with optional filters
  static async getAllPosts({ page = 1, limit = 10, type, tags }) {
    const query = {};
    if (type) query.type = type;
    if (tags && tags.length > 0) query.tags = { $in: tags };

    const posts = await CommunityPost.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('authorId', 'name email')
      .populate('projectId', 'title');

    const total = await CommunityPost.countDocuments(query);

    return { posts, total, page, limit };
  }

  // Get posts by a specific user
  static async getUserPosts(userId, { page = 1, limit = 10, type }) {
    const query = { authorId: userId };
    if (type) query.type = type;

    const posts = await CommunityPost.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('projectId', 'title');

    const total = await CommunityPost.countDocuments(query);
    return { posts, total, page, limit };
  }

  // Get single post by postId
  static async getPostById(postId) {
    const post = await CommunityPost.findOne({ postId })
      .populate('authorId', 'name email')
      .populate('projectId', 'title');

    if (!post) throw new Error('Post not found');
    return post;
  }

  // Update a post
  static async updatePost(postId, data, userId) {
    const post = await CommunityPost.findOne({ postId });
    if (!post) throw new Error('Post not found');
    if (post.authorId.toString() !== userId) throw new Error('Unauthorized to update this post');

    Object.assign(post, {
      ...data,
      tags: data.tags || post.tags,
      skillsNeeded: data.skillsNeeded || post.skillsNeeded
    });

    await post.save();
    return post;
  }

  // Delete a post
  static async deletePost(postId, userId) {
    const post = await CommunityPost.findOne({ postId });
    if (!post) throw new Error('Post not found');
    if (post.authorId.toString() !== userId) throw new Error('Unauthorized to delete this post');

    await post.remove();
    return { message: 'Community post deleted successfully' };
  }

  // Toggle like/unlike
  static async toggleLike(postId, userId) {
    const post = await CommunityPost.findOne({ postId });
    if (!post) throw new Error('Post not found');

    const index = post.likedBy.findIndex(id => id.toString() === userId);
    if (index === -1) {
      post.likedBy.push(userId);
      post.likes += 1;
    } else {
      post.likedBy.splice(index, 1);
      post.likes -= 1;
    }

    await post.save();
    return post;
  }
}

module.exports = CommunityPostService;
