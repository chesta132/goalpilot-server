import { Request, Response } from "express";
import handleError from "../../utils/handleError";
import { encrypt } from "../../utils/cryptoUtils";
import { createAndSanitize } from "../../utils/mongooseUtils";
import { sendVerificationEmail } from "../../utils/email";
import Verification from "../../models/Verification";
import { resIsVerified } from "../../utils/resUtils";

export const sendVerifyEmail = async (user: Express.User) => {
  const token = encrypt(`verify_${user.id}`);
  await createAndSanitize(Verification, { userId: user.id, key: token, type: "VERIFY" });
  await sendVerificationEmail(user.email, token, user.fullName);
};

export const resendVerifyEmail = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    if (user.verified) {
      resIsVerified(res);
      return;
    }
    await sendVerifyEmail(user);
    res.status(204).send();
  } catch (err) {
    handleError(err, res);
  }
};
