import { Request, Response } from "express";
import handleError from "../../utils/handleError";
import { updateByIdAndSanitize } from "../../utils/mongooseUtils";
import User from "../../models/User";
import { sanitizeUserQuery } from "../../utils/sanitizeQuery";
import bcrypt from "bcrypt";
import { resIsBinded, resMissingFields } from "../../utils/resUtils";

export const bindLocal = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { email, password } = req.body;
    if (!email || !password) {
      resMissingFields(res, "Email, Password");
      return;
    }
    if (user.email) {
      resIsBinded(res);
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const updatedUser = await updateByIdAndSanitize(
      User,
      user.id,
      { email, password: hashedPassword },
      { options: { new: true, runValidators: true } }
    );
    const sanitizedUser = sanitizeUserQuery(updatedUser!);
    res.json({ ...sanitizedUser, notification: "Successfully link to local account" });
  } catch (err) {
    handleError(err, res);
  }
};
