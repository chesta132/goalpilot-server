import { Request } from "express";
import { IUserDocument } from "../models/User";

export interface AuthRequest extends Request {
  user: IUserDocument;
}

export interface JWTPayload {
  userId: string | unknown;
  role: UserRole;
}

export type UserRole = "admin" | "user" | "moderator";
export type UserStatus = "online" | "offline";

export type CodeAuthError =
  | "INVALID_AUTH"
  | "INVALID_JWT"
  | "REFRESH_TOKEN_INVALID"
  | "ACCESS_TOKEN_INVALID"
  | "TOKEN_BLACKLISTED"
  | "INVALID_ROLE"
  | "INVALID_AUTH_METHODS"
  | "NOT_VERIFIED"
  | "INVALID_VERIFY_EMAIL_TOKEN"
  | "IS_VERIFIED";
export type CodeFieldError = "MISSING_FIELDS" | "INVALID_PASSWORD_FIELD" | "INVALID_EMAIL_FIELD" | "INVALID_USERNAME_FIELD" | "INVALID_OTP_FIELD";
export type CodeDatabaseError = "USER_NOT_FOUND" | "GOAL_NOT_FOUND" | "TASK_NOT_FOUND" | "OTP_NOT_FOUND" | "VALIDATION_ERROR" | "VERSION_CONFLICT";

export type CodeError = CodeAuthError | CodeFieldError | CodeDatabaseError | "SERVER_ERROR";

export type ErrorResponse = {
  title: string;
  message: string;
  code: CodeError;
  details?: any;
};
