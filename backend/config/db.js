const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Verify MONGODB_URI is available
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    console.log('Attempting to connect to MongoDB with:', process.env.MONGODB_URI.replace(/\/\/.*@/, '//<credentials>@')); // Logs URI with hidden credentials

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`MongoDB Atlas Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB Atlas: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;