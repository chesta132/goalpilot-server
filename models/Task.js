const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  goalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Goal",
    required: true,
  },
  task: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000,
    required: true,
    default: "",
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  targetDate: {
    type: Date,
    default: null,
  },
  difficulty: {
    type: String,
    required: true,
    enum: ["easy", "medium", "hard", "very hard"],
    default: "easy",
  },
  completedAt: {
    type: Date,
    default: null,
  },
  rewardPoints: {
    type: Number,
    required: true,
    default: 100,
    max: 800,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isRecycled: {
    type: Boolean,
    required: true,
    default: false,
  },
  deleteAt: {
    type: Date,
    default: null,
  },
});

module.exports = mongoose.model("Task", taskSchema);
