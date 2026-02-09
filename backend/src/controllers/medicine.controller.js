const medicineService = require("../services/medicine.service");

async function recommendMedicine(req, res, next) {
    try {
        const result = await medicineService.predictMedicine(req.body);
        res.json({ success: true, data: result });
    } catch (e) {
        // normalize axios errors
        if (e.response) {
            const err = new Error(`Medicine ML service error (${e.response.status})`);
            err.statusCode = 502;
            return next(err);
        }
        if (e.code === "ECONNABORTED") {
            const err = new Error("Medicine ML service timeout");
            err.statusCode = 504;
            return next(err);
        }
        const err = new Error("Medicine ML service unreachable");
        err.statusCode = 502;
        return next(err);
    }
}

async function getDropdownOptions(req, res, next) {
    try {
        const result = await medicineService.getDropdownOptions();
        res.json({ success: true, data: result });
    } catch (e) {
        if (e.response) {
            const err = new Error(`Medicine ML service error (${e.response.status})`);
            err.statusCode = 502;
            return next(err);
        }
        const err = new Error("Medicine ML service unreachable");
        err.statusCode = 502;
        return next(err);
    }
}

module.exports = { recommendMedicine, getDropdownOptions };
