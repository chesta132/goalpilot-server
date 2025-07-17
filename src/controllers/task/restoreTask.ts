import { Response, Request } from "express";
import handleError from "../../utils/handleError";
import Task from "../../models/Task";
import Goal from "../../models/Goal";
import { resGoalNotFound, resInvalidAuth, resMissingFields, resTaskNotFound } from "../../utils/resUtils";
import { findByIdAndSanitize, updateByIdAndSanitize } from "../../utils/mongooseUtils";

export const restoreTask = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { taskId } = req.body;
    if (!taskId) {
      resMissingFields(res, "Task id");
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

    if (goal.userId !== user.id) {
      resInvalidAuth(res);
      return;
    }

    await updateByIdAndSanitize(Task, task.id, { isRecycled: false, deleteAt: null }, { options: { new: true, runValidators: true } });
    res.status(200).json({ notification: `${task.task} restored` });
  } catch (err) {
    console.error(err);
    handleError(err, res);
  }
};
