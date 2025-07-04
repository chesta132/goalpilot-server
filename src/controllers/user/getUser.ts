import Goal from "../../models/Goal";
import User, { IUserDocGoalsAndTasks } from "../../models/User";
import { AuthRequest } from "../../types/types";
import { Response } from "express";
import handleError from "../../utils/handleError";
import sanitizeQuery from "../../utils/sanitizeQuery";
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

    const sanitizedQuery: IUserDocGoalsAndTasks = sanitizeQuery(updatedUser);

    const userResponse = { ...sanitizedQuery, goals: existingGoalsAndTasks(sanitizedQuery.goals) };
    res.status(200).json(userResponse);
  } catch (err) {
    console.error(err);
    handleError(err, res);
  }
};
