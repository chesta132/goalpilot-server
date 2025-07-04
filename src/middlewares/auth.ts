import { Response, NextFunction } from "express";
import { verifyAccessToken, verifyRefreshToken, createAccessToken } from "../utils/tokenUtils";
import User from "../models/User";
import { resAccessToken } from "../utils/resCookie";
import { AuthRequest, ErrorResponse, UserRole } from "../types/types";
import TokenBlacklist from "../models/TokenBlacklist";

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // refresh token validation
    const refreshToken = req.cookies?.refreshToken;
    const refreshPayload = verifyRefreshToken(refreshToken);

    if (!refreshPayload) {
      return res.status(401).json({ message: "Invalid refresh token", code: "REFRESH_TOKEN_INVALID" } as ErrorResponse);
    }

    const blacklistedToken = await TokenBlacklist.findOne({ refreshToken });
    if (blacklistedToken) {
      return res.status(403).json({ message: "Token has been blacklisted", code: "TOKEN_BLACKLISTED" } as ErrorResponse);
    }

    // acccess token validation
    const accessToken = req.cookies?.accessToken;
    const payload = verifyAccessToken(accessToken);

    if (!payload) {
      // Check if refresh token exists in database
      const user = await User.findById(refreshPayload!.userId);
      if (!user) {
        return res.status(401).json({ message: "Invalid refresh token", code: "REFRESH_TOKEN_INVALID" } as ErrorResponse);
      }
      // Generate new access token
      const newAccessToken = createAccessToken({
        userId: user._id!.toString(),
        role: user.role || "user",
      });
      // Set new access token in cookie
      res.cookie("accessToken", newAccessToken, resAccessToken);

      user.id = user.id.toString();
      user._id = user._id!.toString();
      req.user = user;
      return next();
    }

    const user = await User.findById(payload.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found", code: "USER_NOT_FOUND" } as ErrorResponse);
    }

    user.id = user.id.toString();
    user._id = user._id!.toString();

    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ message: "Internal Server Eror", code: "SERVER_ERROR", details: (error as Error).message } as ErrorResponse);
  }
};

export const requireRole = (roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions", code: "INVALID_ROLE" } as ErrorResponse);
    }

    next();
  };
};
