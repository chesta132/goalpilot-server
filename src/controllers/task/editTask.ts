import { AuthRequest } from "../../types/types";
import { Response } from "express";
import handleError from "../../utils/handleError";
import Goal, { IGoalDocTasks } from "../../models/Goal";
import { resGoalNotFound, resInvalidAuth, resMissingFields, resTaskNotFound } from "../../utils/resUtils";
import Task, { ITaskDocument } from "../../models/Task";
import { sanitizeQuery } from "../../utils/sanitizeQuery";
import { generateReward } from "../../utils/levelingUtils";

export const editTask = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId, task, description, isCompleted, targetDate, difficulty } = req.body;
    if (!taskId) return resMissingFields(res, "Task id");

    const rawTaskUser = await Task.findById(taskId);
    if (!rawTaskUser) return resTaskNotFound(res);
    const taskUser = sanitizeQuery(rawTaskUser) as ITaskDocument;

    const rawGoal = await Goal.findById(taskUser.goalId);
    if (!rawGoal) return resGoalNotFound(res);
    const goal = sanitizeQuery(rawGoal) as IGoalDocTasks;

    if (req.user.id !== goal.userId) {
      return resInvalidAuth(res);
    }

    let completedAt = null;
    if (isCompleted === true && !taskUser.isCompleted) {
      completedAt = Date.now();
    }
    const rewardPoints = generateReward(req.body);

    await Task.findByIdAndUpdate(taskUser._id, {
      task,
      description,
      isCompleted,
      targetDate,
      difficulty,
      rewardPoints,
      completedAt,
    });

    res.status(200).json({ notification: `${taskUser.task} Updated` });
  } catch (err) {
    handleError(err, res);
  }
};
