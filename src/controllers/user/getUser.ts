import Goal, { IGoalDocument } from "../../models/Goal";
import User from "../../models/User";
import { AuthRequest, ErrorResponse } from "../../types/types";
import { Response } from "express";
import handleError from "../../utils/handleError";
import sanitizeQuery from "../../utils/sanitizeQuery";

export const getUser = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User Not Found", code: "USER_NOT_FOUND" } as ErrorResponse);

    const goals = await Goal.find({ userId: user._id }).sort({ _id: -1 });
    const goalsId = goals.map((goal) => goal._id);
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { lastActive: new Date(), status: "online", goals: goalsId },
      { new: true, runValidators: true }
    ).populate({ path: "goals", populate: { path: "tasks" } });

    const userResponse = { ...sanitizeQuery(updatedUser), goals: updatedUser!.goals!.filter((goal) => !(goal as IGoalDocument).isRecycled) };
    res.status(200).json(userResponse);
  } catch (err) {
    console.error(err);
    handleError(err, res);
  }
};
