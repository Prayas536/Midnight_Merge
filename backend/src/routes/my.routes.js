const express = require("express");
const { auth } = require("../middleware/auth");
const c = require("../controllers/my.controller");

const router = express.Router();

router.use(auth);

router.get("/profile", c.myProfile);
router.get("/visits", c.myVisits);

module.exports = router;
