import Goal from "../../models/Goal";
import User, { IUserDocGoalsAndTasks } from "../../models/User";
import { AuthRequest } from "../../types/types";
import { Response } from "express";
import handleError from "../../utils/handleError";
import { existingGoalsAndTasks } from "../../utils/filterExisting";
import { resGoalNotFound, resUserNotFound } from "../../utils/resUtils";
import { findAndSanitize, updateByIdAndSanitize } from "../../utils/mongooseUtils";

export const getUser = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    const goals = await findAndSanitize(Goal, { userId: user.id }, { sort: { _id: -1 } });
    if (!goals) return resGoalNotFound(res);

    const goalsId = goals.map((goal) => goal.id);
    const updatedUser = (await updateByIdAndSanitize(
      User,
      user.id,
      { lastActive: new Date(), status: "online", goals: goalsId },
      { options: { new: true, runValidators: true }, populate: { path: "goals", populate: { path: "tasks" } } }
    )) as IUserDocGoalsAndTasks | null;
    if (!updatedUser) return resUserNotFound(res);

    const userResponse = { ...updatedUser, goals: existingGoalsAndTasks(updatedUser.goals) };
    res.status(200).json(userResponse);
  } catch (err) {
    handleError(err, res);
  }
};
