import { Router } from "express";
import { authMiddleware, requireVerified } from "../middlewares/auth";
import { generateTask } from "../controllers/ai/generateTask";
export const aiRouter = Router();

aiRouter.use(authMiddleware);
aiRouter.use(requireVerified);
aiRouter.post("/", generateTask);
