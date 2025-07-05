import { RequestHandler, Router } from "express";
import { authMiddleware } from "../middlewares/auth";
import { createTask } from "../controllers/task/createTask";
import { editTask } from "../controllers/task/editTask";
import { deleteTask } from "../controllers/task/deleteTask";
import { restoreTask } from "../controllers/task/restoreTask";
export const taskRouter = Router();

taskRouter.use(authMiddleware as RequestHandler);
taskRouter.post("/", createTask as RequestHandler);
taskRouter.put("/", editTask as RequestHandler);
taskRouter.delete("/", deleteTask as RequestHandler);
taskRouter.put("/restore", restoreTask as RequestHandler);
