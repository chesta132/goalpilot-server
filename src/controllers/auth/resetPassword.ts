import { Request, Response } from "express";
import handleError from "../../utils/handleError";
import { ErrorResponse } from "../../types/types";
import { resInvalidOTP, resMissingFields, resUserNotFound } from "../../utils/resUtils";
import { findOneAndSanitize, updateByIdAndSanitize } from "../../utils/mongooseUtils";
import Verification from "../../models/Verification";
import User from "../../models/User";
import bcrypt from "bcrypt";
import { sanitizeUserQuery } from "../../utils/sanitizeQuery";

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { newPassword, token } = req.body;
    if (!newPassword || !token) {
      resMissingFields(res, "New password, token");
      return;
    }

    const password = await bcrypt.hash(newPassword, 10);

    if (await bcrypt.compare(newPassword, user.password)) {
      res.status(409).json({ message: "New password and old password can not same", code: "INVALID_NEW_PASSWORD_FIELD" } as ErrorResponse);
      return;
    }

    const otp = await findOneAndSanitize(Verification, { key: token, type: "RESET_PASSWORD_OTP", userId: user.id });
    if (!otp) {
      resInvalidOTP(res);
      return;
    }
    const updatedUser = await updateByIdAndSanitize(User, user.id, { password }, { options: { new: true, runValidators: true } });
    if (!updatedUser) {
      resUserNotFound(res);
      return;
    }
    await Verification.findOneAndDelete({ key: token, type: "RESET_PASSWORD_OTP", userId: user.id });
    const sanitizedUser = sanitizeUserQuery(updatedUser);

    res.json({ ...sanitizedUser, notification: "Successfully reset and update new password" });
  } catch (err) {
    handleError(err, res);
  }
};
