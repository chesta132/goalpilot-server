import { Response } from "express";
import { createAccessToken, createRefreshToken } from "../../utils/tokenUtils";
import { AuthRequest } from "../../types/types";
import { resAccessToken, resRefreshToken } from "../../utils/resCookie";

export const googleCallback = (req: AuthRequest, res: Response) => {
  const accessToken = createAccessToken({ userId: req.user._id, role: req.user.role });
  const refreshToken = createRefreshToken({ userId: req.user._id, role: req.user.role });

  res.cookie("accessToken", accessToken, resAccessToken);
  res.cookie("refreshToken", refreshToken, resRefreshToken);
  res.redirect(`${process.env.CLIENT_URL}/`);
};
