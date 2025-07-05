import TokenBlacklist from "../../models/TokenBlacklist";
import User from "../../models/User";
import { AuthRequest, ErrorResponse } from "../../types/types";
import { verifyRefreshToken } from "../../utils/tokenUtils";
import { Response } from "express";
import jwt from "jsonwebtoken";
import handleError from "../../utils/handleError";
import { resInvalidRefToken } from "../../utils/resUtils";

export const signout = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findOneAndUpdate(req.user.id, { lastActive: Date.now(), status: "offline" }, { new: true, runValidators: true });

    const verifiedPayload = verifyRefreshToken(req.cookies?.refreshToken);
    if (!verifiedPayload) {
      return resInvalidRefToken(res);
    }
    const expIn = (verifiedPayload as jwt.JwtPayload).exp ? new Date((verifiedPayload as jwt.JwtPayload).exp! * 1000) : new Date();

    await TokenBlacklist.create({ refreshToken: req.cookies?.refreshToken, userId: user?._id, deleteAt: expIn });

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.redirect(`${process.env.CLIENT_URL}/signin`);
  } catch (error) {
    handleError(error, res);
  }
};
