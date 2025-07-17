import mongoose, { Document, ObjectId } from "mongoose";

type TaskDifficulty = "easy" | "medium" | "hard" | "very hard";

export interface ITask {
  goalId: ObjectId | string;
  task: string;
  description: string;
  isCompleted: boolean;
  targetDate: Date | null;
  difficulty: TaskDifficulty;
  completedAt: Date | null;
  rewardPoints: number;
  createdAt: Date;
  isRecycled: boolean;
  deleteAt: Date | null;
}

export interface ITaskDocument extends ITask, Document {}

const taskSchema = new mongoose.Schema<ITaskDocument>({
  goalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Goal",
    required: true,
    index: -1,
  },
  task: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
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
    index: 1,
  },
});

export default mongoose.model<ITaskDocument>("Task", taskSchema);
