import Goal, { IGoalDocTasks } from "../../models/Goal";
import Task from "../../models/Task";
import { AuthRequest, ErrorResponse } from "../../types/types";
import { Response } from "express";
import { existingTasks } from "../../utils/filterExisting";

export const getGoal = async (req: AuthRequest, res: Response) => {
  try {
    const { goalId } = req.query;
    if (!goalId) return res.status(422).json({ message: "Goal ID is Required", code: "MISSING_FIELDS" } as ErrorResponse);

    const tasks = await Task.find({ goalId }).sort({ _id: -1 });
    let tasksId;
    if (tasks) tasksId = tasks.map((task) => task._id);

    const rawGoal = await Goal.findByIdAndUpdate(goalId, { tasks: tasksId }, { new: true }).populate("tasks");
    if (!rawGoal) return res.status(404).json({ message: "Goal Not Found", code: "GOAL_NOT_FOUND" } as ErrorResponse);
    const goal = rawGoal as IGoalDocTasks;

    if (req.user.id !== goal.userId.toString()) {
      return res.status(401).json({ message: "Authentication Needed", code: "INVALID_AUTH" } as ErrorResponse);
    }

    const generatedRes = { ...goal.toObject(), tasks: existingTasks(goal.tasks) };
    res.status(200).json(generatedRes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error", code: "SERVER_ERROR", details: (err as Error).message });
  }
};
