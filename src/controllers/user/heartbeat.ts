import { Response, Request } from "express";
import handleError from "../../utils/handleError";
import User from "../../models/User";
import { resUserNotFound } from "../../utils/resUtils";
import { updateByIdAndSanitize } from "../../utils/mongooseUtils";

export const heartbeat = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const userPopulated = await updateByIdAndSanitize(
      User,
      user.id,
      { status: "online", lastActive: new Date() },
      { options: { new: true, runValidators: true } }
    );
    if (!userPopulated) {
      resUserNotFound(res);
      return;
    }
    res.status(204).send();
  } catch (err) {
    handleError(err, res);
  }
};

// Update user status to offline if last active time exceeds threshold
const OFFLINE_THRESHOLD = 60 * 1000; // 1 minute in milliseconds
setInterval(async () => {
  try {
    const now = new Date();
    const lastOnline = new Date(now.getTime() - OFFLINE_THRESHOLD);

    const usersToUpdate = await User.find({ lastActive: { $lt: lastOnline }, status: "online" });

    if (usersToUpdate.length > 0) {
      await User.updateMany({ _id: { $in: usersToUpdate.map((user) => user._id) } }, { status: "offline" });
    }
  } catch (err) {
    console.error("Error updating offline users:", err);
  }
}, OFFLINE_THRESHOLD);
