import { UserRole, UserStatus } from "../types/types";
import mongoose, { Document, ObjectId } from "mongoose";
import { IGoalDocument } from "./Goal";
import { ITaskDocument } from "./Task";

export type TUser = {
  username: string;
  email: string;
  password: string;
  gmail: string;
  googleId: string;
  fullName: string;
  role: UserRole;
  createdAt: Date;
  lastActive: Date;
  status: UserStatus;
  goals: ObjectId[] | IGoalDocument[];
  goalsCompleted: number;
  level: number;
  points: number;
  tasksCompleted: number;
  verified: boolean;
};

export interface IUserDocument extends TUser, Document {}

export interface IUserDocGoals extends Omit<IUserDocument, "goals"> {
  goals: IGoalDocument[];
}

export interface IUserDocGoalsAndTasks extends Omit<IUserDocument, "goals"> {
  goals: (Omit<IGoalDocument, "tasks"> & { tasks: ITaskDocument[] })[];
}

const UserSchema = new mongoose.Schema<IUserDocument>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50,
    index: 1,
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
    index: 1,
  },
  gmail: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid gmail"],
    index: 1,
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
    required: true,
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
  verified: {
    type: Boolean,
    default: false,
  },
});

export default mongoose.model<IUserDocument>("User", UserSchema);
