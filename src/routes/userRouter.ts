import { Router } from "express";
import { getUser } from "../controllers/user/getUser";
import { getProfile } from "../controllers/user/getProfile";
import { deleteUser } from "../controllers/user/deleteUser";
import { heartbeat } from "../controllers/user/heartbeat";
import { authMiddleware } from "../middlewares/auth";
import { searchUser } from "../controllers/user/searchUser";
import { getDeletedGoalsAndTasks } from "../controllers/user/getDeletedGoalsAndTasks";
export const userRouter = Router();

userRouter.use(authMiddleware);
userRouter.patch("/", getUser);
userRouter.get("/", getProfile);
userRouter.delete("/", deleteUser);
userRouter.get("/search", searchUser);
userRouter.patch("/heartbeat", heartbeat);
userRouter.get("/recycled-task-goal", getDeletedGoalsAndTasks);
