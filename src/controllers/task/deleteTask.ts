import { AuthRequest } from "../../types/types";
import { Response } from "express";
import handleError from "../../utils/handleError";
import Task, { ITaskDocument } from "../../models/Task";
import Goal, { IGoalDocument } from "../../models/Goal";
import { resGoalNotFound, resInvalidAuth, resTaskNotFound } from "../../utils/resUtils";
import { sanitizeQuery } from "../../utils/sanitizeQuery";

export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.body;
    if (!taskId) return res.status(422).json({ message: "Task ID is Required", code: "MISSING_FIELDS" });

    const rawTask = await Task.findById(taskId);
    if (!rawTask) return resTaskNotFound(res);
    const task = sanitizeQuery(rawTask) as ITaskDocument;

    const rawGoal = await Goal.findById(task.goalId);
    if (!rawGoal) return resGoalNotFound(res);
    const goal = sanitizeQuery(rawGoal) as IGoalDocument;

    if (req.user.id !== goal.userId) {
      return resInvalidAuth(res);
    }

    await Task.findByIdAndUpdate(task._id, { isRecycled: true, deleteAt: Date.now() + 24 * 60 * 60 * 1000 });

    res.status(200).json({ _id: task._id, id: task._id, notification: `${task.task} Deleted` });
  } catch (err) {
    handleError(err, res);
  }
};
