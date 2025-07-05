import User, { IUserDocGoalsAndTasks } from "../../models/User";
import { AuthRequest } from "../../types/types";
import { Response } from "express";
import { sanitizeUserQuery } from "../../utils/sanitizeQuery";
import { IGoalDocument } from "../../models/Goal";
import handleError from "../../utils/handleError";
import { existingGoalsAndTasks } from "../../utils/filterExisting";
import { resMissingFields, resUserNotFound } from "../../utils/resUtils";

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { username } = req.query;
    if (!username) return resMissingFields(res, "Username");

    const user = await User.findOne({ username: username }).populate({ path: "goals", populate: { path: "tasks" } });
    if (!user) return resUserNotFound(res);

    const isOwner = user._id!.toString() === req.user.id;
    const sanitizedQuery: Omit<IUserDocGoalsAndTasks, "email"> & { email?: string } = sanitizeUserQuery(user, !isOwner);

    if (!isOwner) {
      if (sanitizedQuery.goals && sanitizedQuery.goals.length > 0)
        sanitizedQuery.goals = sanitizedQuery.goals.filter((goal: IGoalDocument) => goal.isPublic);
    }

    res.status(200).json({ ...sanitizedQuery, goals: existingGoalsAndTasks(sanitizedQuery.goals) });
  } catch (err) {
    handleError(err, res);
  }
};
