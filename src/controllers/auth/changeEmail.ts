import { Request, Response } from "express";
import handleError from "../../utils/handleError";
import { ErrorResponse } from "../../types/types";
import { findOneAndSanitize, updateByIdAndSanitize } from "../../utils/mongooseUtils";
import Verification from "../../models/Verification";
import { resInvalidOTP, resMissingFields, resUserNotFound } from "../../utils/resUtils";
import User from "../../models/User";
import { sanitizeUserQuery } from "../../utils/sanitizeQuery";

export const changeEmail = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { newEmail, token } = req.body;
    if (!newEmail || !token) {
      resMissingFields(res, "New email, Token");
      return;
    }
    if (!user.email) {
      res.status(409).json({
        message: "Account is not bind to local yet, please bind to local first",
        code: "NOT_BINDED",
        title: "Account is not binded",
      } as ErrorResponse);
    }
    if (user.email === newEmail) {
      res.status(409).json({ message: "New email and old email can not same", code: "INVALID_NEW_EMAIL_FIELD" } as ErrorResponse);
      return;
    }
    if (await User.findOne({ email: newEmail })) {
      res.status(409).json({ message: "Email is already in use", code: "INVALID_NEW_EMAIL_FIELD" } as ErrorResponse);
      return;
    }

    const updateEmail = async () => {
      const updatedUser = await User.findByIdAndUpdate(
        user.id,
        { email: newEmail, verified: user?.gmail === newEmail },
        { new: true, runValidators: true }
      );
      if (!updatedUser) {
        resUserNotFound(res);
        return;
      }
      await Verification.findOneAndDelete({ key: token, type: "CHANGE_EMAIL_OTP", userId: user.id });

      res.json({ ...sanitizeUserQuery(updatedUser), notification: "Local email updated" });
    };

    if (!user.verified) {
      await updateEmail();
      return;
    }

    const otp = await findOneAndSanitize(Verification, { key: token, type: "CHANGE_EMAIL_OTP", userId: user.id });
    if (!otp) {
      resInvalidOTP(res);
      return;
    }

    await updateEmail();
  } catch (err) {
    handleError(err, res);
  }
};
