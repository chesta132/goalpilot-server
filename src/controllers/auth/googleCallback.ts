import { Response, Request } from "express";
import { createAccessToken, createRefreshToken } from "../../utils/tokenUtils";
import { resAccessToken, resRefreshToken } from "../../utils/resCookie";

export const googleCallback = (req: Request, res: Response) => {
  const user = req.user!;
  const accessToken = createAccessToken({ userId: user._id, role: user.role });
  const refreshToken = createRefreshToken({ userId: user._id, role: user.role });

  res.cookie("accessToken", accessToken, resAccessToken);
  res.cookie("refreshToken", refreshToken, resRefreshToken);
  res.redirect(`${process.env.CLIENT_URL_DEV}/`);
};
