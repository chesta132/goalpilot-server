import { Request, Response } from "express";
import handleError from "../../utils/handleError";
import { resFriendReqPending, resIsFriend, resMissingFields, resSelfReq, resUserNotFound } from "../../utils/resUtils";
import { createAndSanitize, findByIdAndSanitize, findOneAndSanitize } from "../../utils/mongooseUtils";
import Friend from "../../models/Friend";
import User from "../../models/User";
import { resSanitizedAllFriend } from "./getFriend";
import { capitalEachWords } from "../../utils/manipulate";

export const requestFriend = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { requestTo } = req.body;
    if (!requestTo) {
      resMissingFields(res, "Request to");
      return;
    }

    if (user.id === requestTo) {
      resSelfReq(res);
      return;
    }

    const userAsFriend = await findByIdAndSanitize(User, requestTo);

    if (!userAsFriend) {
      resUserNotFound(res);
      return;
    }

    const existingFriendship = await findOneAndSanitize(Friend, {
      $or: [
        { userId1: user.id, userId2: requestTo },
        { userId1: requestTo, userId2: user.id },
      ],
    });

    if (existingFriendship) {
      switch (existingFriendship.status) {
        case "PENDING":
          resFriendReqPending(res);
          return;
        case "FRIEND":
          resIsFriend(res);
          return;
      }
    }

    await createAndSanitize(Friend, { userId1: user.id, userId2: requestTo });
    await resSanitizedAllFriend(res, user.id, 201, `Request sent to ${capitalEachWords(userAsFriend.fullName)}`);
  } catch (err) {
    handleError(err, res);
  }
};
