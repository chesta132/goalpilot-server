import { Request, Response } from "express";
import handleError from "../../utils/handleError";
import { resFriendRequestNotFound, resInvalidAuth, resMissingFields, resUserNotFound } from "../../utils/resUtils";
import { findAndSanitize, findByIdAndSanitize } from "../../utils/mongooseUtils";
import Friend from "../../models/Friend";
import { sanitizeFriendPopulatedUser, sanitizeFriendQuery } from "../../utils/sanitizeQuery";

export const unFriend = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { friendId } = req.body;
    if (!friendId) {
      resMissingFields(res, "Friend ID");
      return;
    }

    const friendDoc = await findByIdAndSanitize(Friend, friendId);
    if (!friendDoc) {
      resFriendRequestNotFound(res);
      return;
    }
    if (friendDoc.userId1 !== user.id && friendDoc.userId2 !== user.id) {
      resInvalidAuth(res);
      return;
    }

    await Friend.findByIdAndDelete(friendDoc.id);

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
