import { Request, Response } from "express";
import handleError from "../../utils/handleError";
import { updateByIdAndSanitize } from "../../utils/mongooseUtils";
import User from "../../models/User";
import { sanitizeUserQuery } from "../../utils/sanitizeQuery";
import bcrypt from "bcrypt";
import { resMissingFields } from "../../utils/resUtils";
import { ErrorResponse } from "../../types/types";

export const bindLocal = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { email, password } = req.body;
    if (!email || !password) {
      resMissingFields(res, "Email, Password");
      return;
    }
    if (user.email) {
      res.status(409).json({ code: "IS_BINDED", message: "Account is already binded to local", title: "Account already binded" } as ErrorResponse);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const updatedUser = await updateByIdAndSanitize(
      User,
      user.id,
      { email, password: hashedPassword },
      { options: { new: true, runValidators: true } }
    );
    res.json({ ...sanitizeUserQuery(updatedUser!), notification: "Successfully link to local account" });
  } catch (err) {
    handleError(err, res);
  }
};
