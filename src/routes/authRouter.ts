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
const authRouter = Router();

authRouter.post("/signup", signup);
authRouter.post("/signin", signin);

authRouter.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
authRouter.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: `${process.env.CLIENT_URL_DEV}/signin`, failureFlash: false, failureMessage: false }),
  googleCallback
);

authRouter.use(authMiddleware);
authRouter.post("/signout", signout);

authRouter.get("/resend-email-verif", resendVerifyEmail);
authRouter.post("/verify-email", verifyEmail);

authRouter.post("/bind-local", bindLocal);
authRouter.get("/google-bind", passport.authenticate("google-bind", { scope: ["profile", "email"] }));
authRouter.get(
  "/google-bind/callback",
  passport.authenticate("google-bind", { failureRedirect: `${process.env.CLIENT_URL_DEV}`, failureFlash: false, failureMessage: false }),
  googleCallback
);

authRouter.post("/send-otp", resendOTP);
authRouter.post("/update-email", changeEmail);

export default authRouter;
