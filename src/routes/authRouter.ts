import { authMiddleware } from "../middlewares/auth";
import { signin } from "../controllers/auth/signin";
import { signout } from "../controllers/auth/signout";
import { signup } from "../controllers/auth/signup";
import { RequestHandler, Router } from "express";
import { googleCallback } from "../controllers/auth/google";
import passport from "passport";
const authRouter = Router();

authRouter.post("/signup", signup as RequestHandler);
authRouter.post("/signin", signin);
authRouter.post("/signout", authMiddleware as RequestHandler, signout as RequestHandler);

authRouter.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
authRouter.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/signin", failureFlash: false, failureMessage: false }),
  googleCallback as RequestHandler
);

export default authRouter;
