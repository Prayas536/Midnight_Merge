const jwt = require("jsonwebtoken");
const { env } = require("../config/env");
const User = require("../models/User");

function getTokenFromReq(req) {
  // Prefer HttpOnly cookie if enabled
  if (env.USE_AUTH_COOKIE && req.cookies && req.cookies[env.COOKIE_NAME]) {
    return req.cookies[env.COOKIE_NAME];
  }
  const header = req.headers.authorization || "";
  if (header.startsWith("Bearer ")) return header.slice(7);
  return null;
}

async function auth(req, res, next) {
  try {
    const token = getTokenFromReq(req);
    if (!token) return res.status(401).json({ success: false, message: "Unauthorized" });

    const payload = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(payload.sub).select("+passwordHash");
    if (!user) return res.status(401).json({ success: false, message: "Unauthorized" });

    req.user = { id: user._id.toString(), userType: user.userType, linkedPatientId: user.linkedPatientId };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
}

module.exports = { auth, getTokenFromReq };
