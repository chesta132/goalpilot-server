import Goal, { IGoalDocTasks } from "../../models/Goal";
import Task from "../../models/Task";
import User from "../../models/User";
import { AuthRequest } from "../../types/types";
import { Response } from "express";
import handleError from "../../utils/handleError";
import { resUserNotFound } from "../../utils/resUtils";
import { findByIdAndSanitize } from "../../utils/mongooseUtils";

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const user = await findByIdAndSanitize(User, userId, { populate: { path: "goals", populate: { path: "tasks" } } });
    if (!user) return resUserNotFound(res);

    const goalsAndTasksId = (user!.goals! as IGoalDocTasks[]).reduce(
      (acc: { goalsId: string[]; tasksId: string[] }, goal) => {
        acc.goalsId.push(goal._id!.toString());
        acc.tasksId.push(...goal.tasks.map((task) => task._id!.toString()));
        return acc;
      },
      { goalsId: [], tasksId: [] }
    );

    await Task.deleteMany({ _id: { $in: goalsAndTasksId.tasksId } });
    await Goal.deleteMany({ _id: { $in: goalsAndTasksId.goalsId } });
    await User.findByIdAndDelete(user._id);

    res.redirect(`${process.env.CLIENT_URL}/signin`);
  } catch (err) {
    handleError(err, res);
  }
};
