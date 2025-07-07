import Goal from "../../models/Goal";
import Task from "../../models/Task";
import { AuthRequest } from "../../types/types";
import { Response } from "express";
import handleError from "../../utils/handleError";
import { generateReward } from "../../utils/levelingUtils";
import { resGoalNotFound, resInvalidAuth, resMissingFields } from "../../utils/resUtils";
import { createAndSanitize, updateByIdAndSanitize } from "../../utils/mongooseUtils";

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const { goalId, task, description, targetDate, difficulty } = req.body;
    if (!goalId || !task || !description) return resMissingFields(res, "Goal id, task title, task description");

    const goal = await Goal.findById(goalId);
    if (!goal) {
      return resGoalNotFound(res);
    }
    if (req.user.id !== goal.userId.toString()) {
      return resInvalidAuth(res);
    }

    const rewardPoints = generateReward(req.body);
    const newTask = await createAndSanitize(Task, {
      goalId: goal._id,
      task,
      description,
      targetDate,
      difficulty,
      rewardPoints,
    });

    await updateByIdAndSanitize(
      Goal,
      goal.id,
      {
        $push: {
          tasks: { $each: [newTask._id], $position: 0 },
        },
      },
      { options: { new: true, runValidators: true } }
    );

    res.status(201).json({ ...newTask, notification: `${newTask.task} Created` });
  } catch (err) {
    handleError(err, res);
  }
};
