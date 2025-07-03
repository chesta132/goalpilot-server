import jwt from "jsonwebtoken";
import type { StringValue } from "ms";
import { UserRole } from "../types/types";

export interface JWTPayload {
  userId: string | unknown;
  role: UserRole;
}

export const createAccessToken = (payload: JWTPayload, expiresIn?: StringValue | number) => {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, { expiresIn: expiresIn || "5m" });
};

export const createRefreshToken = (payload: JWTPayload, expiresIn?: StringValue | number) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, { expiresIn: expiresIn || "24w" });
};

export const verifyAccessToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as JWTPayload;
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as JWTPayload;
  } catch (error) {
    return null;
  }
};
