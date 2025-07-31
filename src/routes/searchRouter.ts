import { Router } from "express";
import { authMiddleware } from "../middlewares/auth";
import { search } from "../controllers/search/search";
export const searchRouter = Router();

searchRouter.use(authMiddleware);
searchRouter.get("/", search);
