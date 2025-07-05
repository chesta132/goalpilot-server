import Goal, { IGoalDocTasks } from "../../models/Goal";
import Task from "../../models/Task";
import { AuthRequest } from "../../types/types";
import { Response } from "express";
import { existingTasks } from "../../utils/filterExisting";
import handleError from "../../utils/handleError";
import { resGoalNotFound, resInvalidAuth, resMissingFields } from "../../utils/resUtils";
import { findAndSanitize, updateByIdAndSanitize } from "../../utils/mongooseUtils";

export const getGoal = async (req: AuthRequest, res: Response) => {
  try {
    const { goalId } = req.query;
    if (!goalId) return resMissingFields(res, "Goal id");

    const tasks = await findAndSanitize(Task, { goalId }, [], { sort: { _id: -1 } });
    let tasksId;
    if (tasks) tasksId = tasks.map((task) => task._id);

    const goal = (await updateByIdAndSanitize(
      Goal,
      goalId.toString(),
      { tasks: tasksId },
      { new: true, runValidators: true },
      { path: "tasks" }
    )) as IGoalDocTasks;
    if (!goal) return resGoalNotFound(res);

    if (req.user.id !== goal.userId) {
      return resInvalidAuth(res);
    }

    res.status(200).json({ ...goal, tasks: existingTasks(goal.tasks) });
  } catch (err) {
    return handleError(err, res);
  }
};
