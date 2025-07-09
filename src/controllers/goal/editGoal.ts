import Goal, { IGoal, IGoalDocument } from "../../models/Goal";
import { AuthRequest } from "../../types/types";
import { Response } from "express";
import handleError from "../../utils/handleError";
import { sanitizeQuery } from "../../utils/sanitizeQuery";
import { resGoalNotFound, resInvalidAuth, resMissingFields } from "../../utils/resUtils";
import { updateByIdAndSanitize } from "../../utils/mongooseUtils";

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

    const updatedGoal = await updateByIdAndSanitize(
      Goal,
      goal.id,
      {
        title,
        description,
        targetDate,
        progress,
        status,
        isPublic,
        color,
      },
      { options: { new: true, runValidators: true }, populate: { path: "tasks" } }
    );
    if (!updatedGoal) return resGoalNotFound(res);

    res.status(200).json({ ...updatedGoal, notification: `${updatedGoal!.title} updated` });
  } catch (err) {
    handleError(err, res);
  }
};
