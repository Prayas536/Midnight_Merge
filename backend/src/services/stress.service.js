const axios = require("axios");
const { env } = require("../config/env");

async function callWithRetries(fn, retries) {
    let lastErr;
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            return await fn();
        } catch (e) {
            lastErr = e;
            await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
        }
    }
    throw lastErr;
}

async function predictStress(payload) {
    const baseUrl = (env.ML_STRESS_URL || "http://localhost:8002").replace(/\/+$/, "");
    const stressUrl = `${baseUrl}/predict_stress`;

    const res = await callWithRetries(
        () =>
            axios.post(stressUrl, payload, {
                timeout: env.ML_TIMEOUT_MS || 8000,
                headers: { "Content-Type": "application/json" },
            }),
        env.ML_RETRY_COUNT || 2
    );

    return {
        stress_level: res.data.stress_level,
        predictedAt: new Date().toISOString(),
    };
}

async function analyzeMood(payload) {
    const baseUrl = (env.ML_STRESS_URL || "http://localhost:8002").replace(/\/+$/, "");
    const analyzeUrl = `${baseUrl}/analyze_mood`;

    const res = await callWithRetries(
        () =>
            axios.post(analyzeUrl, payload, {
                timeout: env.ML_TIMEOUT_MS || 8000,
                headers: { "Content-Type": "application/json" },
            }),
        env.ML_RETRY_COUNT || 2
    );

    return {
        ...res.data,
        analyzedAt: new Date().toISOString(),
    };
}

async function predictStressCombined(payload) {
    const baseUrl = (env.ML_STRESS_URL || "http://localhost:8002").replace(/\/+$/, "");
    const combinedUrl = `${baseUrl}/predict_stress_combined`;

    const res = await callWithRetries(
        () =>
            axios.post(combinedUrl, payload, {
                timeout: env.ML_TIMEOUT_MS || 8000,
                headers: { "Content-Type": "application/json" },
            }),
        env.ML_RETRY_COUNT || 2
    );

    return {
        ...res.data,
        predictedAt: new Date().toISOString(),
    };
}

async function aiStressAdvice(payload) {
    const baseUrl = (env.ML_STRESS_URL || "http://localhost:8002").replace(/\/+$/, "");
    const aiUrl = `${baseUrl}/ai_stress_advice`;
    const res = await callWithRetries(
        () =>
            axios.post(aiUrl, payload, {
                timeout: env.ML_TIMEOUT_MS || 8000,
                headers: { "Content-Type": "application/json" },
            }),
        env.ML_RETRY_COUNT || 2
    );

    return {
        ...res.data,
        advisedAt: new Date().toISOString(),
    };
}

module.exports = { predictStress, analyzeMood, predictStressCombined, aiStressAdvice };
