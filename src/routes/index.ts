import { authMiddleware } from "../middlewares/auth";
import authRouter from "./authRouter";
import { Router } from "express";
import { userRouter } from "./userRouter";
import { goalRouter } from "./goalRouter";
import { taskRouter } from "./taskRouter";
import { aiRouter } from "./aiRouter";
import { friendRouter } from "./friendRoutes";
const router = Router();

router.use("/auth", authRouter);
router.use("/user", userRouter);
router.use("/goal", goalRouter);
router.use("/task", taskRouter);
router.use("/ai", aiRouter);
router.use("/friend", friendRouter);

router.get("/authz", authMiddleware, (req, res) => {
  res.json("Auth valid");
});

router.get("/health", (req, res) => {
  res.json("OK");
});

export default router;
