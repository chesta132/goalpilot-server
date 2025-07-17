import { Request, Response } from "express";
import handleError from "../../utils/handleError";
import { generateOTP, sendOTPEmail } from "../../utils/email";
import { createAndSanitize } from "../../utils/mongooseUtils";
import OTP from "../../models/OTP";

export const resendOtp = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const otpToken = generateOTP();
    await createAndSanitize(OTP, { userId: user.id, otp: otpToken, type: "VERIFY" });
    await sendOTPEmail(user.email, otpToken, user.fullName);
    res.status(200).send();
  } catch (err) {
    handleError(err, res);
  }
};
