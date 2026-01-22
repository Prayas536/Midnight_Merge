const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const { env } = require("./config/env");
const { connectDB } = require("./config/db");
const { logger } = require("./middleware/logger");
const { notFound } = require("./middleware/notFound");
const { errorHandler } = require("./middleware/errorHandler");

const authRoutes = require("./routes/auth.routes");
const patientRoutes = require("./routes/patient.routes");
const myRoutes = require("./routes/my.routes");
const predictionRoutes = require("./routes/prediction.routes");

const app = express();

// Security headers
app.use(helmet());

// JSON parser
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// CORS
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);

logger(app);

// Health
app.get("/api/health", (req, res) => res.json({ success: true, data: { ok: true } }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/my", myRoutes);
app.use("/api/predictions", predictionRoutes);

// 404 + error handler
app.use(notFound);
app.use(errorHandler);

// Connect DB on startup
connectDB().catch((e) => {
  console.error("❌Failed to connect DB:", e.message);
  process.exit(1);
});

module.exports = app;
