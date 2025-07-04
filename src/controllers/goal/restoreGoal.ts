import Goal, { IGoalDocument } from "../../models/Goal";
import Task from "../../models/Task";
import { AuthRequest, ErrorResponse } from "../../types/types";
import { Response } from "express";
import handleError from "../../utils/handleError";
import { sanitizeQuery } from "../../utils/sanitizeQuery";

export const restoreGoal = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.body.goalId) return res.status(422).json({ message: "Goal ID is Required", code: "MISSING_FIELDS" } as ErrorResponse);
    const rawGoal = await Goal.findById(req.body.goalId);
    if (!rawGoal) return res.status(404).json({ message: "Goal Not Found", code: "GOAL_NOT_FOUND" } as ErrorResponse);
    const goal = sanitizeQuery(rawGoal) as IGoalDocument;

    if (goal.userId !== req.user.id)
      return res.status(401).json({ message: "Authentication Needed", code: "INVALID_AUTH" } as ErrorResponse);

    await Task.updateMany({ _id: { $in: goal.tasks } }, { isRecycled: false, deleteAt: null }, { runValidators: true });
    await Goal.findByIdAndUpdate(goal._id, { isRecycled: false, deleteAt: null }, { new: true, runValidators: true }).populate("tasks");

    res.status(200).json({ notification: `${goal.title} Restored` });
  } catch (err) {
    console.error(err);
    handleError(err, res);
  }
};
