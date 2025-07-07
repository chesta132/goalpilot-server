import { AuthRequest } from "../../types/types";
import { Response } from "express";
import handleError from "../../utils/handleError";
import Goal from "../../models/Goal";
import { resGoalNotFound, resInvalidAuth, resMissingFields, resTaskNotFound } from "../../utils/resUtils";
import Task from "../../models/Task";
import { generateReward } from "../../utils/levelingUtils";
import { findByIdAndSanitize, updateByIdAndSanitize } from "../../utils/mongooseUtils";

export const editTask = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId, task, description, isCompleted, targetDate, difficulty } = req.body;
    if (!taskId) return resMissingFields(res, "Task id");

    const taskUser = await findByIdAndSanitize(Task, taskId);
    if (!taskUser) return resTaskNotFound(res);

    const goal = await findByIdAndSanitize(Goal, taskUser.goalId);
    if (!goal) return resGoalNotFound(res);

    if (req.user.id !== goal.userId) {
      return resInvalidAuth(res);
    }

    let completedAt = null;
    if (isCompleted === true && !taskUser.isCompleted) {
      completedAt = new Date();
    }
    const rewardPoints = generateReward(req.body);

    await updateByIdAndSanitize(
      Task,
      taskUser.id,
      {
        task,
        description,
        isCompleted,
        targetDate,
        difficulty,
        rewardPoints,
        completedAt,
      },
      { options: { new: true, runValidators: true } }
    );

    res.status(200).json({ notification: `${taskUser.task} Updated` });
  } catch (err) {
    handleError(err, res);
  }
};
