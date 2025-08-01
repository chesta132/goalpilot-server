import Goal from "../../models/Goal";
import Task from "../../models/Task";
import { Response, Request } from "express";
import handleError from "../../utils/handleError";
import { resGoalNotFound, resInvalidAuth, resMissingFields } from "../../utils/resUtils";
import { createAndSanitize, updateByIdAndSanitize } from "../../utils/mongooseUtils";

export const createTask = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { goalId, task, description, targetDate, difficulty } = req.body;
    if (!goalId || !task || !description) {
      resMissingFields(res, "Goal id, task title, task description");
      return;
    }

    const goal = await Goal.findById(goalId);
    if (!goal) {
      resGoalNotFound(res);
      return;
    }
    if (user.id !== goal.userId.toString()) {
      resInvalidAuth(res);
      return;
    }

    const newTask = await createAndSanitize(Task, {
      goalId: goal.id,
      task,
      description,
      targetDate,
      difficulty,
    });

    await updateByIdAndSanitize(
      Goal,
      goal.id,
      {
        $push: {
          tasks: { $each: [newTask._id], $position: 0 },
        },
      },
      { options: { new: true, runValidators: true } }
    );

    res.status(201).json({ ...newTask, notification: `${newTask.task} created` });
  } catch (err) {
    handleError(err, res);
  }
};
