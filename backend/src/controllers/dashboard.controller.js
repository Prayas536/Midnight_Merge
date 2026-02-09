const dashboardService = require("../services/dashboard.service");

async function getDashboardStats(req, res, next) {
    try {
        if (req.user.userType !== "doctor") {
            return res.status(403).json({ success: false, message: "Forbidden" });
        }
        const stats = await dashboardService.getDashboardStats(req.user.id);
        res.json({ success: true, data: stats });
    } catch (e) {
        next(e);
    }
}

async function getHbA1cTrends(req, res, next) {
    try {
        if (req.user.userType !== "doctor") {
            return res.status(403).json({ success: false, message: "Forbidden" });
        }
        const months = parseInt(req.query.months) || 6;
        const trends = await dashboardService.getHbA1cTrends(req.user.id, months);
        res.json({ success: true, data: trends });
    } catch (e) {
        next(e);
    }
}

module.exports = { getDashboardStats, getHbA1cTrends };
