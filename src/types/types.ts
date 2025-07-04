import { Request } from "express";

export interface AuthRequest extends Request {
  user: any;
}

export interface JWTPayload {
  userId: string | unknown;
  role: UserRole;
}

export type UserRole = "admin" | "user" | "moderator";
export type UserStatus = "online" | "offline";

export type CodeAuthError = "INVALID_AUTH" | "INVALID_JWT" | "REFRESH_TOKEN_INVALID" | "ACCESS_TOKEN_INVALID" | "TOKEN_BLACKLISTED" | "INVALID_ROLE";
export type CodeFieldError = "MISSING_FIELDS" | "INCORRECT_PASSWORD";
export type CodeDatabaseError =
  | "USER_NOT_FOUND"
  | "GOAL_NOT_FOUND"
  | "TASK_NOT_FOUND"
  | "EMAIL_NOT_FOUND"
  | "EMAIL_UNAVAILABLE"
  | "USERNAME_UNAVAILABLE"
  | "VALIDATION_ERROR"
  | "VERSION_CONFLICT";

export type CodeError = CodeAuthError | CodeFieldError | CodeDatabaseError | "SERVER_ERROR";

export type ErrorResponse = {
  message: string;
  code: CodeError;
  details?: any;
};
