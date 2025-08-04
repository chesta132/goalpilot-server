import User from "../../models/User";
import { Response, Request } from "express";
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
      {
        project: { email: 0, gmail: 0, verified: 0, createdAt: 0, password: 0, googleId: 0, timeToAllowSendEmail: 0 },
        populate: {
          path: "goals",
          match: { isRecycled: false, isPublic: true },
          populate: { path: "tasks", match: { isRecycled: false } },
        },
      }
    );
    if (!userPopulated) {
      resUserNotFound(res);
      return;
    }

    res.status(200).json(userPopulated);
  } catch (err) {
    handleError(err, res);
  }
};
