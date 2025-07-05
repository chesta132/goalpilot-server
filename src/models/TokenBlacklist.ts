import mongoose, { Document, ObjectId } from "mongoose";

export interface ITokenBlacklist {
  refreshToken: string;
  userId: string | ObjectId;
  deleteAt: Date;
}

export interface ITokenBlacklistDocument extends ITokenBlacklist, Document {}

const tokenBlacklistSchema = new mongoose.Schema<ITokenBlacklistDocument>({
  refreshToken: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  deleteAt: {
    type: Date,
    required: true,
  },
});

export default mongoose.model<ITokenBlacklistDocument>("Token_blacklist", tokenBlacklistSchema);