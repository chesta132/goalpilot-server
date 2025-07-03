import mongoose from "mongoose";

const URI = process.env.MONGODB_URI;

export const connectDB = async () => {
  try {
    if (!URI) throw Error("No Mongo URI from env");
    await mongoose.connect(URI);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error(err);
    console.log("error", err);
    process.exit(1);
  }
};