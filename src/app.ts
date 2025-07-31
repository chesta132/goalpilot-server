/// <reference path="./types/customDeclare.d.ts" />
import { config } from "dotenv";
config();
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import router from "./routes/index";
import { connectDB } from "./services/connectDB";
import passport from "passport";
import "./services/passport";
import cookieParser from "cookie-parser";
import session from "express-session";
import MongoStore from "connect-mongo";

export const CLIENT_URL = process.env.CLIENT_URL_DEV_LOCAL;

connectDB();
const app = express();
app.set("trust proxy", ["loopback", "linklocal"]);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());
app.use(helmet());
app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: CLIENT_URL,
  })
);
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      title: "Too many requests",
      message: "Too many requests, please try again later",
      code: "TOO_MUCH_REQUEST",
    },
  })
);
app.use(
  session({
    secret: process.env.SECRET_KEY!,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI! }),
  })
);
app.use(passport.initialize());

app.use("/api", router);

const PORT = parseInt(process.env.PORT || "5000");
const HOST = process.env.HOST || "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Accessible on network via http:${HOST}:${PORT} (or your actual network IP)`);
});
