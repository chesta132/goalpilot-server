import { Request, Response } from "express";
import handleError from "../../utils/handleError";
import { findAndSanitize, updateOneAndSanitize } from "../../utils/mongooseUtils";
import OTP from "../../models/OTP";
import User from "../../models/User";
import { ErrorResponse } from "../../types/types";

export const verifyAccount = async (req: Request, res: Response) => {
  const resInvalidOTP = () =>
    res.status(400).json({ message: "Invalid or expired One-Time Password. Please request a new OTP.", code: "INVALID_OTP_FIELD" } as ErrorResponse);

  try {
    const user = req.user!;
    const { code } = req.body;
    const otp = await findAndSanitize(OTP, { userId: user.id });
    if (!otp || otp.length === 0) {
      resInvalidOTP();
      return;
    }

    const otpVerify = otp.filter((otp) => otp.type === "VERIFY");
    if (otpVerify.length === 0) {
      resInvalidOTP();
      return;
    }

    for (const otp of otpVerify) {
      if (otp.otp === code) {
        const updatedUser = await updateOneAndSanitize(
          User,
          { email: user.email },
          { verified: true },
          { options: { new: true, runValidators: true } }
        );
        res.json(updatedUser);
        return;
      }
    }
    resInvalidOTP();
  } catch (err) {
    handleError(err, res);
  }
};
