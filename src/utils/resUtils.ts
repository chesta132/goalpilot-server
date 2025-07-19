import { Response } from "express";
import { ErrorResponse } from "../types/types";

// Not found
export const resUserNotFound = (res: Response) =>
  res
    .status(404)
    .json({ title: "User not found", message: "User not found, please back to dashboard or sign in page", code: "USER_NOT_FOUND" } as ErrorResponse);
export const resGoalNotFound = (res: Response) =>
  res.status(404).json({ title: "Goal not found", message: "Goal not found, please back to dashboard", code: "GOAL_NOT_FOUND" } as ErrorResponse);
export const resTaskNotFound = (res: Response) =>
  res.status(404).json({ title: "Task not found", message: "Task not found, please back to dashboard", code: "TASK_NOT_FOUND" } as ErrorResponse);

// Invalid
export const resInvalidAuth = (res: Response) =>
  res.status(401).json({
    title: "Authentication needed",
    message: "Authentication needed please back to dashboard or change your account",
    code: "INVALID_AUTH",
  } as ErrorResponse);
export const resInvalidRefToken = (res: Response) =>
  res.status(401).json({
    title: "Invalid session",
    message: "Invalid refresh token please re-sign in to refresh your session",
    code: "REFRESH_TOKEN_INVALID",
  } as ErrorResponse);
export const resTokenBlacklisted = (res: Response) =>
  res.status(403).json({
    title: "Invalid session",
    message: "Refresh token has been blacklisted due to sign out on previous session",
    code: "TOKEN_BLACKLISTED",
  } as ErrorResponse);
export const resInvalidRole = (res: Response) =>
  res.status(403).json({
    title: "Insufficient permissions",
    message: "Insufficient permissions, you don't have permission to access this content",
    code: "INVALID_ROLE",
  } as ErrorResponse);
export const resInvalidVerified = (res: Response) =>
  res.status(403).json({
    title: "Insufficient permissions",
    message: "Insufficient permissions, please verify you account",
    code: "NOT_VERIFIED",
  } as ErrorResponse);
export const resInvalidOTP = (res: Response) =>
  res.status(400).json({
    title: "Invalid OTP",
    message: "Invalid or expired OTP. Please request a new OTP code.",
    code: "INVALID_OTP_FIELD",
  } as ErrorResponse);
export const resIsVerified = (res: Response) =>
  res.status(400).json({ message: "Your email has been verified", code: "IS_VERIFIED", title: "You has been verified" } as ErrorResponse);

// Field
export const resMissingFields = (res: Response, fields: string) =>
  res.status(422).json({ title: "Missing fields", message: `${fields} is required`, code: "MISSING_FIELDS" } as ErrorResponse);
