const express = require("express");
const { auth } = require("../middleware/auth");
const { requireRole } = require("../middleware/role");
const { validationMiddleware } = require("../middleware/errorHandler");
const { body } = require("express-validator");
const c = require("../controllers/prediction.controller");

const router = express.Router();

router.use(auth, requireRole("doctor"));

router.post(
  "/",
  [
    body().isObject().withMessage("payload must be object"),
  ],
  validationMiddleware,
  c.predict
);

module.exports = router;
