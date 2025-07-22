import { Request, Response } from "express";
import handleError from "../../utils/handleError";
import { ErrorResponse } from "../../types/types";
import { findOneAndSanitize } from "../../utils/mongooseUtils";
import Verification from "../../models/Verification";
import { resInvalidOTP, resMissingFields, resNotBinded, resUserNotFound } from "../../utils/resUtils";
import User from "../../models/User";
import { sanitizeUserQuery } from "../../utils/sanitizeQuery";
import { sendCredentialChanges } from "../../utils/email";

export const changeEmail = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { newEmail, token } = req.body;
    if (!newEmail || !token) {
      resMissingFields(res, "New email, Token");
      return;
    }
    if (!user.email) {
      resNotBinded(res);
      return;
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
        // verified comment: new email is auto verified because google mail always valid
        { email: newEmail, verified: user?.gmail === newEmail },
        { new: true, runValidators: true }
      );
      if (!updatedUser) {
        resUserNotFound(res);
        return;
      }
      await Verification.findOneAndDelete({ key: token, type: "CHANGE_EMAIL_OTP", userId: user.id });
      const sanitizedUser = sanitizeUserQuery(updatedUser);
      return sanitizedUser;
    };

    if (!user.verified) {
      const updatedUser = await updateEmail();
      await sendCredentialChanges(user.email, user.fullName, "email");
      res.json({ ...updatedUser, notification: "Local email successfully updated" });
      return;
    }

    const otp = await findOneAndSanitize(Verification, { key: token, type: "CHANGE_EMAIL_OTP", userId: user.id });
    if (!otp) {
      resInvalidOTP(res);
      return;
    }

    const updatedUser = await updateEmail();
    await sendCredentialChanges(user.email, user.fullName, "email");

    res.json({ ...updatedUser, notification: "Local email successfully updated" });
  } catch (err) {
    handleError(err, res);
  }
};
