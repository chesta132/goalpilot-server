import { RequestHandler, Router } from "express";
import { getUser } from "../controllers/user/getUser";
import { getProfile } from "../controllers/user/getProfile";
import { deleteUser } from "../controllers/user/deleteUser";
import { heartbeat } from "../controllers/user/heartbeat";
import { authMiddleware } from "../middlewares/auth";
export const userRouter = Router();

userRouter.use(authMiddleware as RequestHandler)
userRouter.patch("/", getUser as RequestHandler);
userRouter.get("/", getProfile as RequestHandler);
userRouter.delete("/", deleteUser as RequestHandler);
userRouter.patch("/heartbeat", heartbeat as RequestHandler);
