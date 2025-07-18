import { Router } from "express";
import { getUser } from "../controllers/user/getUser";
import { getProfile } from "../controllers/user/getProfile";
import { deleteUser } from "../controllers/user/deleteUser";
import { heartbeat } from "../controllers/user/heartbeat";
import { authMiddleware } from "../middlewares/auth";
export const userRouter = Router();

userRouter.use(authMiddleware);
userRouter.patch("/", getUser);
userRouter.get("/", getProfile);
userRouter.delete("/", deleteUser);
userRouter.patch("/heartbeat", heartbeat);
