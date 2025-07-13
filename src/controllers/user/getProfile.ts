import User from "../../models/User";
import { Response, Request } from "express";
import { sanitizeUserQuery } from "../../utils/sanitizeQuery";
import handleError from "../../utils/handleError";
import { existingGoalsAndTasks } from "../../utils/filterExisting";
import { resMissingFields, resUserNotFound } from "../../utils/resUtils";
import { findOneAndSanitize } from "../../utils/mongooseUtils";

export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = req.user as Express.User;
    const { username } = req.query;
    if (!username) {
      resMissingFields(res, "Username");
      return;
    }

    const userPopulated = await findOneAndSanitize(User, { username }, { populate: { path: "goals", populate: { path: "tasks" } } });
    if (!userPopulated) {
      resUserNotFound(res);
      return;
    }

    const isOwner = userPopulated.id === user.id;
    const sanitizedQuery = sanitizeUserQuery(userPopulated, !isOwner);

    const goals = sanitizedQuery.goals ? existingGoalsAndTasks(sanitizedQuery.goals) : undefined;
    res.status(200).json({ ...sanitizedQuery, goals });
  } catch (err) {
    handleError(err, res);
  }
};
