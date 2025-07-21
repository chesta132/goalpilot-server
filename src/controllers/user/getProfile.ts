import User from "../../models/User";
import { Response, Request } from "express";
import { sanitizeUserQuery } from "../../utils/sanitizeQuery";
import handleError from "../../utils/handleError";
import { resMissingFields, resUserNotFound } from "../../utils/resUtils";
import { findOneAndSanitize } from "../../utils/mongooseUtils";

export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { username } = req.query;
    if (!username) {
      resMissingFields(res, "Username");
      return;
    }

    const userPopulated = await findOneAndSanitize(
      User,
      { username },
      { populate: { path: "goals", match: { isRecycled: false }, populate: { path: "tasks", match: { isRecycled: false } } } }
    );
    if (!userPopulated) {
      resUserNotFound(res);
      return;
    }

    const isOwner = userPopulated.id === user.id;
    const sanitizedQuery = sanitizeUserQuery(userPopulated, { isGuest: !isOwner });

    res.status(200).json(sanitizedQuery);
  } catch (err) {
    handleError(err, res);
  }
};
