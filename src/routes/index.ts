import { authMiddleware } from "../middlewares/auth";
import authRouter from "./authRouter";
import { RequestHandler, Router } from "express";
import { userRouter } from "./userRouter";
import { goalRouter } from "./goalRouter";
const router = Router();

router.use("/auth", authRouter);
router.use("/user", userRouter);
router.use("/goal", goalRouter);

router.get("/authz", authMiddleware as RequestHandler, (req, res) => {
  res.json("Auth valid");
});

router.get("/health", (req, res) => {
  res.json("OK");
});

export default router;
