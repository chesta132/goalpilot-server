import Goal from "../../models/Goal";
import Task from "../../models/Task";
import { Response, Request } from "express";
import handleError from "../../utils/handleError";
import { resGoalNotFound, resInvalidAuth, resMissingFields } from "../../utils/resUtils";
import { findByIdAndSanitize, updateByIdAndSanitize, updateManyAndSanitize } from "../../utils/mongooseUtils";

export const deleteGoal = async (req: Request, res: Response) => {
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

    if (user.id !== goal.userId) {
      resInvalidAuth(res);
      return;
    }

    if (goal.tasks && goal.tasks.length > 0) {
      const taskIds = goal.tasks;
      await updateManyAndSanitize(
        Task,
        { _id: { $in: taskIds } },
        // prevent actual delete goal without throw em to trash/recycle
        { $set: { deleteAt: new Date(Date.now() + 24 * 60 * 60 * 1000) } },
        { options: { new: true, runValidators: true, sanitize: false } }
      );
    }
    await updateByIdAndSanitize(
      Goal,
      goal.id,
      { isRecycled: true, deleteAt: new Date(Date.now() + 24 * 60 * 60 * 1000) },
      { options: { new: true, runValidators: true } }
    );

    res.status(200).json({ _id: goal._id, id: goal.id, notification: `${goal.title} deleted` });
  } catch (err) {
    handleError(err, res);
  }
};
