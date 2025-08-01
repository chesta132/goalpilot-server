import { Request, Response } from "express";
import handleError from "../../utils/handleError";
import { findOneAndSanitize } from "../../utils/mongooseUtils";
import User from "../../models/User";
import { ErrorResponse } from "../../types/types";
import Verification from "../../models/Verification";
import { resIsVerified, resMissingFields, resUserNotFound } from "../../utils/resUtils";
import { decrypt } from "../../utils/cryptoUtils";
import { sanitizeUserQuery } from "../../utils/sanitizeQuery";

export const verifyEmail = async (req: Request, res: Response) => {
  const resInvalidToken = () =>
    res.status(400).json({
      message: "Invalid or expired Verification token. Please create a new verification email request.",
      code: "INVALID_VERIFY_EMAIL_TOKEN",
    } as ErrorResponse);

  try {
    const { token } = req.body;
    if (!token) {
      resMissingFields(res, "Token");
      return;
    }

    const tokenDecrypted = decrypt(token);
    const userId = tokenDecrypted.slice(tokenDecrypted.indexOf("verify_") + 7);
    const user = await User.findById(userId);
    if (!user) {
      resInvalidToken();
      return;
    }
    if (user.verified) {
      resIsVerified(res);
      return;
    }

    const verification = await findOneAndSanitize(Verification, { key: token, type: "VERIFY", userId: user.id });
    if (!verification) {
      resInvalidToken();
      return;
    }

    const updatedUser = await User.findByIdAndUpdate(user.id, { verified: true }, { new: true, runValidators: true });
    if (!updatedUser) {
      resUserNotFound(res);
      return;
    }
    await Verification.findOneAndDelete({ key: token, type: "VERIFY", userId: user.id });
    const sanitizedUser = sanitizeUserQuery(updatedUser);
    res.json(sanitizedUser);
    return;
  } catch (err) {
    handleError(err, res);
  }
};
