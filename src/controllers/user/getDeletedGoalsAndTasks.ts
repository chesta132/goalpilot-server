import { Request, Response } from "express";
import handleError from "../../utils/handleError";
import { findAndSanitize } from "../../utils/mongooseUtils";
import Goal, { IGoalDocument } from "../../models/Goal";
import { SanitizedData } from "../../types/types";
import { ITaskDocument } from "../../models/Task";

export const getDeletedGoalsAndTasks = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const goals = (await findAndSanitize(
      Goal,
      { userId: user.id },
      { sort: { _id: -1 }, returnArray: true, populate: { path: "tasks", options: { sort: { _id: -1 } }, match: { isRecycled: true } } }
    )) as SanitizedData<IGoalDocument>[];
    const deletedGoals = goals.filter((goal) => goal.isRecycled);

    const deletedTasks: SanitizedData<ITaskDocument>[] = [];
    for (const item of goals) {
      if (deletedGoals.includes(item)) continue;
      (item.tasks as SanitizedData<ITaskDocument>[]).map((task) => deletedTasks.push(task));
    }

    res.json({ deletedGoals, deletedTasks });
  } catch (err) {
    handleError(err, res);
  }
};
