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
export const resFriendRequestNotFound = (res: Response) =>
  res.status(409).json({
    message: "Friend request not found, please create new request",
    code: "FRIEND_REQUEST_NOT_FOUND",
    title: "Friend request not found",
  } as ErrorResponse);

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
export const resIsFriend = (res: Response) =>
  res
    .status(409)
    .json({ message: "Users have become friends with each other", code: "IS_FRIEND", title: "Users has become a friend" } as ErrorResponse);
export const resFriendReqPending = (res: Response) =>
  res.status(409).json({ message: "User already sent a friend request", code: "IS_PENDING", title: "Request already pending" } as ErrorResponse);
export const resIsBinded = (res: Response) =>
  res.status(409).json({ code: "IS_BINDED", message: "Account is already binded to local", title: "Account already binded" } as ErrorResponse);
export const resNotBinded = (res: Response) =>
  res.status(409).json({
    message: "Account is not bind to local yet, please bind to local first",
    code: "NOT_BINDED",
    title: "Account is not binded",
  } as ErrorResponse);

// Field
export const resMissingFields = (res: Response, fields: string) =>
  res.status(422).json({ title: "Missing fields", message: `${fields} is required`, code: "MISSING_FIELDS" } as ErrorResponse);
export const resSelfReq = (res: Response) =>
  res
    .status(409)
    .json({
      message: "Can not self request, please report this issue to GoalPilot Team",
      title: "Self request detected",
      code: "SELF_REQUEST",
    } as ErrorResponse);
