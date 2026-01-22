const axios = require("axios");
const { env } = require("../config/env");

async function callWithRetries(fn, retries) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      // small backoff
      await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
    }
  }
  throw lastErr;
}

function normalizePredictionResponse(raw) {
  // Accept flexible shapes and normalize
  // Preferred: { riskLabel, riskScore, confidence }
  if (!raw) return { riskLabel: "Unknown", riskScore: null, confidence: null };

  if (raw.riskLabel || raw.riskScore != null) {
    return {
      riskLabel: raw.riskLabel ?? "Unknown",
      riskScore: raw.riskScore ?? raw.score ?? null,
      confidence: raw.confidence ?? raw.probability ?? raw.riskScore ?? null,
    };
  }

  // Some models return { prediction: 1, probability: 0.7 }
  if (raw.prediction != null) {
    let riskLabel = "Unknown";
    const proba = raw.probability ?? raw.risk_percent / 100 ?? null;
    if (proba !== null) {
      if (proba >= 0.8) riskLabel = "High Risk";
      else if (proba >= 0.5) riskLabel = "Medium Risk";
      else riskLabel = "Low Risk";
    }
    return {
      riskLabel,
      riskScore: proba,
      confidence: proba,
    };
  }

  return {
    riskLabel: raw.label ?? "Unknown",
    riskScore: raw.proba ?? raw.probability ?? null,
    confidence: raw.proba ?? raw.probability ?? null,
  };
}

async function predict(payload) {
  if (!env.ML_PREDICT_URL) {
    const err = new Error("ML_PREDICT_URL not configured");
    err.statusCode = 500;
    throw err;
  }

  const res = await callWithRetries(
    () =>
      axios.post(env.ML_PREDICT_URL, payload, {
        timeout: env.ML_TIMEOUT_MS,
        headers: { "Content-Type": "application/json" },
      }),
    env.ML_RETRY_COUNT
  );

  const normalized = normalizePredictionResponse(res.data);
  return {
    ...normalized,
    explanation: res.data.explanation,
    modelVersion: env.MODEL_VERSION,
    predictedAt: new Date().toISOString(),
    raw: env.NODE_ENV !== "production" ? res.data : undefined,
  };
}

module.exports = { predict };
