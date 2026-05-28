const mongoose = require("mongoose");

const connectDB = async () => {
  let uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/prescriptions";
  
  if (uri.includes("<username>") || uri.includes("<password>")) {
    console.warn("Warning: MongoDB URI placeholder detected in .env. Falling back to local MongoDB...");
    uri = "mongodb://127.0.0.1:27017/prescriptions";
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    if (uri !== "mongodb://127.0.0.1:27017/prescriptions") {
      console.warn(`Failed to connect to primary MongoDB Atlas. Trying local fallback: mongodb://127.0.0.1:27017/prescriptions`);
      try {
        const conn = await mongoose.connect("mongodb://127.0.0.1:27017/prescriptions");
        console.log(`MongoDB Connected (Local Fallback): ${conn.connection.host}`);
        return;
      } catch (localError) {
        console.error(`MongoDB Error (Local Fallback failed): ${localError.message}`);
      }
    }
    console.error(`MongoDB Error: ${error.message}`);
    console.error("Please ensure MongoDB is running locally on port 27017 or configure a valid MONGO_URI in your backend/.env");
    process.exit(1);
  }
};

module.exports = connectDB;