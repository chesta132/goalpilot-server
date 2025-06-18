const mongoose = require("mongoose");

const Ai_cacheSchema = new mongoose.Schema({
  queryHash: {
    type: String,
    required: true,
  },
  query: {
    type: String,
    required: true,
  },
  aiResponse: [
    {
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
      difficulty: {
        type: String,
        required: true,
        enum: ["easy", "medium", "hard", "very hard"],
        default: "easy",
      },
    },
  ],
  timestamp: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
});

module.exports = mongoose.model("Ai_cache", Ai_cacheSchema);
