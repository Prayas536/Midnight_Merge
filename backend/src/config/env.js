const dotenv = require("dotenv");
dotenv.config();

const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  CORS_ORIGIN: process.env.CORS_ORIGIN,
  USE_AUTH_COOKIE: String(process.env.USE_AUTH_COOKIE || "false") === "true",
  COOKIE_NAME: process.env.COOKIE_NAME || "dpms_token",
  ML_PREDICT_URL: process.env.ML_PREDICT_URL,
  ML_TIMEOUT_MS: Number(process.env.ML_TIMEOUT_MS || 8000),
  ML_RETRY_COUNT: Number(process.env.ML_RETRY_COUNT || 2),
  MODEL_VERSION: process.env.MODEL_VERSION || "v1",
};

module.exports = { env };
