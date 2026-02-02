const express = require("express");
const { auth } = require("../middleware/auth");
const c = require("../controllers/dashboard.controller");

const router = express.Router();

router.use(auth);

router.get("/stats", c.getDashboardStats);
router.get("/trends", c.getHbA1cTrends);

module.exports = router;
