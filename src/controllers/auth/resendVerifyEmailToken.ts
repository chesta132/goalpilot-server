import { Request, Response } from "express";
import handleError from "../../utils/handleError";
import { encrypt } from "../../utils/cryptoUtils";
import { createAndSanitize, updateByIdAndSanitize } from "../../utils/mongooseUtils";
import { sendVerificationEmail } from "../../utils/email";
import Verification from "../../models/Verification";
import { resIsVerified, resLimitSendEmail } from "../../utils/resUtils";
import User from "../../models/User";

export const sendVerifyEmail = async (user: Express.User) => {
  const token = encrypt(`verify_${user.id}`);
  await createAndSanitize(Verification, { userId: user.id, key: token, type: "VERIFY" });
  await sendVerificationEmail(user.email, token, user.fullName);
  await updateByIdAndSanitize(User, user.id, { timeToAllowSendEmail: new Date(Date.now() + 1000 * 60 * 2) });
};

export const resendVerifyEmail = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    if (user.verified) {
      resIsVerified(res);
      return;
    }
    if (typeof user.timeToAllowSendEmail === "object" && (user.timeToAllowSendEmail as Date) > new Date()) {
      resLimitSendEmail(res);
      return;
    }
    await sendVerifyEmail(user);
    res.status(204).send();
  } catch (err) {
    handleError(err, res);
  }
};
