import TokenBlacklist from "../../models/TokenBlacklist";
import User from "../../models/User";
import { verifyRefreshToken } from "../../utils/tokenUtils";
import { Response, Request } from "express";
import jwt from "jsonwebtoken";
import handleError from "../../utils/handleError";
import { resInvalidRefToken, resUserNotFound } from "../../utils/resUtils";
import { updateByIdAndSanitize } from "../../utils/mongooseUtils";

export const signout = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const verifiedPayload = verifyRefreshToken(req.cookies?.refreshToken) as jwt.JwtPayload | null;
    if (!verifiedPayload) {
      resInvalidRefToken(res);
      return;
    }

    const updatedUser = await updateByIdAndSanitize(
      User,
      user.id,
      { lastActive: new Date(), status: "offline" },
      { options: { new: true, runValidators: true } }
    );
    if (!updatedUser) {
      resUserNotFound(res);
      return;
    }
    const expIn = new Date(verifiedPayload.exp! * 1000);

    await TokenBlacklist.create({ refreshToken: req.cookies.refreshToken, userId: updatedUser._id, deleteAt: expIn });

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.redirect(`${process.env.CLIENT_URL_DEV}/signin`);
  } catch (error) {
    handleError(error, res);
  }
};
