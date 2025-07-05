import { Response } from "express";
import { ErrorResponse } from "../types/types";

export default function handleError(err: unknown, res: Response) {
  if (err instanceof Error) {
    console.error("Error found:\n", err);
    if (err && err.name === "ValidationError") {
      res.status(400).json({
        message: err.message,
        name: "Validation Error",
        code: "VALIDATION_ERROR",
      } as ErrorResponse);
    } else if (err.name === "VersionError") {
      res.status(409).json({
        name: "Version Error",
        message: "Conflict: This item was modified by another user/process. Please refresh and try again.",
        code: "VERSION_CONFLICT",
      } as ErrorResponse);
    } else res.status(500).json({ message: "Internal Server Error", code: "SERVER_ERROR", details: err.message } as ErrorResponse);
  } else {
    console.error("Caught unknown error type:", err);
    res.status(500).json({ message: "Internal Server Error", code: "SERVER_ERROR" } as ErrorResponse);
  }
}
