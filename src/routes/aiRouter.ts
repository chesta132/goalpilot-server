import { RequestHandler, Router } from "express";
import { authMiddleware } from "../middlewares/auth";
import { generateTask } from "../controllers/ai/generateTask";
export const aiRouter = Router()

aiRouter.use(authMiddleware as RequestHandler)
aiRouter.post('/', generateTask as RequestHandler)