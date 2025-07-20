import { Request, Response } from "express";
import handleError from "../../utils/handleError";
import { resFriendRequestNotFound, resInvalidAuth, resMissingFields } from "../../utils/resUtils";
import { findByIdAndSanitize, updateByIdAndSanitize } from "../../utils/mongooseUtils";
import Friend from "../../models/Friend";
import { resSanitizedAllFriend } from "./getFriend";

export const acceptFriendReq = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { friendId } = req.body;
    if (!friendId) {
      resMissingFields(res, "Friend ID");
      return;
    }
    const friendReqToAccept = await findByIdAndSanitize(Friend, friendId);
    if (!friendReqToAccept) {
      resFriendRequestNotFound(res);
      return;
    }
    if (friendReqToAccept.userId2 !== user.id) {
      resInvalidAuth(res);
      return;
    }

    await updateByIdAndSanitize(Friend, friendReqToAccept.id, { status: "FRIEND" });
    await resSanitizedAllFriend(res, user.id, 200);
  } catch (err) {
    handleError(err, res);
  }
};
