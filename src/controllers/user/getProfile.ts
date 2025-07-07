import User from "../../models/User";
import { AuthRequest } from "../../types/types";
import { Response } from "express";
import { sanitizeUserQuery } from "../../utils/sanitizeQuery";
import handleError from "../../utils/handleError";
import { existingGoalsAndTasks } from "../../utils/filterExisting";
import { resMissingFields, resUserNotFound } from "../../utils/resUtils";
import { findOneAndSanitize } from "../../utils/mongooseUtils";

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { username } = req.query;
    if (!username) return resMissingFields(res, "Username");

    const user = await findOneAndSanitize(User, { username }, { populate: { path: "goals", populate: { path: "tasks" } } });
    if (!user) return resUserNotFound(res);

    const isOwner = user.id === req.user.id;
    const sanitizedQuery = sanitizeUserQuery(user, !isOwner);

    const goals = sanitizedQuery.goals ? existingGoalsAndTasks(sanitizedQuery.goals) : undefined;
    res.status(200).json({ ...sanitizedQuery, goals });
  } catch (err) {
    handleError(err, res);
  }
};
