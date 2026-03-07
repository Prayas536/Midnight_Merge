const stressService = require("../services/stress.service");

async function predict(req, res, next) {
    try {
        const result = await stressService.predictStress(req.body);
        res.json({ success: true, data: result });
    } catch (e) {
        if (e.response) {
            const err = new Error(`ML service error (${e.response.status})`);
            err.statusCode = 502;
            return next(err);
        }
        if (e.code === "ECONNABORTED") {
            const err = new Error("ML service timeout");
            err.statusCode = 504;
            return next(err);
        }
        const err = new Error("ML service unreachable");
        err.statusCode = 502;
        return next(err);
    }
}

async function analyzeMood(req, res, next) {
    try {
        const result = await stressService.analyzeMood(req.body);
        res.json({ success: true, data: result });
    } catch (e) {
        if (e.response) {
            const err = new Error(`ML service error (${e.response.status})`);
            err.statusCode = 502;
            return next(err);
        }
        if (e.code === "ECONNABORTED") {
            const err = new Error("ML service timeout");
            err.statusCode = 504;
            return next(err);
        }
        const err = new Error("ML service unreachable");
        err.statusCode = 502;
        return next(err);
    }
}

async function predictCombined(req, res, next) {
    try {
        const result = await stressService.predictStressCombined(req.body);
        res.json({ success: true, data: result });
    } catch (e) {
        if (e.response) {
            const err = new Error(`ML service error (${e.response.status})`);
            err.statusCode = 502;
            return next(err);
        }
        if (e.code === "ECONNABORTED") {
            const err = new Error("ML service timeout");
            err.statusCode = 504;
            return next(err);
        }
        const err = new Error("ML service unreachable");
        err.statusCode = 502;
        return next(err);
    }
}

async function aiStressAdvice(req, res, next) {
    try {
        const result = await stressService.aiStressAdvice(req.body);
        res.json({ success: true, data: result });
    } catch (e) {
        if (e.response) {
            const err = new Error(`ML service error (${e.response.status})`);
            err.statusCode = 502;
            return next(err);
        }
        if (e.code === "ECONNABORTED") {
            const err = new Error("ML service timeout");
            err.statusCode = 504;
            return next(err);
        }
        const err = new Error("ML service unreachable");
        err.statusCode = 502;
        return next(err);
    }
}

module.exports = { predict, analyzeMood, predictCombined, aiStressAdvice };
