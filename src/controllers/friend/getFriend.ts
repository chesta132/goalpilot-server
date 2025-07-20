import { Request, Response } from "express";
import handleError from "../../utils/handleError";
import { findAndSanitize } from "../../utils/mongooseUtils";
import { sanitizeFriendPopulatedUser, sanitizeFriendQuery } from "../../utils/sanitizeQuery";
import Friend from "../../models/Friend";

export const getFriend = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
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
