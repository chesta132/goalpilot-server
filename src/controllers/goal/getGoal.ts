import Goal from "../../models/Goal";
import { ITaskDocument } from "../../models/Task";
import { Response, Request } from "express";
import handleError from "../../utils/handleError";
import { resGoalNotFound, resInvalidAuth, resMissingFields } from "../../utils/resUtils";
import { findByIdAndSanitize, updateByIdAndSanitize } from "../../utils/mongooseUtils";

export const getGoal = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { goalId } = req.query;
    if (!goalId) {
      resMissingFields(res, "Goal id");
      return;
    }

    const goal = await findByIdAndSanitize(Goal, goalId.toString(), {
      populate: { path: "tasks", match: { isRecycled: false }, options: { sort: { _id: -1 } } },
    });
    if (!goal) {
      resGoalNotFound(res);
      return;
    }
    if (user.id !== goal.userId) {
      resInvalidAuth(res);
      return;
    }

    const tasks = goal.tasks as ITaskDocument[];
    const tasksId = tasks.map((task) => task._id);
    const completedTasks = tasks.filter((task) => task.isCompleted);
    const progress = completedTasks.length === 0 ? 0 : (completedTasks.length / tasks.length) * 100;
    let status;
    let completedAt = goal.completedAt;
    if (progress === 100) {
      status = "completed";
      if (!completedAt) {
        completedAt = new Date(Date.now());
      }
    }

    if (status || completedAt !== goal.completedAt || progress !== goal.progress) {
      const updatedGoal = await updateByIdAndSanitize(
        Goal,
        goal.id,
        { tasks: tasksId, progress, status, completedAt },
        { options: { new: true, runValidators: true }, populate: { path: "tasks", match: { isRecycled: false }, options: { sort: { _id: -1 } } } }
      );

      res.status(200).json(updatedGoal);
      return;
    }

    res.status(200).json(goal);
  } catch (err) {
    return handleError(err, res);
  }
};
