import { RequestHandler, Router } from "express";
import { authMiddleware } from "../middlewares/auth";
import { createGoal } from "../controllers/goal/createGoal";
import { getGoal } from "../controllers/goal/getGoal";
import { editGoal } from "../controllers/goal/editGoal";
import { deleteGoal } from "../controllers/goal/deleteGoal";
import { restoreGoal } from "../controllers/goal/restoreGoal";
export const goalRouter = Router();

goalRouter.use(authMiddleware as RequestHandler);
goalRouter.post("/", createGoal as RequestHandler);
goalRouter.get("/", getGoal as RequestHandler);
goalRouter.put("/", editGoal as RequestHandler);
goalRouter.delete("/", deleteGoal as RequestHandler);
goalRouter.put("/restore", restoreGoal as RequestHandler);
