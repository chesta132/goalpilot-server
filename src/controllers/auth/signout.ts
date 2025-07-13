import TokenBlacklist from "../../models/TokenBlacklist";
import User from "../../models/User";
import { verifyRefreshToken } from "../../utils/tokenUtils";
import { Response, Request } from "express";
import jwt from "jsonwebtoken";
import handleError from "../../utils/handleError";
import { resInvalidRefToken } from "../../utils/resUtils";
import { updateOneAndSanitize } from "../../utils/mongooseUtils";

export const signout = async (req: Request, res: Response) => {
  try {
    const user = req.user as Express.User;
    const verifiedPayload = verifyRefreshToken(req.cookies?.refreshToken);
    if (!verifiedPayload) {
      resInvalidRefToken(res);
      return 
    }

    const updatedUser = await updateOneAndSanitize(
      User,
      user.id,
      { lastActive: new Date(), status: "offline" },
      { options: { new: true, runValidators: true } }
    );
    const expIn = (verifiedPayload as jwt.JwtPayload).exp ? new Date((verifiedPayload as jwt.JwtPayload).exp! * 1000) : new Date();

    await TokenBlacklist.create({ refreshToken: req.cookies?.refreshToken, userId: updatedUser?._id, deleteAt: expIn });

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.redirect(`${process.env.CLIENT_URL_DEV}/signin`);
  } catch (error) {
    handleError(error, res);
  }
};
