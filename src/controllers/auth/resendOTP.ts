import { Request, Response } from "express";
import handleError from "../../utils/handleError";
import { generateOTP, sendOTPEmail } from "../../utils/email";
import { createAndSanitize } from "../../utils/mongooseUtils";
import Verification from "../../models/Verification";

type TypeOTP = "CHANGE_EMAIL";

export const resendOTP = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { type }: { type: TypeOTP } = req.body;
    const otp = generateOTP();

    if (type === "CHANGE_EMAIL") {
      await createAndSanitize(Verification, { key: otp, type: "CHANGE_EMAIL_OTP", userId: user.id });
      await sendOTPEmail(user.email, otp, user.fullName);
      res.status(200).send();
      return;
    }
  } catch (err) {
    handleError(err, res);
  }
};
