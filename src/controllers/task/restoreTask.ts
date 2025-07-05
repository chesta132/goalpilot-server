import { AuthRequest } from "../../types/types";
import { Response } from "express";
import handleError from "../../utils/handleError";
import Task from "../../models/Task";
import Goal from "../../models/Goal";
import { resGoalNotFound, resInvalidAuth, resMissingFields, resTaskNotFound } from "../../utils/resUtils";
import { findByIdAndSanitize, updateByIdAndSanitize } from "../../utils/mongooseUtils";

export const restoreTask = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.body;
    if (!taskId) return resMissingFields(res, "Task id");

    const task = await findByIdAndSanitize(Task, taskId);
    if (!task) return resTaskNotFound(res);

    const goal = await findByIdAndSanitize(Goal, task.goalId);
    if (!goal) return resGoalNotFound(res);

    if (goal.userId !== req.user.id) return resInvalidAuth(res);

    await updateByIdAndSanitize(Task, task.id, { isRecycled: false, deleteAt: null }, { new: true, runValidators: true });
    res.status(200).json({ notification: `${task.task} Restored` });
  } catch (err) {
    console.error(err);
    handleError(err, res);
  }
};
