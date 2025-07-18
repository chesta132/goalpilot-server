import { authMiddleware } from "../middlewares/auth";
import { signin } from "../controllers/auth/signin";
import { signout } from "../controllers/auth/signout";
import { signup } from "../controllers/auth/signup";
import { Router } from "express";
import { googleCallback } from "../controllers/auth/google";
import passport from "passport";
import { resendVerifyEmail } from "../controllers/auth/resendVerifyEmailToken";
import { verifyEmail } from "../controllers/auth/verifyEmail";
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
authRouter.post("/signout", signout);
authRouter.get("/resend-email-verif", resendVerifyEmail);
authRouter.post("/verify-email", verifyEmail);

export default authRouter;
