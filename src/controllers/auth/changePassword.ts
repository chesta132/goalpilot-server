import { Request, Response } from "express";
import handleError from "../../utils/handleError";
import { ErrorResponse } from "../../types/types";
import { resMissingFields, resUserNotFound } from "../../utils/resUtils";
import { updateByIdAndSanitize } from "../../utils/mongooseUtils";
import User from "../../models/User";
import bcrypt from "bcrypt";
import { sanitizeUserQuery } from "../../utils/sanitizeQuery";

export const changePassword = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { newPassword, oldPassword } = req.body;
    if (!newPassword || !oldPassword) {
      resMissingFields(res, "New password, old password");
      return;
    }
    if (!(await bcrypt.compare(oldPassword, user.password))) {
      res.status(409).json({ message: "Old password is wrong", code: "INVALID_OLD_PASSWORD_FIELD" } as ErrorResponse);
      return;
    }

    const password = await bcrypt.hash(newPassword, 10);

    if (await bcrypt.compare(newPassword, user.password)) {
      res.status(409).json({ message: "New password and old password can not same", code: "INVALID_NEW_PASSWORD_FIELD" } as ErrorResponse);
      return;
    }

    const updatedUser = await updateByIdAndSanitize(User, user.id, { password }, { options: { new: true, runValidators: true } });
    if (!updatedUser) {
      resUserNotFound(res);
      return;
    }
    const sanitizedUser = sanitizeUserQuery(updatedUser);

    res.json({ ...sanitizedUser, notification: "Successfully update new password" });
  } catch (err) {
    handleError(err, res);
  }
};
