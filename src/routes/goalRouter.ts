import { Router } from "express";
import { authMiddleware, requireVerified } from "../middlewares/auth";
import { createGoal } from "../controllers/goal/createGoal";
import { getGoal } from "../controllers/goal/getGoal";
import { editGoal } from "../controllers/goal/editGoal";
import { deleteGoal } from "../controllers/goal/deleteGoal";
import { restoreGoal } from "../controllers/goal/restoreGoal";
export const goalRouter = Router();

goalRouter.use(authMiddleware);
goalRouter.use(requireVerified);
goalRouter.post("/", createGoal);
goalRouter.get("/", getGoal);
goalRouter.put("/", editGoal);
goalRouter.delete("/", deleteGoal);
goalRouter.put("/restore", restoreGoal);
