import User, { IUserDocGoalsAndTasks } from "../../models/User";
import { AuthRequest, ErrorResponse } from "../../types/types";
import { Response } from "express";
import sanitizeQuery from "../../utils/sanitizeQuery";
import { IGoalDocument } from "../../models/Goal";
import handleError from "../../utils/handleError";
import { existingGoalsAndTasks } from "../../utils/filterExisting";

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { username } = req.query;
    if (!username) return res.status(422).json({ message: "Username is Required", code: "MISSING_FIELDS" } as ErrorResponse);

    const user = await User.findOne({ username: username }).populate({ path: "goals", populate: { path: "tasks" } });
    if (!user) return res.status(404).json({ message: "User Not Found", code: "USER_NOT_FOUND" } as ErrorResponse);

    const sanitizedQuery: Omit<IUserDocGoalsAndTasks, 'email'> & { email?: string } = sanitizeQuery(user);

    if (sanitizedQuery._id !== req.user.id) {
      delete sanitizedQuery.email;
      if (sanitizedQuery.goals && sanitizedQuery.goals.length > 0)
        sanitizedQuery.goals = sanitizedQuery.goals.filter((goal: IGoalDocument) => goal.isPublic);
    }

    const existingGoals = { ...sanitizedQuery, goals: existingGoalsAndTasks(sanitizedQuery.goals) };

    res.status(200).json(existingGoals);
  } catch (err) {
    console.error(err);
    handleError(err, res);
  }
};
