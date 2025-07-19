import { Request, Response } from "express";
import handleError from "../../utils/handleError";
import { generateOTP, sendOTPEmail } from "../../utils/email";
import { createAndSanitize } from "../../utils/mongooseUtils";
import Verification, { IVerification } from "../../models/Verification";
import { ErrorResponse } from "../../types/types";

type TypeOTP = "CHANGE_EMAIL" | "CHANGE_PASSWORD";

export const resendOTP = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { type }: { type?: TypeOTP } = req.body;
    const otp = generateOTP();
    const createAndSend = async (type: IVerification["type"]) => {
      await createAndSanitize(Verification, { key: otp, type, userId: user.id });
      await sendOTPEmail(user.email, otp, user.fullName);
      res.status(200).send();
    };

    switch (type) {
      case "CHANGE_EMAIL":
        await createAndSend("CHANGE_EMAIL_OTP");
        return;

      case "CHANGE_PASSWORD":
        await createAndSend("RESET_PASSWORD_OTP");
        return;
    }
    res.status(409).json({ message: "Invalid type please send a valid type", code: "INVALID_OTP_FIELD" } as ErrorResponse);
  } catch (err) {
    handleError(err, res);
  }
};
