import { Response, NextFunction, RequestHandler } from "express";
import { verifyAccessToken, verifyRefreshToken, createAccessToken } from "../utils/tokenUtils";
import User from "../models/User";
import { resAccessToken } from "../utils/resCookie";
import { AuthRequest, ErrorResponse, UserRole } from "../types/types";
import TokenBlacklist from "../models/TokenBlacklist";

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const accessToken = req.cookies?.accessToken;
    if (!accessToken) {
      return res.status(401).json({ message: "Access token required", code: "ACCESS_TOKEN_INVALID" } as ErrorResponse);
    }
    const payload = verifyAccessToken(accessToken);

    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token required", code: "REFRESH_TOKEN_INVALID" } as ErrorResponse);
    }
    const refreshPayload = verifyRefreshToken(refreshToken);

    const blacklistedToken = await TokenBlacklist.findOne({ refreshToken });
    if (blacklistedToken) {
      return res.json({ message: "Token has been blacklisted", code: "TOKEN_BLACKLISTED" } as ErrorResponse);
    }

    if (!payload) {
      // Try to refresh token

      if (!refreshPayload) {
        return res.status(401).json({ message: "Invalid refresh token", code: "REFRESH_TOKEN_INVALID" } as ErrorResponse);
      }

      // Check if refresh token exists in database
      const user = await User.findById(refreshPayload.userId);

      if (!user || user.refreshToken !== refreshToken) {
        return res.status(401).json({ message: "Invalid refresh token", code: "REFRESH_TOKEN_INVALID" } as ErrorResponse);
      }

      // Generate new access token
      const newAccessToken = createAccessToken({
        userId: user._id!.toString(),
        role: user.role || "user",
      });

      // Set new access token in cookie
      res.cookie("accessToken", newAccessToken, resAccessToken);

      req.user = user;
      return next();
    }

    const user = await User.findById(payload.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found", code: "USER_NOT_FOUND" } as ErrorResponse);
    }

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
