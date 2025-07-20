import { Request, Response } from "express";
import handleError from "../../utils/handleError";
import { resMissingFields, resUserNotFound } from "../../utils/resUtils";
import { findAndSanitize, findByIdAndSanitize } from "../../utils/mongooseUtils";
import Friend from "../../models/Friend";
import User from "../../models/User";
import { sanitizeFriendPopulatedUser, sanitizeFriendQuery } from "../../utils/sanitizeQuery";

export const unFriend = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { requestTo } = req.body;
    if (!requestTo) {
      resMissingFields(res, "Request to");
      return;
    }

    if (!(await findByIdAndSanitize(User, requestTo))) {
      resUserNotFound(res);
      return;
    }

    await Friend.findOneAndDelete({
      $or: [
        { userId1: user.id, userId2: requestTo },
        { userId1: requestTo, userId2: user.id },
      ],
    });

    const allRequestsAndFriends = await findAndSanitize(
      Friend,
      { $or: [{ userId1: user.id }, { userId2: user.id }] },
      { populate: ["userId1", "userId2"], returnArray: true }
    );
    const sanitizeUser = sanitizeFriendPopulatedUser(allRequestsAndFriends!);
    const sanitizedFriend = sanitizeUser ? sanitizeUser.map((items) => sanitizeFriendQuery(items, user.id)) : [];
    res.status(200).json(sanitizedFriend);
  } catch (err) {
    handleError(err, res);
  }
};
