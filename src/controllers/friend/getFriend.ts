import { Request, Response } from "express";
import handleError from "../../utils/handleError";
import { findAndSanitize } from "../../utils/mongooseUtils";
import { sanitizeFriendPopulatedUser, sanitizeFriendQuery } from "../../utils/sanitizeQuery";
import Friend from "../../models/Friend";

export const resSanitizedAllFriend = async (res: Response, userId: string, status: number) => {
  const allRequestsAndFriends = await findAndSanitize(
    Friend,
    { $or: [{ userId1: userId }, { userId2: userId }] },
    { populate: ["userId1", "userId2"], returnArray: true }
  );
  const sanitizedUser = sanitizeFriendPopulatedUser(allRequestsAndFriends!);
  const sanitizedFriend = sanitizedUser.map((items) => sanitizeFriendQuery(items, userId));
  return res.status(status).json(sanitizedFriend);
};

export const getFriend = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    await resSanitizedAllFriend(res, user.id, 200);
  } catch (err) {
    handleError(err, res);
  }
};
