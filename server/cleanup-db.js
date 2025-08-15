const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

async function cleanupDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/test');
    
    console.log('✅ Connected to MongoDB');
    
    // Get the database and collection
    const db = mongoose.connection.db;
    const collection = db.collection('communityposts');
    
    // 1. Drop the problematic index
    try {
      await collection.dropIndex('replies.replyId_1');
      console.log('✅ Dropped replies.replyId_1 index');
    } catch (err) {
      console.log('ℹ️  Index replies.replyId_1 does not exist or already dropped');
    }
    
    // 2. Remove the replies field entirely from all documents
    const result = await collection.updateMany(
      {},
      { $unset: { replies: "" } }
    );
    console.log('✅ Removed replies field from', result.modifiedCount, 'documents');
    
    // 3. Show collection indexes
    const indexes = await collection.indexes();
    console.log('📋 Current indexes:', indexes.map(i => i.name));
    
    console.log('✅ Database cleanup completed successfully');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the cleanup
cleanupDatabase();
