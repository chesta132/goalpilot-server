import mongoose, { Document } from "mongoose";

type AiTaskDifficulty = "easy" | "medium" | "hard" | "very hard";

export interface IAiResponseItem {
  task: string;
  description: string;
  difficulty: AiTaskDifficulty;
}

export interface IAiCache {
  queryHash: string;
  query: string;
  aiResponse: IAiResponseItem[];
  timestamp: Date;
  expiresAt: Date;
}

export interface IAiCacheDocument extends IAiCache, Document {}

const AiCacheSchema = new mongoose.Schema<IAiCacheDocument>({
  queryHash: {
    type: String,
    required: true,
  },
  query: {
    type: String,
    required: true,
    trim: true,
    index: 1,
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
    index: { expires: "0s" },
  },
});

export default mongoose.model<IAiCacheDocument>("Ai_cache", AiCacheSchema);
