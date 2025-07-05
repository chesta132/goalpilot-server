import Goal from "../../models/Goal";
import Task from "../../models/Task";
import { AuthRequest } from "../../types/types";
import { Response } from "express";
import handleError from "../../utils/handleError";
import { resGoalNotFound, resInvalidAuth, resMissingFields } from "../../utils/resUtils";
import { findByIdAndSanitize, updateByIdAndSanitize, updateManyAndSanitize } from "../../utils/mongooseUtils";

export const restoreGoal = async (req: AuthRequest, res: Response) => {
  try {
    const { goalId } = req.body;
    if (!goalId) return resMissingFields(res, "Goal id");

    const goal = await findByIdAndSanitize(Goal, goalId);
    if (!goal) return resGoalNotFound(res);

    if (goal.userId !== req.user.id) return resInvalidAuth(res);

    await updateManyAndSanitize(
      Task,
      { _id: { $in: goal.tasks } },
      { isRecycled: false, deleteAt: null },
      { new: true, runValidators: true, sanitize: false }
    );
    await updateByIdAndSanitize(Goal, goal.id, { isRecycled: false, deleteAt: null }, { new: true, runValidators: true }, { path: "tasks" });

    res.status(200).json({ notification: `${goal.title} Restored` });
  } catch (err) {
    handleError(err, res);
  }
};
