import { Response, Request } from "express";
import handleError from "../../utils/handleError";
import Goal from "../../models/Goal";
import { resGoalNotFound, resInvalidAuth, resMissingFields, resTaskNotFound } from "../../utils/resUtils";
import Task from "../../models/Task";
import { findByIdAndSanitize } from "../../utils/mongooseUtils";

export const getTask = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.query;
    if (!taskId) {
      resMissingFields(res, "Task id");
      return;
    }

    const task = await findByIdAndSanitize(Task, taskId.toString());
    if (!task) {
      resTaskNotFound(res);
      return;
    }

    const goal = await findByIdAndSanitize(Goal, task.goalId);
    if (!goal) {
      resGoalNotFound(res);
      return;
    }

    if (req.user!.id !== goal.userId) {
      resInvalidAuth(res);
      return;
    }

    res.status(200).json(task);
  } catch (err) {
    handleError(err, res);
  }
};
