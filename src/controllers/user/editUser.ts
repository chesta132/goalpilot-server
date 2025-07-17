import { Request, Response } from "express";
import handleError from "../../utils/handleError";
import { updateByIdAndSanitize } from "../../utils/mongooseUtils";
import User from "../../models/User";

export const editUser = (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { username, fullName } = req.body;
    const updatedUser = updateByIdAndSanitize(User, user.id, { username, fullName });
    res.json(updatedUser);
  } catch (err) {
    handleError(err, res);
  }
};
