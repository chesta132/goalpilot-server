const express = require("express");
const passport = require("passport");
const connectDB = require("./services/db");
const session = require("express-session");
const cors = require("cors");
const helmet = require("helmet");
const { rateLimit } = require("express-rate-limit");
require("./services/passport");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const goalRoutes = require("./routes/goalRoutes");
const taskRoutes = require("./routes/taskRoutes");
const aiRoutes = require("./routes/aiRoutes");

const { authenticateJWT } = require("./middlewares/authenticateJWT");

const app = express();
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(
  cors({
    credentials: true,
    origin: process.env.FRONTEND_URL,
  })
);
app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(helmet());
app.use(limiter);
app.use(express.json());
app.use(passport.initialize());
connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/user", authenticateJWT, userRoutes);
app.use("/api/goal", authenticateJWT, goalRoutes);
app.use("/api/task", authenticateJWT, taskRoutes);
app.use("/api/ai", authenticateJWT, aiRoutes);

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0";
app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Accessible on network via http:${HOST}:${PORT} (or your actual network IP)`);
});
