import Goal from "../../models/Goal";
import User, { IUserDocGoalsAndTasks } from "../../models/User";
import { Response, Request } from "express";
import handleError from "../../utils/handleError";
import { existingGoalsAndTasks } from "../../utils/filterExisting";
import { resGoalNotFound, resUserNotFound } from "../../utils/resUtils";
import { findAndSanitize, updateByIdAndSanitize } from "../../utils/mongooseUtils";
import { sanitizeUserQuery } from "../../utils/sanitizeQuery";

export const getUser = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const goals = await findAndSanitize(Goal, { userId: user.id }, { sort: { _id: -1 } });
    if (!goals) {
      resGoalNotFound(res);
      return;
    }

    const goalsId = goals.map((goal) => goal.id);
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

    const userResponse = { ...sanitizeUserQuery(updatedUser), goals: existingGoalsAndTasks(updatedUser.goals) };
    res.status(200).json(userResponse);
  } catch (err) {
    handleError(err, res);
  }
};
