import { Response, Request, NextFunction } from "express";
import { verifyAccessToken, verifyRefreshToken, createAccessToken } from "../utils/tokenUtils";
import User from "../models/User";
import { resAccessToken } from "../utils/resCookie";
import { UserRole } from "../types/types";
import TokenBlacklist from "../models/TokenBlacklist";
import handleError from "../utils/handleError";
import { resInvalidRefToken, resInvalidRole, resInvalidVerified, resTokenBlacklisted, resUserNotFound } from "../utils/resUtils";
import { findByIdAndSanitize } from "../utils/mongooseUtils";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // refresh token validation
    const refreshToken = req.cookies?.refreshToken;
    const refreshPayload = verifyRefreshToken(refreshToken);

    if (!refreshPayload) {
      resInvalidRefToken(res);
      return;
    }

    const blacklistedToken = await TokenBlacklist.findOne({ refreshToken });
    if (blacklistedToken) {
      resTokenBlacklisted(res);
      return;
    }

    // acccess token validation
    const accessToken = req.cookies?.accessToken;
    const payload = verifyAccessToken(accessToken);

    if (!payload) {
      // Check if refresh token exists in database
      const user = await findByIdAndSanitize(User, refreshPayload.userId as string);
      if (!user) {
        resInvalidRefToken(res);
        return;
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
      resUserNotFound(res);
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    handleError(error, res);
  }
};

export const requireVerified = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.verified) next();
  else resInvalidVerified(res);
};

export const requireRole = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user!;
    if (!roles.includes(user.role)) {
      resInvalidRole(res);
      return;
    }

    next();
  };
};
