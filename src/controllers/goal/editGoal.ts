import Goal, { IGoal, IGoalDocTasks, IGoalDocument } from "../../models/Goal";
import { AuthRequest, ErrorResponse } from "../../types/types";
import { Response } from "express";
import handleError from "../../utils/handleError";
import { sanitizeQuery } from "../../utils/sanitizeQuery";
import { resGoalNotFound, resInvalidAuth, resMissingFields } from "../../utils/resUtils";

export const editGoal = async (req: AuthRequest, res: Response) => {
  try {
    const { goalId, color, title, description, targetDate, progress, status, isPublic }: IGoal & { goalId: string } = req.body;
    if (!goalId) return resMissingFields(res, "Goal id");

    const rawGoal = await Goal.findById(goalId);
    if (!rawGoal) return resGoalNotFound(res);
    const goal = sanitizeQuery(rawGoal) as IGoalDocument;

    if (req.user.id !== goal.userId) {
      return resInvalidAuth(res);
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
    if (!rawUpdatedGoal) return resGoalNotFound(res);

    const updatedGoal = sanitizeQuery(rawUpdatedGoal) as IGoalDocTasks;
    res.status(200).json({ ...updatedGoal, notification: `${updatedGoal!.title} Updated` });
  } catch (err) {
    handleError(err, res);
  }
};
