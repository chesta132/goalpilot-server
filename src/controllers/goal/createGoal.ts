import Goal, { IGoal } from "../../models/Goal";
import { Response, Request } from "express";
import handleError from "../../utils/handleError";
import { resMissingFields } from "../../utils/resUtils";
import { createAndSanitize, updateByIdAndSanitize } from "../../utils/mongooseUtils";
import User from "../../models/User";

export const createGoal = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { title, description, targetDate, isPublic, color, status }: IGoal = req.body;
    if (!title || !description) {
      resMissingFields(res, "Title and description");
      return;
    }

    const newGoal = await createAndSanitize(Goal, {
      userId: user.id,
      title,
      description,
      targetDate,
      isPublic,
      color,
      status,
    });

    await updateByIdAndSanitize(User, user.id, {
      $push: {
        goals: { $each: [newGoal.id], $position: 0 },
      },
    });

    res.status(201).json({ ...newGoal, notification: `${newGoal.title} created` });
  } catch (err) {
    handleError(err, res);
  }
};
