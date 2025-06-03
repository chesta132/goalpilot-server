const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
  },
  password: {
    type: String,
    minlength: 6,
  },
  googleId: {
    type: String,
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  role: {
    type: String,
    enum: ["admin", "user", "moderator"],
    default: "user",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastActive: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["online", "offline"],
    default: "offline",
    required: true
  },
  goals: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Goal",
      required: true,
    },
  ],
  goalsCompleted: {
    type: Number,
    default: 0,
    min: 0,
  },
  level: {
    type: Number,
    default: 1,
    min: 1,
  },
  points: {
    type: Number,
    default: 0,
    min: 0,
  },
  tasksCompleted: {
    type: Number,
    default: 0,
    min: 0,
  },
});

module.exports = mongoose.model("User", UserSchema);
