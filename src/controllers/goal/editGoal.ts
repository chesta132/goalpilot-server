import Goal, { IGoal, IGoalDocTasks, IGoalDocument } from "../../models/Goal";
import { AuthRequest, ErrorResponse } from "../../types/types";
import { Response } from "express";
import handleError from "../../utils/handleError";
import { sanitizeQuery } from "../../utils/sanitizeQuery";

export const editGoal = async (req: AuthRequest, res: Response) => {
  try {
    const { goalId, color, title, description, targetDate, progress, status, isPublic }: IGoal & { goalId: string } = req.body;
    if (!goalId) return res.status(422).json({ message: "Goal ID is Required", code: "MISSING_FIELDS" } as ErrorResponse);

    const rawGoal = await Goal.findById(goalId);
    if (!rawGoal) return res.status(404).json({ message: "Goal Not Found", code: "GOAL_NOT_FOUND" } as ErrorResponse);
    const goal = sanitizeQuery(rawGoal) as IGoalDocument;

    if (req.user.id !== goal.userId) {
      return res.status(401).json({ message: "Authentication Needed", code: "INVALID_AUTH" } as ErrorResponse);
    }

    const rawUpdatedGoal = await Goal.findByIdAndUpdate(
      goal._id,
      {
        title,
        description,
        targetDate,
        progress,
        status,
        isPublic,
        color,
      },
      { new: true, runValidators: true }
    ).populate("tasks");
    if (!rawUpdatedGoal) return res.json({ message: "Goal Not Found", code: "GOAL_NOT_FOUND" } as ErrorResponse);

    const updatedGoal = sanitizeQuery(rawUpdatedGoal) as IGoalDocTasks;
    res.status(200).json({ ...updatedGoal, notification: `${updatedGoal!.title} Updated` });
  } catch (err) {
    console.error(err);
    handleError(err, res);
  }
};
