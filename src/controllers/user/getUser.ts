import User, { IUserDocGoalsAndTasks } from "../../models/User";
import { Response, Request } from "express";
import handleError from "../../utils/handleError";
import { resUserNotFound } from "../../utils/resUtils";
import { updateByIdAndSanitize } from "../../utils/mongooseUtils";
import { sanitizeUserQuery } from "../../utils/sanitizeQuery";

export const getUser = async (req: Request, res: Response) => {
  try {
    const user = req.user!;

    const updatedUser = (await updateByIdAndSanitize(
      User,
      user.id,
      { lastActive: new Date(), status: "online" },
      {
        options: { new: true, runValidators: true },
        populate: {
          path: "goals",
          match: { isRecycled: false },
          options: { sort: { _id: -1 } },
          populate: { path: "tasks", match: { isRecycled: false }, options: { sort: { _id: -1 } } },
        },
      }
    )) as IUserDocGoalsAndTasks | null;
    if (!updatedUser) {
      resUserNotFound(res);
      return;
    }
    const sanitizedUser = sanitizeUserQuery(updatedUser);
    res.status(200).json(sanitizedUser);
  } catch (err) {
    handleError(err, res);
  }
};
