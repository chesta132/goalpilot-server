import Goal from "../../models/Goal";
import User, { IUserDocGoalsAndTasks } from "../../models/User";
import { AuthRequest, ErrorResponse } from "../../types/types";
import { Response } from "express";
import handleError from "../../utils/handleError";
import { sanitizeUserQuery } from "../../utils/sanitizeQuery";
import { existingGoalsAndTasks } from "../../utils/filterExisting";

export const getUser = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    const goals = await Goal.find({ userId: user._id }).sort({ _id: -1 });
    const goalsId = goals.map((goal) => goal._id);
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { lastActive: new Date(), status: "online", goals: goalsId },
      { new: true, runValidators: true }
    ).populate({ path: "goals", populate: { path: "tasks" } });
    if (!updatedUser) return res.json({ message: "User Not Found", code: "USER_NOT_FOUND" } as ErrorResponse);

    const sanitizedQuery: IUserDocGoalsAndTasks = sanitizeUserQuery(updatedUser);

    const userResponse = { ...sanitizedQuery, goals: existingGoalsAndTasks(sanitizedQuery.goals) };
    res.status(200).json(userResponse);
  } catch (err) {
    handleError(err, res);
  }
};
