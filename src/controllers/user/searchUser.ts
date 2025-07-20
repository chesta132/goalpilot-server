import { Request, Response } from "express";
import handleError from "../../utils/handleError";
import { resMissingFields } from "../../utils/resUtils";
import { findAndSanitize } from "../../utils/mongooseUtils";
import User, { IUserDocument } from "../../models/User";
import { sanitizeUserQuery } from "../../utils/sanitizeQuery";
import { omit } from "../../utils/manipulate";

export const searchUser = async (req: Request, res: Response) => {
  try {
    const { query, offset } = req.query;
    if (!query || !offset) {
      resMissingFields(res, "Query, Offset");
      return;
    }

    const profileFound = (await findAndSanitize(
      User,
      { $or: [{ username: { $regex: query, $options: "i" } }, { fullName: { $regex: query, $options: "i" } }] },
      { returnArray: true, options: { limit: 30, skip: parseInt(offset.toString()) || 0 } }
    )) as IUserDocument[];
    const sanitizedProfile = profileFound?.map((profil) => {
      const partialProfile = omit(profil, ["goalsCompleted", "level", "points", "tasksCompleted"]);
      return sanitizeUserQuery(partialProfile as IUserDocument, { isGuest: true, deleteGoals: true });
    });
    res.json(sanitizedProfile);
  } catch (err) {
    handleError(err, res);
  }
};
