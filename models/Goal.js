const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
  targetDate: {
    type: Date,
    required: true,
    default: null,
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  status: {
    type: String,
    enum: ["Active", "Completed", "Paused", "Cancelled"],
    default: "Active",
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  tasks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
    },
  ],
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

module.exports = mongoose.model("Goal", goalSchema);
