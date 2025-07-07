import { CookieOptions } from "express";

export const resAccessToken: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 5 * 60 * 1000, // 5 minutes
};

export const resRefreshToken: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 24 * 7 * 24 * 60 * 60 * 1000, // 6 months
};

export const resRefreshTokenSessionOnly: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
};
