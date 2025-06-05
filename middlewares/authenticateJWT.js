const jwt = require("jsonwebtoken");

exports.authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication Needed", code: "INVALID_AUTH" });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token is expired, please re-login",
        code: "TOKEN_EXPIRED",
      });
    } else {
      return res.status(401).json({
        message: "Token invalid",
        code: "INVALID_TOKEN",
      });
    }
  }
};
