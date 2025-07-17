import mongoose, { Document, ObjectId } from "mongoose";

type TypeOTP = "VERIFY" | "RESET_PASSWORD";

export interface IOTP {
  userId: string | ObjectId;
  otp: string;
  createdAt: Date;
  deleteAt: Date;
  type: TypeOTP;
}

export interface IOTPDocument extends IOTP, Document {}

const otpSchema = new mongoose.Schema<IOTPDocument>({
  userId: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  deleteAt: { type: Date, default: () => new Date(Date.now() + 5 * 60 * 1000), index: { expires: "0s" } },
  type: { type: String, default: "VERIFY" },
});

export default mongoose.model<IOTPDocument>("Otp", otpSchema);
