import { authMiddleware, requireVerified } from "../middlewares/auth";
import { signin } from "../controllers/auth/signin";
import { signout } from "../controllers/auth/signout";
import { signup } from "../controllers/auth/signup";
import { Router } from "express";
import { googleCallback } from "../controllers/auth/googleCallback";
import passport from "passport";
import { resendVerifyEmail } from "../controllers/auth/resendVerifyEmailToken";
import { verifyEmail } from "../controllers/auth/verifyEmail";
import { bindLocal } from "../controllers/auth/bindLocal";
import { resendOTP } from "../controllers/auth/resendOTP";
import { changeEmail } from "../controllers/auth/changeEmail";
import { resetPassword } from "../controllers/auth/resetPassword";
import { changePassword } from "../controllers/auth/changePassword";
import { CLIENT_URL } from "../app";
const authRouter = Router();

authRouter.post("/signup", signup);
authRouter.post("/signin", signin);

authRouter.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
authRouter.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: `${CLIENT_URL}/signin`, failureFlash: false, failureMessage: false }),
  googleCallback
);

authRouter.use(authMiddleware);
authRouter.post("/signout", signout);

authRouter.get("/send-email-verif", resendVerifyEmail);
authRouter.post("/verify-email", verifyEmail);

authRouter.put("/bind-local", bindLocal);
authRouter.get("/google-bind", passport.authenticate("google-bind", { scope: ["profile", "email"] }));
authRouter.get(
  "/google-bind/callback",
  passport.authenticate("google-bind", { failureRedirect: `${CLIENT_URL}`, failureFlash: false, failureMessage: false }),
  googleCallback
);

authRouter.post("/send-otp", resendOTP);

authRouter.put("/update-email", changeEmail);

authRouter.use(requireVerified);
authRouter.put("/reset-password", resetPassword);
authRouter.put("/update-password", changePassword);

export default authRouter;
