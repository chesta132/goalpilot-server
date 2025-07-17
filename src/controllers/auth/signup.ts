import { Response, Request } from "express";
import handleError from "../../utils/handleError";
import User from "../../models/User";
import bcrypt from "bcrypt";
import { createAccessToken, createRefreshToken } from "../../utils/tokenUtils";
import { resAccessToken, resRefreshToken, resRefreshTokenSessionOnly } from "../../utils/resCookie";
import { ErrorResponse } from "../../types/types";
import { resMissingFields } from "../../utils/resUtils";
import { createAndSanitize } from "../../utils/mongooseUtils";
import { generateOTP, sendOTPEmail } from "../../utils/email";
import OTP from "../../models/OTP";
import { sanitizeUserQuery } from "../../utils/sanitizeQuery";

export const signup = async (req: Request, res: Response) => {
  try {
    const { username, email, password, fullName, rememberMe } = req.body;

    if (!username || !email || !password || !fullName) {
      resMissingFields(res, "Username, email, password, and full name");
      return;
    }
    if (await User.findOne({ email })) {
      res.status(460).json({ code: "INVALID_EMAIL_FIELD", message: "Email is already in use" } as ErrorResponse);
      return;
    }
    if (await User.findOne({ username })) {
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
    const newUser = sanitizeUserQuery(rawNewUser);

    const otpToken = generateOTP();
    await createAndSanitize(OTP, { userId: newUser.id, otp: otpToken, type: "VERIFY" });
    await sendOTPEmail(email, otpToken, fullName);

    const accessToken = createAccessToken({ userId: newUser._id, role: newUser.role! });
    const refreshToken = createRefreshToken({ userId: newUser._id, role: newUser.role! }, rememberMe ? undefined : "3d");

    res.cookie("accessToken", accessToken, resAccessToken);
    res.cookie("refreshToken", refreshToken, rememberMe ? resRefreshToken : resRefreshTokenSessionOnly);

    res.status(201).json(newUser);
  } catch (error) {
    handleError(error, res);
  }
};
