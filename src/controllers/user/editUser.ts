import { Request, Response } from "express";
import handleError from "../../utils/handleError";
import { updateByIdAndSanitize } from "../../utils/mongooseUtils";
import User from "../../models/User";
import { sanitizeUserQuery } from "../../utils/sanitizeQuery";
import { resUserNotFound } from "../../utils/resUtils";

export const editUser = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { username, fullName } = req.body;
    const updatedUser = await updateByIdAndSanitize(User, user.id, { username, fullName });
    if (!updatedUser) {
      resUserNotFound(res);
      return;
    }
    res.json(sanitizeUserQuery(updatedUser));
  } catch (err) {
    handleError(err, res);
  }
};
