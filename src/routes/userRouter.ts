import { RequestHandler, Router } from "express";
import { getUser } from "../controllers/user/getUser";
import { getProfile } from "../controllers/user/getProfile";
import { deleteUser } from "../controllers/user/deleteUser";
import { heartbeat } from "../controllers/user/heartbeat";
import { authMiddleware } from "../middlewares/auth";
export const userRouter = Router();

userRouter.patch("/", authMiddleware as RequestHandler, getUser as RequestHandler);
userRouter.get("/", authMiddleware as RequestHandler, getProfile as RequestHandler);
userRouter.delete("/", authMiddleware as RequestHandler, deleteUser as RequestHandler);
userRouter.patch("/heartbeat", authMiddleware as RequestHandler, heartbeat as RequestHandler);
