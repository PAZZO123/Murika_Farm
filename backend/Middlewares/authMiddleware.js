const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const config = require("../config/config");

module.exports = async (req, res, next) => {
  try {
    const token = req.header("Authorization");
    if (!token) return res.status(401).json({ error: "Access denied. No token provided." });

    const decoded = jwt.verify(token.replace("Bearer ", ""), config.secret);
    req.user = await User.findById(decoded.userId).select("-password");

    if (!req.user) return res.status(401).json({ error: "User not found" });

    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};
