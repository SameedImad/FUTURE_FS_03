const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  try {
    // Get token from request header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Access Denied. No Token Provided",
      });
    }

    // Allow either "Bearer token" or a raw token value
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Save user info in request
    req.user = decoded;

    // Move to next function
    next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid Token",
    });
  }
};

module.exports = protect;
