import { Router } from "express";
import { authMiddleware } from "../middlewares/auth";
import { requestFriend } from "../controllers/friend/requestFriend";
import { unFriend } from "../controllers/friend/unFriend";
import { getFriend } from "../controllers/friend/getFriend";
import { acceptFriendReq } from "../controllers/friend/acceptFriendReq";
export const friendRouter = Router();

friendRouter.use(authMiddleware);
friendRouter.get("/", getFriend);
friendRouter.post("/request", requestFriend);
friendRouter.put("/accept-request", acceptFriendReq);
friendRouter.delete("/unfriend", unFriend);
