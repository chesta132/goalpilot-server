import Goal, { IGoalDocTasks } from "../../models/Goal";
import Task from "../../models/Task";
import { AuthRequest, ErrorResponse } from "../../types/types";
import { Response } from "express";
import { existingTasks } from "../../utils/filterExisting";
import { sanitizeQuery } from "../../utils/sanitizeQuery";
import handleError from "../../utils/handleError";
import { resGoalNotFound, resInvalidAuth, resMissingFields } from "../../utils/resUtils";

export const getGoal = async (req: AuthRequest, res: Response) => {
  try {
    const { goalId } = req.query;
    if (!goalId) return resMissingFields(res, "Goal id");

    const tasks = await Task.find({ goalId }).sort({ _id: -1 });
    let tasksId;
    if (tasks) tasksId = tasks.map((task) => task._id);

    const rawGoal = await Goal.findByIdAndUpdate(goalId, { tasks: tasksId }, { new: true }).populate("tasks");
    if (!rawGoal) return resGoalNotFound(res)
    const goal = sanitizeQuery(rawGoal) as IGoalDocTasks;

    if (req.user.id !== goal.userId) {
      return resInvalidAuth(res)
    }

    res.status(200).json({ ...goal, tasks: existingTasks(goal.tasks) });
  } catch (err) {
    return handleError(err, res);
  }
};
