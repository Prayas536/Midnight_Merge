const { validationResult } = require("express-validator");

function validationMiddleware(req, res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: result.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
}

function errorHandler(err, req, res, next) {
  const status = err.statusCode || 500;
  const message = status === 500 ? "Internal server error" : err.message;
  if (process.env.NODE_ENV !== "production") {
    console.error(err);
  }
  res.status(status).json({ success: false, message });
}

module.exports = { errorHandler, validationMiddleware };
