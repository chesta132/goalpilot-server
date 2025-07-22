import Goal from "../../models/Goal";
import Task from "../../models/Task";
import { Response, Request } from "express";
import handleError from "../../utils/handleError";
import { resGoalNotFound, resInvalidAuth, resMissingFields } from "../../utils/resUtils";
import { findByIdAndSanitize, updateByIdAndSanitize, updateManyAndSanitize } from "../../utils/mongooseUtils";

export const restoreGoal = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { goalId } = req.body;
    if (!goalId) {
      resMissingFields(res, "Goal id");
      return;
    }

    const goal = await findByIdAndSanitize(Goal, goalId);
    if (!goal) {
      resGoalNotFound(res);
      return;
    }

    if (goal.userId !== user.id) {
      resInvalidAuth(res);
      return;
    }

    await updateManyAndSanitize(Task, { _id: { $in: goal.tasks } }, { deleteAt: null }, { options: { runValidators: true, sanitize: false } });
    await updateByIdAndSanitize(
      Goal,
      goal.id,
      { isRecycled: false, deleteAt: null },
      { options: { new: true, runValidators: true }, populate: { path: "tasks", match: { isRecycled: false } } }
    );

    res.status(200).json({ notification: `${goal.title} restored` });
  } catch (err) {
    handleError(err, res);
  }
};
