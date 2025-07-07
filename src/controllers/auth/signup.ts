import { Response, Request } from "express";
import handleError from "../../utils/handleError";
import User from "../../models/User";
import bcrypt from "bcrypt";
import { createAccessToken, createRefreshToken } from "../../utils/tokenUtils";
import { resAccessToken, resRefreshToken, resRefreshTokenSessionOnly } from "../../utils/resCookie";
import { ErrorResponse } from "../../types/types";
import { resMissingFields } from "../../utils/resUtils";
import { createAndSanitize } from "../../utils/mongooseUtils";

export const signup = async (req: Request, res: Response) => {
  try {
    const { username, email, password, fullName, rememberMe } = req.body;

    if (!username || !email || !password || !fullName) return resMissingFields(res, "Username, email, password, and full name");
    if (await User.findOne({ email }))
      return res.status(460).json({ code: "INVALID_EMAIL_FIELD", message: "Email is already in use" } as ErrorResponse);
    if (await User.findOne({ username }))
      return res.status(460).json({ code: "INVALID_USERNAME_FIELD", message: "Username is already in use" } as ErrorResponse);

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await createAndSanitize(User, {
      username,
      email,
      password: hashedPassword,
      fullName,
    });
    const accessToken = createAccessToken({ userId: newUser._id, role: newUser.role! });
    const refreshToken = createRefreshToken({ userId: newUser._id, role: newUser.role! }, rememberMe ? undefined : "3d");

    res.cookie("accessToken", accessToken, resAccessToken);
    res.cookie("refreshToken", refreshToken, rememberMe ? resRefreshToken : resRefreshTokenSessionOnly);

    res.status(201).json(newUser);
  } catch (error) {
    handleError(error, res);
  }
};
