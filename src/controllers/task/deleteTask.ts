import { Response, Request } from "express";
import handleError from "../../utils/handleError";
import Task from "../../models/Task";
import Goal from "../../models/Goal";
import { resGoalNotFound, resInvalidAuth, resMissingFields, resTaskNotFound } from "../../utils/resUtils";
import { findByIdAndSanitize, updateByIdAndSanitize } from "../../utils/mongooseUtils";

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { taskId } = req.body;
    if (!taskId) {
      resMissingFields(res, "Task ID");
      return;
    }

    const task = await findByIdAndSanitize(Task, taskId);
    if (!task) {
      resTaskNotFound(res);
      return;
    }
    const goal = await findByIdAndSanitize(Goal, task.goalId);
    if (!goal) {
      resGoalNotFound(res);
      return;
    }

    if (user.id !== goal.userId) {
      resInvalidAuth(res);
      return;
    }

    await updateByIdAndSanitize(
      Task,
      task.id,
      { isRecycled: true, deleteAt: Date.now() + 24 * 60 * 60 * 1000 },
      { options: { new: true, runValidators: true } }
    );

    res.status(200).json({ _id: task._id, id: task._id, notification: `${task.task} deleted` });
  } catch (err) {
    handleError(err, res);
  }
};
