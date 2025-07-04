import Goal, { IGoalDocument } from "../../models/Goal";
import Task from "../../models/Task";
import { AuthRequest, ErrorResponse } from "../../types/types";
import { Response } from "express";
import handleError from "../../utils/handleError";

export const deleteGoal = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const { goalId } = req.body;
    if (!goalId) return res.status(422).json({ message: "Goal ID is Required", code: "MISSING_FIELDS" } as ErrorResponse);

    const rawGoal = await Goal.findById(goalId);
    if (!rawGoal) return res.status(404).json({ message: "Goal Not Found", code: "GOAL_NOT_FOUND" } as ErrorResponse);
    const goal = rawGoal as IGoalDocument;

    if (user.id !== goal.userId.toString()) {
      return res.status(401).json({ message: "Authentication Needed", code: "INVALID_AUTH" } as ErrorResponse);
    }

    if (goal.tasks && goal.tasks.length > 0) {
      const taskIds = goal.tasks.map((task) => task?._id || task);
      await Task.updateMany({ _id: { $in: taskIds } }, { $set: { isRecycled: true, deleteAt: Date.now() + 24 * 60 * 60 * 1000 } });
    }
    await Goal.findByIdAndUpdate(goal._id, { isRecycled: true, deleteAt: Date.now() + 24 * 60 * 60 * 1000 });

    res.status(200).json({ _id: goal._id, notification: `${goal.title} And ${goal.tasks.length} Tasks Deleted` });
  } catch (err) {
    console.error(err);
    handleError(err, res);
  }
};
