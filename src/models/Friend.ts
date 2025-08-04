import mongoose, { Document, ObjectId } from "mongoose";
import { IUserDocument } from "./User";

type StatusFriend = "PENDING" | "FRIEND";
type User = ObjectId | string | Partial<IUserDocument>;

export interface IFriend<T = User> {
  userId1: T;
  userId2: T;
  createdAt: Date;
  updatedAt: Date;
  status: StatusFriend;
}

export interface IFriendRes<T = User> extends Omit<IFriend, "userId1" | "userId2"> {
  user: IFriend<T>["userId1"];
  friend: IFriend<T>["userId1"];
}

export interface IFriendDocument<T = User> extends IFriend<T>, Document {}

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
