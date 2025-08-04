import { Request, Response } from "express";
import handleError from "../../utils/handleError";
import { resFriendRequestNotFound, resInvalidAuth, resMissingFields } from "../../utils/resUtils";
import { findByIdAndSanitize } from "../../utils/mongooseUtils";
import Friend, { IFriendDocument, IFriendRes } from "../../models/Friend";
import { resSanitizedAllFriend } from "./getFriend";
import { capitalEachWords } from "../../utils/manipulate";
import { sanitizeFriendQuery } from "../../utils/sanitizeQuery";
import { IUserDocument } from "../../models/User";
import { SanitizedData } from "../../types/types";

export const unFriend = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { friendId } = req.body;
    if (!friendId) {
      resMissingFields(res, "Friend ID");
      return;
    }

    const friendDoc = (await findByIdAndSanitize(Friend, friendId, { populate: ["userId1", "userId2"] })) as SanitizedData<
      IFriendDocument<Partial<IUserDocument>>
    >;
    if (!friendDoc) {
      resFriendRequestNotFound(res);
      return;
    }
    if (friendDoc.userId1.id !== user.id && friendDoc.userId2.id !== user.id) {
      resInvalidAuth(res);
      return;
    }

    const saniitizedFriend = sanitizeFriendQuery(friendDoc, user.id) as IFriendRes<Partial<IUserDocument>>;

    const deletedFriend = await Friend.findByIdAndDelete(friendDoc.id);
    if (!deletedFriend) {
      resFriendRequestNotFound(res);
      return;
    }

    await resSanitizedAllFriend(res, user.id, 200, `You and ${capitalEachWords(saniitizedFriend.friend.fullName || "")} are no longer friends`);
  } catch (err) {
    handleError(err, res);
  }
};
