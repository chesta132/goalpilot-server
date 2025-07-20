import { IUserDocument } from "../models/User";
import { Document } from "mongoose";

declare global {
  namespace Express {
    interface User extends IUserDocument {}
  }
}

declare module "mongoose" {
  interface Document {
    __v?: number;
  }
}
