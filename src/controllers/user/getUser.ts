import Goal from "../../models/Goal";
import User, { IUserDocGoalsAndTasks } from "../../models/User";
import { Response, Request } from "express";
import handleError from "../../utils/handleError";
import { existingGoalsAndTasks } from "../../utils/filterExisting";
import { resUserNotFound } from "../../utils/resUtils";
import { findAndSanitize, updateByIdAndSanitize } from "../../utils/mongooseUtils";
import { sanitizeUserQuery } from "../../utils/sanitizeQuery";

export const getUser = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const goals = await findAndSanitize(Goal, { userId: user.id }, { sort: { _id: -1 } });

    const goalsId = goals ? goals.map((goal) => goal.id) : [];
    const updatedUser = (await updateByIdAndSanitize(
      User,
      user.id,
      { lastActive: new Date(), status: "online", goals: goalsId },
      { options: { new: true, runValidators: true }, populate: { path: "goals", populate: { path: "tasks" } } }
    )) as IUserDocGoalsAndTasks | null;
    if (!updatedUser) {
      resUserNotFound(res);
      return;
    }
    const sanitizedUser = sanitizeUserQuery(updatedUser);
    sanitizedUser.goals = existingGoalsAndTasks(updatedUser.goals);
    res.status(200).json(sanitizedUser);
  } catch (err) {
    handleError(err, res);
  }
};
