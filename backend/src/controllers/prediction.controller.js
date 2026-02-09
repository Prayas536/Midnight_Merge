const predictionService = require("../services/prediction.service");

async function predict(req, res, next) {
  try {
    const result = await predictionService.predict(req.body);
    res.json({ success: true, data: result });
  } catch (e) {
    // normalize axios errors
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

module.exports = { predict };
