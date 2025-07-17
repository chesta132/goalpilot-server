import { authMiddleware, requireVerified } from "../middlewares/auth";
import { signin } from "../controllers/auth/signin";
import { signout } from "../controllers/auth/signout";
import { signup } from "../controllers/auth/signup";
import { Router } from "express";
import { googleCallback } from "../controllers/auth/google";
import passport from "passport";
import { resendOtp } from "../controllers/auth/resendOtp";
import { verifyAccount } from "../controllers/auth/verifyAccount";
const authRouter = Router();

authRouter.post("/signup", signup);
authRouter.post("/signin", signin);

authRouter.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
authRouter.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/signin", failureFlash: false, failureMessage: false }),
  googleCallback
);

authRouter.use(authMiddleware);
authRouter.post("/signout", requireVerified, signout);
authRouter.get("/resend-otp", resendOtp);
authRouter.post("/verify", verifyAccount);

export default authRouter;
