import { Response, Request } from "express";
import handleError from "../../utils/handleError";
import User from "../../models/User";
import bcrypt from "bcrypt";
import { createAccessToken, createRefreshToken } from "../../utils/tokenUtils";
import { resAccessToken, resRefreshToken, resRefreshTokenSessionOnly } from "../../utils/resCookie";
import { ErrorResponse } from "../../types/types";
import { resMissingFields } from "../../utils/resUtils";
import { sanitizeUserQuery } from "../../utils/sanitizeQuery";
import { sendVerifyEmail } from "./resendVerifyEmailToken";

export const signup = async (req: Request, res: Response) => {
  try {
    const { username, email, password, fullName, rememberMe } = req.body;

    if (!username || !email || !password || !fullName) {
      resMissingFields(res, "Username, email, password, and full name");
      return;
    }

    const potentialUser = await User.findOne({ $or: [{ email }, { gmail: email }, { username }] });
    if (potentialUser) {
      if (potentialUser?.email === email) res.status(460).json({ code: "INVALID_EMAIL_FIELD", message: "Email is already in use" } as ErrorResponse);
      else if (potentialUser?.gmail === email)
        res.status(460).json({
          code: "INVALID_EMAIL_FIELD",
          message: "Email is already bind with google account, please bind on account settings",
        } as ErrorResponse);
      else if (potentialUser.username === username)
        res.status(460).json({ code: "INVALID_USERNAME_FIELD", message: "Username is already in use" } as ErrorResponse);
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const rawNewUser = await User.create({
      username,
      email,
      password: hashedPassword,
      fullName,
    });
    const newUser = sanitizeUserQuery(rawNewUser) as Express.User;

    await sendVerifyEmail(newUser);
    const accessToken = createAccessToken({ userId: newUser._id, role: newUser.role });
    const refreshToken = createRefreshToken({ userId: newUser._id, role: newUser.role }, rememberMe ? undefined : "3d");

    res.cookie("accessToken", accessToken, resAccessToken);
    res.cookie("refreshToken", refreshToken, rememberMe ? resRefreshToken : resRefreshTokenSessionOnly);

    res.status(201).json(newUser);
  } catch (error) {
    handleError(error, res);
  }
};
