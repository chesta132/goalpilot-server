import Goal, { IGoalDocument } from "../../models/Goal";
import Task from "../../models/Task";
import { AuthRequest, ErrorResponse } from "../../types/types";
import { Response } from "express";
import handleError from "../../utils/handleError";
import { sanitizeQuery } from "../../utils/sanitizeQuery";
import { resGoalNotFound, resInvalidAuth, resMissingFields } from "../../utils/resUtils";

export const restoreGoal = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.body.goalId) return resMissingFields(res, "Goal id");
    const rawGoal = await Goal.findById(req.body.goalId);
    if (!rawGoal) return resGoalNotFound(res);
    const goal = sanitizeQuery(rawGoal) as IGoalDocument;

    if (goal.userId !== req.user.id) return resInvalidAuth(res);

    await Task.updateMany({ _id: { $in: goal.tasks } }, { isRecycled: false, deleteAt: null }, { runValidators: true });
    await Goal.findByIdAndUpdate(goal._id, { isRecycled: false, deleteAt: null }, { new: true, runValidators: true }).populate("tasks");

    res.status(200).json({ notification: `${goal.title} Restored` });
  } catch (err) {
    handleError(err, res);
  }
};
