const jwt = require("jsonwebtoken");

const generateRes = (res, isObject = false, email = false) => {
  let response = res;
  if (!isObject) response = res.toObject();
  delete response.password;
  delete response.googleId;
  if (email) delete response.email;
  return response;
};

const generateJWT = (user) => {
  const token = jwt.sign({ id: user._id.toString(), email: user.email }, process.env.SECRET_KEY, { expiresIn: "1000" });
  return token;
};

const errorHandler = (err, res) => {
  if (err.name === "ValidationError") {
    res.status(400).json({
      message: err.message,
      code: "VALIDATION_ERROR",
    });
  } else if (err.name === "VersionError") {
    res.status(409).json({
      message: "Conflict: This item was modified by another user/process. Please refresh and try again.",
      code: "VERSION_CONFLICT",
    });
  } else res.status(500).json({ message: "Internal Server Error", code: "SERVER_ERROR", details: err.message });
};

const generateReward = (req) => {
  switch (req.difficulty) {
    case "easy":
      return 200;
    case "medium":
      return 350;
    case "hard":
      return 500;
    case "very hard":
      return 800;
    default:
      return 200;
  }
};

module.exports = { generateRes, generateJWT, errorHandler, generateReward };
