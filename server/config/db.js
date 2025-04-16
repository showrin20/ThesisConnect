const mongoose = require('mongoose');

const connectDB = async () => {
  console.log('MONGO_URI:', process.env.MONGO_URI);
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is undefined. Check .env file and dotenv configuration.');
    process.exit(1);
  }
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

module.exports = connectDB;