import { authenticateToken } from "../middlewares/auth";
import authRouter from "./auth";
import { RequestHandler, Router } from "express";
const router = Router();

router.use("/auth", authRouter);
router.get("/authz", authenticateToken as RequestHandler, (req, res) => {
  res.json("Auth valid");
});

router.get("/health", (req, res) => {
  res.json("OK");
});

export default router;
