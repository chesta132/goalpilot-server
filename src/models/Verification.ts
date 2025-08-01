import mongoose, { Document, ObjectId } from "mongoose";

type TypeVerification = "VERIFY" | "RESET_PASSWORD" | "CHANGE_EMAIL_OTP" | "RESET_PASSWORD_OTP" | "DELETE_ACCOUNT_OTP";

export interface IVerification {
  userId: string | ObjectId;
  key: string;
  createdAt: Date;
  deleteAt: Date;
  type: TypeVerification;
}

export interface IVerificationDocument extends IVerification, Document {}

const verificationSchema = new mongoose.Schema<IVerificationDocument>({
  userId: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  key: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  deleteAt: { type: Date, default: () => new Date(Date.now() + 5 * 60 * 1000), index: { expires: "0s" } },
  type: { type: String, default: "VERIFY", enum: ["VERIFY", "RESET_PASSWORD", "CHANGE_EMAIL_OTP", "RESET_PASSWORD_OTP", "DELETE_ACCOUNT_OTP"] },
});

export default mongoose.model<IVerificationDocument>("Verification", verificationSchema);
