import { AuthRequest } from "../../types/types";
import { Response } from "express";
import handleError from "../../utils/handleError";
import Task, { ITaskDocument } from "../../models/Task";
import Goal, { IGoalDocTasks } from "../../models/Goal";
import { resGoalNotFound, resInvalidAuth, resMissingFields, resTaskNotFound } from "../../utils/resUtils";
import { sanitizeQuery } from "../../utils/sanitizeQuery";

export const restoreTask = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.body;
    if (!taskId) return resMissingFields(res, "Task id");

    const rawTask = await Task.findById(taskId);
    if (!rawTask) return resTaskNotFound(res);
    const task = sanitizeQuery(rawTask) as ITaskDocument;

    const rawGoal = await Goal.findById(task.goalId);
    if (!rawGoal) return resGoalNotFound(res);
    const goal = sanitizeQuery(rawGoal) as IGoalDocTasks;

    if (goal.userId !== req.user.id) return resInvalidAuth(res);

    await Task.findByIdAndUpdate(task._id, { isRecycled: false, deleteAt: null }, { new: true, runValidators: true });
    res.status(200).json({ notification: `${task.task} Restored` });
  } catch (err) {
    console.error(err);
    handleError(err, res);
  }
};
