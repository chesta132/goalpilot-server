import { AuthRequest } from "../../types/types";
import { Response } from "express";
import handleError from "../../utils/handleError";
import Task from "../../models/Task";
import Goal from "../../models/Goal";
import { resGoalNotFound, resInvalidAuth, resTaskNotFound } from "../../utils/resUtils";
import { findByIdAndSanitize, updateByIdAndSanitize } from "../../utils/mongooseUtils";

export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.body;
    if (!taskId) return res.status(422).json({ message: "Task ID is Required", code: "MISSING_FIELDS" });

    const task = await findByIdAndSanitize(Task, taskId);
    if (!task) return resTaskNotFound(res);

    const goal = await findByIdAndSanitize(Goal, task.goalId);
    if (!goal) return resGoalNotFound(res);

    if (req.user.id !== goal.userId) {
      return resInvalidAuth(res);
    }

    await updateByIdAndSanitize(Task, task.id, { isRecycled: true, deleteAt: Date.now() + 24 * 60 * 60 * 1000 }, { new: true, runValidators: true });

    res.status(200).json({ _id: task._id, id: task._id, notification: `${task.task} Deleted` });
  } catch (err) {
    handleError(err, res);
  }
};
