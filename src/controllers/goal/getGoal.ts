import Goal, { IGoalDocTasks } from "../../models/Goal";
import Task from "../../models/Task";
import { Response, Request } from "express";
import { existingTasks } from "../../utils/filterExisting";
import handleError from "../../utils/handleError";
import { resGoalNotFound, resInvalidAuth, resMissingFields } from "../../utils/resUtils";
import { findAndSanitize, updateByIdAndSanitize } from "../../utils/mongooseUtils";

export const getGoal = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { goalId } = req.query;
    if (!goalId) {
      resMissingFields(res, "Goal id");
      return;
    }

    const tasks = await findAndSanitize(Task, { goalId }, { sort: { _id: -1 } });
    let tasksId;
    if (tasks) tasksId = tasks.map((task) => task._id);

    const goal = (await updateByIdAndSanitize(
      Goal,
      goalId.toString(),
      { tasks: tasksId },
      { options: { new: true, runValidators: true }, populate: { path: "tasks" } }
    )) as IGoalDocTasks;
    if (!goal) {
      resGoalNotFound(res);
      return;
    }

    if (user.id !== goal.userId) {
      resInvalidAuth(res);
      return;
    }

    res.status(200).json({ ...goal, tasks: existingTasks(goal.tasks) });
  } catch (err) {
    return handleError(err, res);
  }
};
