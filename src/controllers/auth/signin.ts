import { Response, Request, NextFunction } from "express";
import passport from "passport";
import { sanitizeUserQuery } from "../../utils/sanitizeQuery";
import { createAccessToken, createRefreshToken } from "../../utils/tokenUtils";
import { resAccessToken, resRefreshToken } from "../../utils/resCookie";
import { IUserDocument } from "../../models/User";
import { ErrorResponse } from "../../types/types";

export const signin = async (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate(
    "local",
    { failureRedirect: "/signin", failureFlash: true, session: false },
    (err: Error, user: IUserDocument, info: { message: string; code: string }) => {
      if (err) {
        return res.status(500).json({ message: "Internal Server Error", code: "SERVER_ERROR", details: err.message } as ErrorResponse);
      }
      if (!user) {
        return res.status(404).json({ message: info.message, code: info.code });
      }

      req.login(user, { session: false }, (err) => {
        if (err) {
          return res.status(500).json({ message: "Internal Server Error", code: "SERVER_ERROR", details: err.message } as ErrorResponse);
        }
        const accessToken = createAccessToken({ userId: user._id, role: user.role! });
        const refreshToken = createRefreshToken({ userId: user._id, role: user.role! });

        res.cookie("accessToken", accessToken, resAccessToken);
        res.cookie("refreshToken", refreshToken, resRefreshToken);

        const userResponse = sanitizeUserQuery(user);
        res.status(200).json(userResponse);
      });
    }
  )(req, res, next);
};
