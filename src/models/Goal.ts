import mongoose, { Document, Types } from "mongoose";
import { ITaskDocument } from "./Task";

type GoalStatus = "active" | "completed" | "paused" | "canceled" | "pending";

export interface IGoal {
  userId: Types.ObjectId;
  title: string;
  description: string;
  createdAt: Date;
  targetDate: Date | null;
  progress: number;
  status: GoalStatus;
  isPublic: boolean;
  tasks: Types.ObjectId[] | ITaskDocument[];
  color: string;
  isRecycled: boolean;
  deleteAt: Date | null;
}

export interface IGoalDocument extends IGoal, Document {}

export interface IGoalDocTasks extends IGoalDocument {
  tasks: ITaskDocument[];
}

const goalSchema = new mongoose.Schema<IGoalDocument>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1500,
    required: true,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  targetDate: {
    type: Date,
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
    enum: ["active", "completed", "paused", "canceled", "pending"],
    default: "active",
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
  color: {
    type: String,
    default: "#66b2ff",
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

export default mongoose.model<IGoalDocument>("Goal", goalSchema);
