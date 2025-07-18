import { Response, Request, NextFunction } from "express";
import passport from "passport";
import { sanitizeUserQuery } from "../../utils/sanitizeQuery";
import { createAccessToken, createRefreshToken } from "../../utils/tokenUtils";
import { resAccessToken, resRefreshToken, resRefreshTokenSessionOnly } from "../../utils/resCookie";
import { IUserDocument } from "../../models/User";
import handleError from "../../utils/handleError";
import { ErrorResponse } from "../../types/types";
import { resInvalidVerified } from "../../utils/resUtils";

export const signin = async (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate(
    "local",
    { failureRedirect: "/signin", failureFlash: true, session: false },
    (err: Error, user: IUserDocument, info: ErrorResponse) => {
      if (err) {
        return handleError(err, res);
      }
      if (!user) {
        return res.status(404).json({ message: info.message, code: info.code, title: info.title });
      }
      
      req.login(user, { session: false }, (err) => {
        if (err) {
          return handleError(err, res);
        }
        const rememberMe: boolean = req.body.rememberMe;
        
        const accessToken = createAccessToken({ userId: user._id, role: user.role! });
        const refreshToken = createRefreshToken({ userId: user._id, role: user.role! }, rememberMe ? undefined : "3d");
        
        res.cookie("accessToken", accessToken, resAccessToken);
        res.cookie("refreshToken", refreshToken, rememberMe ? resRefreshToken : resRefreshTokenSessionOnly);
        
        res.status(200).json(user);
      });
    }
  )(req, res, next);
};
