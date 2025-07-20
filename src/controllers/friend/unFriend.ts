import { Request, Response } from "express";
import handleError from "../../utils/handleError";
import { resFriendRequestNotFound, resInvalidAuth, resMissingFields } from "../../utils/resUtils";
import { findByIdAndSanitize } from "../../utils/mongooseUtils";
import Friend from "../../models/Friend";
import { resSanitizedAllFriend } from "./getFriend";

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
    await resSanitizedAllFriend(res, user.id, 200);
  } catch (err) {
    handleError(err, res);
  }
};
