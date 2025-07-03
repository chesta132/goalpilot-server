import User from "../../models/User";
import { AuthRequest, ErrorResponse } from "../../types/types";
import { Response } from "express";
import sanitizeQuery from "../../utils/sanitizeQuery";
import { IGoalDocument } from "../../models/Goal";
import handleError from "../../utils/handleError";

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { username } = req.query;
    if (!username) return res.status(422).json({ message: "Username is Required", code: "MISSING_FIELDS" } as ErrorResponse);

    const user = await User.findOne({ username: username }).populate({ path: "goals", populate: { path: "tasks" } });
    if (!user) return res.status(404).json({ message: "User Not Found", code: "USER_NOT_FOUND" } as ErrorResponse);

    const userResponse = sanitizeQuery(user);
    if (user._id!.toString() !== req.user.id) {
      delete userResponse.email;
      if (userResponse.goals && userResponse.goals.length > 0)
        userResponse.goals = userResponse.goals.filter((goal: IGoalDocument) => goal.isPublic === true);
    }

    const existingGoals = { ...userResponse, goals: userResponse.goals.filter((goal: IGoalDocument) => !goal.isRecycled) };

    res.status(200).json(existingGoals);
  } catch (err) {
    console.error(err);
    handleError(err, res);
  }
};
