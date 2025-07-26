import { Request, Response } from "express";
import handleError from "../../utils/handleError";
import { resMissingFields } from "../../utils/resUtils";
import { findAndSanitize } from "../../utils/mongooseUtils";
import User, { IUserDocument } from "../../models/User";
import { sanitizeUserQuery } from "../../utils/sanitizeQuery";
import { omit } from "../../utils/manipulate";

export const buildResLimit = (data: any[], limit = 31, offset = 0, dataName?: string) => {
  const isNext = data.length > limit - 1;
  const nextOffset = isNext ? offset + limit - 1 : null;
  return { isNext, nextOffset, [dataName || "data"]: data.slice(0, -1) };
};

export const searchUser = async (req: Request, res: Response) => {
  try {
    const { query, offset } = req.query;
    if (!query || !offset) {
      resMissingFields(res, "Query, Offset");
      return;
    }
    const limit = 31;
    const skip = parseInt(offset.toString()) || 0;

    const profileFound = (await findAndSanitize(
      User,
      { $or: [{ username: { $regex: query, $options: "i" } }, { fullName: { $regex: query, $options: "i" } }] },
      { returnArray: true, options: { limit, skip } }
    )) as IUserDocument[];
    const sanitizedProfile = profileFound?.map((profil) => {
      const partialProfile = omit(profil, ["goalsCompleted", "tasksCompleted", "goals"]);
      return sanitizeUserQuery(partialProfile as IUserDocument, { isGuest: true });
    });
    res.json(buildResLimit(sanitizedProfile, limit, skip));
  } catch (err) {
    handleError(err, res);
  }
};
