import { Response, NextFunction } from "express";
import { verifyAccessToken, verifyRefreshToken, createAccessToken } from "../utils/tokenUtils";
import User, { IUserDocument } from "../models/User";
import { resAccessToken } from "../utils/resCookie";
import { AuthRequest, ErrorResponse, UserRole } from "../types/types";
import TokenBlacklist from "../models/TokenBlacklist";
import { sanitizeQuery } from "../utils/sanitizeQuery";
import handleError from "../utils/handleError";
import { resInvalidRefToken, resInvalidRole, resTokenBlacklisted, resUserNotFound } from "../utils/resUtils";

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // refresh token validation
    const refreshToken = req.cookies?.refreshToken;
    const refreshPayload = verifyRefreshToken(refreshToken);

    if (!refreshPayload) {
      return resInvalidRefToken(res);
    }

    const blacklistedToken = await TokenBlacklist.findOne({ refreshToken });
    if (blacklistedToken) {
      return resTokenBlacklisted(res);
    }

    // acccess token validation
    const accessToken = req.cookies?.accessToken;
    const payload = verifyAccessToken(accessToken);

    if (!payload) {
      // Check if refresh token exists in database
      const rawUser = await User.findById(refreshPayload!.userId);
      if (!rawUser) {
        return resInvalidRefToken(res);
      }

      const user = sanitizeQuery(rawUser) as IUserDocument;
      // Generate new access token
      const newAccessToken = createAccessToken({
        userId: user.id,
        role: user.role || "user",
      });
      // Set new access token in cookie
      res.cookie("accessToken", newAccessToken, resAccessToken);

      req.user = user;
      return next();
    }

    const rawUser = await User.findById(payload.userId);
    if (!rawUser) {
      return resUserNotFound(res);
    }

    const user = sanitizeQuery(rawUser) as IUserDocument;
    req.user = user;
    next();
  } catch (error) {
    handleError(error, res);
  }
};

export const requireRole = (roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return resInvalidRole(res);
    }

    next();
  };
};
