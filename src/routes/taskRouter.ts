import { Router } from "express";
import { authMiddleware, requireVerified } from "../middlewares/auth";
import { createTask } from "../controllers/task/createTask";
import { editTask } from "../controllers/task/editTask";
import { deleteTask } from "../controllers/task/deleteTask";
import { restoreTask } from "../controllers/task/restoreTask";
import { getTask } from "../controllers/task/getTask";
export const taskRouter = Router();

taskRouter.use(authMiddleware);
taskRouter.use(requireVerified);
taskRouter.get("/", getTask);
taskRouter.post("/", createTask);
taskRouter.put("/", editTask);
taskRouter.delete("/", deleteTask);
taskRouter.put("/restore", restoreTask);
