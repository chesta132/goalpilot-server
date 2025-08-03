import { Request, Response } from "express";
import handleError from "../../utils/handleError";
import { findAndSanitize } from "../../utils/mongooseUtils";
import { sanitizeFriendQuery } from "../../utils/sanitizeQuery";
import Friend from "../../models/Friend";

export const resSanitizedAllFriend = async (res: Response, userId: string, status: number, notification?: string) => {
  const select = "_id username fullName status lastActive";
  const allRequestsAndFriends = await findAndSanitize(
    Friend,
    { $or: [{ userId1: userId }, { userId2: userId }] },
    {
      populate: [
        { path: "userId1", select },
        { path: "userId2", select },
      ],
      returnArray: true,
    }
  );
  const sanitizedFriend = allRequestsAndFriends?.map((items) => sanitizeFriendQuery(items, userId));
  return res.status(status).json({ data: sanitizedFriend, notification });
};

export const getFriend = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    await resSanitizedAllFriend(res, user.id, 200);
  } catch (err) {
    handleError(err, res);
  }
};
