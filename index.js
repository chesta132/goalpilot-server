const express = require("express");
const passport = require("passport");
const connectDB = require("./services/db");
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

const { authenticateJWT } = require("./middlewares/authen");

const app = express();
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(helmet());
app.use(limiter);
app.use(
  cors({
    credentials: true,
    origin: process.env.FRONTEND_URL,
  })
);
connectDB();
app.use(express.json());
app.use(passport.initialize());

app.use("/api/auth", authRoutes);
app.use("/api/user", passport.authenticate("jwt", { session: false }), authenticateJWT, userRoutes);
app.use("/api/goal", passport.authenticate("jwt", { session: false }), authenticateJWT, goalRoutes);
app.use("/api/task", passport.authenticate("jwt", { session: false }), authenticateJWT, taskRoutes);
app.use("/api/ai", passport.authenticate("jwt", { session: false }), authenticateJWT, aiRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server listening on port " + PORT);
});
