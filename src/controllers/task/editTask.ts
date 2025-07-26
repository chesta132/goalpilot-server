import { Response, Request } from "express";
import handleError from "../../utils/handleError";
import Goal from "../../models/Goal";
import { resGoalNotFound, resInvalidAuth, resMissingFields, resTaskNotFound } from "../../utils/resUtils";
import Task from "../../models/Task";
import { findByIdAndSanitize, updateByIdAndSanitize } from "../../utils/mongooseUtils";

export const editTask = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { taskId, task, description, isCompleted, targetDate, difficulty } = req.body;
    if (!taskId) {
      resMissingFields(res, "Task id");
      return;
    }

    const taskUser = await findByIdAndSanitize(Task, taskId);
    if (!taskUser) {
      resTaskNotFound(res);
      return;
    }

    const goal = await findByIdAndSanitize(Goal, taskUser.goalId);
    if (!goal) {
      resGoalNotFound(res);
      return;
    }

    if (user.id !== goal.userId) {
      resInvalidAuth(res);
      return;
    }

    let completedAt;
    if (isCompleted === true && !taskUser.isCompleted) {
      completedAt = new Date();
    } else if (taskUser.isCompleted && isCompleted === false) {
      completedAt = null;
    }


    const updatedTask = await updateByIdAndSanitize(
      Task,
      taskUser.id,
      {
        task,
        description,
        isCompleted,
        targetDate,
        difficulty,
        completedAt,
      },
      { options: { new: true, runValidators: true } }
    );

    res.status(200).json({ ...updatedTask, notification: `${taskUser.task} updated` });
  } catch (err) {
    handleError(err, res);
  }
};
