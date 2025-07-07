import { Response } from "express";
import { ErrorResponse } from "../types/types";

// Not found
export const resUserNotFound = (res: Response) => res.status(404).json({ message: "User not found", code: "USER_NOT_FOUND" } as ErrorResponse);
export const resGoalNotFound = (res: Response) => res.status(404).json({ message: "Goal not found", code: "GOAL_NOT_FOUND" } as ErrorResponse);
export const resTaskNotFound = (res: Response) => res.status(404).json({ message: "Task not found", code: "TASK_NOT_FOUND" } as ErrorResponse);

// Invalid
export const resInvalidAuth = (res: Response) => res.status(401).json({ message: "Authentication needed", code: "INVALID_AUTH" } as ErrorResponse);
export const resInvalidRefToken = (res: Response) =>
  res.status(401).json({ message: "Invalid refresh token", code: "REFRESH_TOKEN_INVALID" } as ErrorResponse);
export const resTokenBlacklisted = (res: Response) =>
  res.status(403).json({ message: "Token has been blacklisted", code: "TOKEN_BLACKLISTED" } as ErrorResponse);
export const resInvalidRole = (res: Response) => res.status(403).json({ message: "Insufficient permissions", code: "INVALID_ROLE" } as ErrorResponse);

// Field
export const resMissingFields = (res: Response, fields: string) =>
  res.status(422).json({ message: `${fields} is required`, code: "MISSING_FIELDS" } as ErrorResponse);
