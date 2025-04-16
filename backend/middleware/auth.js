const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "Access Denied" });
  }

  try {
    const decoded = jwt.verify(token.replace("Bearer ", ""), JWT_SECRET);
    req.user = { userId: decoded.userId }; // Ensure it sets userId correctly
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid token" });
  }
};
