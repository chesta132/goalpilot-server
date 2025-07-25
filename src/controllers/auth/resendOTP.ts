import { Request, Response } from "express";
import handleError from "../../utils/handleError";
import { generateOTP, sendOTPEmail } from "../../utils/email";
import { createAndSanitize, updateByIdAndSanitize } from "../../utils/mongooseUtils";
import Verification, { IVerification } from "../../models/Verification";
import { ErrorResponse } from "../../types/types";
import User from "../../models/User";
import { resLimitSendEmail } from "../../utils/resUtils";

type TypeOTP = "CHANGE_EMAIL" | "CHANGE_PASSWORD" | "DELETE_ACCOUNT";

export const resendOTP = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { type }: { type?: TypeOTP } = req.body;
    const otp = generateOTP();

    if (typeof user.timeToAllowSendEmail === "object" && (user.timeToAllowSendEmail as Date) > new Date()) {
      resLimitSendEmail(res);
      return;
    }

    const createAndSend = async (type: IVerification["type"]) => {
      await createAndSanitize(Verification, { key: otp, type, userId: user.id });
      await sendOTPEmail(user.email, otp, user.fullName);
      await updateByIdAndSanitize(User, user.id, { timeToAllowSendEmail: new Date(Date.now() + 1000 * 60 * 2) });
      res.status(204).send();
    };

    switch (type) {
      case "CHANGE_EMAIL":
        await createAndSend("CHANGE_EMAIL_OTP");
        return;

      case "CHANGE_PASSWORD":
        await createAndSend("RESET_PASSWORD_OTP");
        return;
      case "DELETE_ACCOUNT":
        await createAndSend("DELETE_ACCOUNT_OTP");
    }
    res.status(406).json({ message: "Invalid type please send a valid type", code: "INVALID_OTP_FIELD" } as ErrorResponse);
  } catch (err) {
    handleError(err, res);
  }
};
