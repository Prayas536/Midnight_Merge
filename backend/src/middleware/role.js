function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });
    if (req.user.userType !== role) return res.status(403).json({ success: false, message: "Forbidden" });
    next();
  };
}

module.exports = { requireRole };
