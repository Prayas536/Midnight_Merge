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

async function predictMedicine(payload) {
    if (!env.ML_MEDICINE_URL) {
        const err = new Error("ML_MEDICINE_URL not configured");
        err.statusCode = 500;
        throw err;
    }

    const res = await callWithRetries(
        () =>
            axios.post(env.ML_MEDICINE_URL, payload, {
                timeout: env.ML_TIMEOUT_MS,
                headers: { "Content-Type": "application/json" },
            }),
        env.ML_RETRY_COUNT
    );

    return {
        recommendedMedicine: res.data.recommended_medicine,
        dosageMg: res.data.dosage_mg,
        medicineConfidence: res.data.medicine_confidence,
        dosageConfidence: res.data.dosage_confidence,
        allProbabilities: res.data.all_medicine_probabilities,
        predictedAt: new Date().toISOString(),
    };
}

async function getDropdownOptions() {
    if (!env.ML_MEDICINE_DROPDOWN_URL) {
        const err = new Error("ML_MEDICINE_DROPDOWN_URL not configured");
        err.statusCode = 500;
        throw err;
    }

    const res = await callWithRetries(
        () =>
            axios.get(env.ML_MEDICINE_DROPDOWN_URL, {
                timeout: env.ML_TIMEOUT_MS,
            }),
        env.ML_RETRY_COUNT
    );

    return res.data.data;
}

module.exports = { predictMedicine, getDropdownOptions };
