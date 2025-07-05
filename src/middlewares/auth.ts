import { Response, NextFunction } from "express";
import { verifyAccessToken, verifyRefreshToken, createAccessToken } from "../utils/tokenUtils";
import User from "../models/User";
import { resAccessToken } from "../utils/resCookie";
import { AuthRequest, UserRole } from "../types/types";
import TokenBlacklist from "../models/TokenBlacklist";
import handleError from "../utils/handleError";
import { resInvalidRefToken, resInvalidRole, resTokenBlacklisted, resUserNotFound } from "../utils/resUtils";
import { findByIdAndSanitize } from "../utils/mongooseUtils";

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
      const user = await findByIdAndSanitize(User, refreshPayload.userId as string);
      if (!user) {
        return resInvalidRefToken(res);
      }

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

    const user = await findByIdAndSanitize(User, payload.userId as string);
    if (!user) {
      return resUserNotFound(res);
    }

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
