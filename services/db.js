const mongoose = require("mongoose");
require("dotenv").config();

const URI = process.env.MONGO_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(URI);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error(err);
    console.log("error", err);
    process.exit(1);
  }
};

module.exports = connectDB;
