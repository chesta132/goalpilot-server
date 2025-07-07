import Goal from "../../models/Goal";
import Task from "../../models/Task";
import { AuthRequest } from "../../types/types";
import { Response } from "express";
import handleError from "../../utils/handleError";
import { resGoalNotFound, resInvalidAuth, resMissingFields } from "../../utils/resUtils";
import { findByIdAndSanitize, updateByIdAndSanitize, updateManyAndSanitize } from "../../utils/mongooseUtils";

export const deleteGoal = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const { goalId } = req.body;
    if (!goalId) return resMissingFields(res, "Goal id");

    const goal = await findByIdAndSanitize(Goal, goalId);
    if (!goal) return resGoalNotFound(res);

    if (user.id !== goal.userId) {
      return resInvalidAuth(res);
    }

    if (goal.tasks && goal.tasks.length > 0) {
      const taskIds = goal.tasks.map((task) => task);
      await updateManyAndSanitize(
        Task,
        { _id: { $in: taskIds } },
        { $set: { isRecycled: true, deleteAt: new Date(Date.now() + 24 * 60 * 60 * 1000) } },
        { options: { new: true, runValidators: true, sanitize: false } }
      );
    }
    await updateByIdAndSanitize(
      Goal,
      goal.id,
      { isRecycled: true, deleteAt: new Date(Date.now() + 24 * 60 * 60 * 1000) },
      { options: { new: true, runValidators: true } }
    );

    res.status(200).json({ _id: goal._id, id: goal.id, notification: `${goal.title} And ${goal.tasks.length} Tasks Deleted` });
  } catch (err) {
    handleError(err, res);
  }
};
