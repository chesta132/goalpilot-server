import Goal, { IGoalDocument } from "../../models/Goal";
import Task from "../../models/Task";
import { AuthRequest, ErrorResponse } from "../../types/types";
import { Response } from "express";
import handleError from "../../utils/handleError";
import { sanitizeQuery } from "../../utils/sanitizeQuery";
import { resGoalNotFound, resInvalidAuth, resMissingFields } from "../../utils/resUtils";

export const deleteGoal = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const { goalId } = req.body;
    if (!goalId) return resMissingFields(res, "Goal id");

    const rawGoal = await Goal.findById(goalId);
    if (!rawGoal) return resGoalNotFound(res);
    const goal = sanitizeQuery(rawGoal) as IGoalDocument;

    if (user.id !== goal.userId) {
      return resInvalidAuth(res);
    }

    if (goal.tasks && goal.tasks.length > 0) {
      const taskIds = goal.tasks.map((task) => task?._id || task);
      await Task.updateMany({ _id: { $in: taskIds } }, { $set: { isRecycled: true, deleteAt: Date.now() + 24 * 60 * 60 * 1000 } });
    }
    await Goal.findByIdAndUpdate(goal._id, { isRecycled: true, deleteAt: Date.now() + 24 * 60 * 60 * 1000 });

    res.status(200).json({ _id: goal._id, id: goal._id, notification: `${goal.title} And ${goal.tasks.length} Tasks Deleted` });
  } catch (err) {
    handleError(err, res);
  }
};
