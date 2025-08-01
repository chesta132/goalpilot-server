import { Document, ObjectId } from "mongoose";

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
  | "INVALID_VERIFY_EMAIL_TOKEN"
  | "NOT_VERIFIED"
  | "IS_VERIFIED"
  | "IS_BINDED"
  | "NOT_BINDED";
export type CodeFieldError =
  | "MISSING_FIELDS"
  | "INVALID_PASSWORD_FIELD"
  | "INVALID_EMAIL_FIELD"
  | "INVALID_USERNAME_FIELD"
  | "INVALID_OTP_FIELD"
  | "INVALID_NEW_EMAIL_FIELD"
  | "INVALID_NEW_PASSWORD_FIELD"
  | "INVALID_OLD_PASSWORD_FIELD"
  | "INVALID_SEARCH_TYPE";
export type CodeDatabaseError =
  | "USER_NOT_FOUND"
  | "GOAL_NOT_FOUND"
  | "TASK_NOT_FOUND"
  | "OTP_NOT_FOUND"
  | "VALIDATION_ERROR"
  | "VERSION_CONFLICT"
  | "IS_FRIEND"
  | "IS_PENDING"
  | "FRIEND_REQUEST_NOT_FOUND";
export type CodeClientError = "TOO_MUCH_REQUEST" | "SELF_REQUEST";

export type CodeError = CodeAuthError | CodeFieldError | CodeDatabaseError | CodeClientError | "SERVER_ERROR";

export type ErrorResponse = {
  title?: string;
  message: string;
  code: CodeError;
  details?: any;
};

export type SanitizedData<T> = Omit<
  {
    [K in keyof T]: T[K] extends ObjectId ? string : T[K];
  },
  keyof Document
> & { id: string; _id: string };

export type Combination<T extends string, U extends string> = `${T}_${U}`;

export type SearchType =
  | "ALL"
  | "PROFILES"
  | "GOALS"
  | "TASKS"
  | Combination<"PROFILES", "GOALS">
  | Combination<"PROFILES", "TASKS">
  | Combination<"GOALS", "TASKS">;
