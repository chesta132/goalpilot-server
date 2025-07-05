import Goal, { IGoal } from "../../models/Goal";
import { AuthRequest, ErrorResponse } from "../../types/types";
import { Response } from "express";
import handleError from "../../utils/handleError";
import { resMissingFields } from "../../utils/resUtils";

export const createGoal = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, targetDate, isPublic, color }: IGoal = req.body;
    if (!title || !description) return resMissingFields(res, "Title and description");

    const user = req.user;

    const newGoal = await Goal.create({
      userId: user._id,
      title,
      description,
      targetDate,
      isPublic,
      color,
    });

    res.status(201).json({ ...newGoal.toObject(), notification: `${newGoal.title} Created` });
  } catch (err) {
    handleError(err, res);
  }
};
