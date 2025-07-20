import mongoose, { Document, ObjectId } from "mongoose";
import { IUserDocument } from "./User";

type StatusFriend = "PENDING" | "FRIEND";

export interface IFriend {
  userId1: ObjectId | string | Partial<IUserDocument>;
  userId2: ObjectId | string | Partial<IUserDocument>;
  createdAt: Date;
  updatedAt: Date;
  status: StatusFriend;
}

export interface IFriendRes extends Omit<IFriend, "userId1" | "userId2"> {
  user: string;
  friend: string;
}

export interface IFriendDocument extends IFriend, Document {}

const friendSchema = new mongoose.Schema<IFriendDocument>(
  {
    userId1: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
    userId2: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
    status: { type: String, default: "PENDING", enum: ["PENDING", "FRIEND"] },
  },
  { timestamps: true }
);
friendSchema.index({ userId1: 1, userId2: 1 }, { unique: true });

export default mongoose.model<IFriendDocument>("Friend", friendSchema);
