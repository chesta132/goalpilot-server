import { Response, Request } from "express";
import handleError from "../../utils/handleError";
import User from "../../models/User";
import bcrypt from "bcrypt";
import sanitizeQuery from "../../utils/sanitizeQuery";
import { createAccessToken, createRefreshToken } from "../../utils/tokenUtils";
import { resAccessToken, resRefreshToken } from "../../utils/resCookie";
import { ErrorResponse } from "../../types/types";

export const signup = async (req: Request, res: Response) => {
  try {
    const { username, email, password, fullName } = req.body;

    if (!username || !email || !password || !fullName)
      return res.status(422).json({ message: "Username, Email, Password, and Full Name is Required", code: "MISSING_FIELDS" } as ErrorResponse);
    if (await User.findOne({ email: email }))
      return res.status(460).json({ code: "EMAIL_UNAVAILABLE", message: "Email is already in use" } as ErrorResponse);
    if (await User.findOne({ username: username }))
      return res.status(460).json({ code: "USERNAME_UNAVAILABLE", message: "Username is already in use" } as ErrorResponse);

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username: username,
      email: email,
      password: hashedPassword,
      fullName: fullName,
    });
    const accessToken = createAccessToken({ userId: newUser._id, role: newUser.role! });
    const refreshToken = createRefreshToken({ userId: newUser._id, role: newUser.role! });

    res.cookie("accessToken", accessToken, resAccessToken);
    res.cookie("refreshToken", refreshToken, resRefreshToken);

    const userResponse = sanitizeQuery(newUser);
    res.status(201).json(userResponse);
  } catch (error) {
    handleError(error, res);
  }
};
