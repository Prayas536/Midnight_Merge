const Patient = require("../models/Patient");
const Visit = require("../models/Visit");

async function getDashboardStats(doctorId) {
    // Get total patients
    const totalPatients = await Patient.countDocuments({ createdByDoctorId: doctorId });

    // Get visits this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const visitsThisMonth = await Visit.countDocuments({
        doctorId,
        visitDate: { $gte: startOfMonth }
    });

    // Get visits last month for delta calculation
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const visitsLastMonth = await Visit.countDocuments({
        doctorId,
        visitDate: { $gte: startOfLastMonth, $lte: endOfLastMonth }
    });

    // Calculate average HbA1c from all patients' latest visits
    const patientsWithLatestVisit = await Patient.aggregate([
        { $match: { createdByDoctorId: doctorId } },
        {
            $lookup: {
                from: "visits",
                localField: "_id",
                foreignField: "patientId",
                as: "visits"
            }
        },
        { $unwind: { path: "$visits", preserveNullAndEmptyArrays: false } },
        { $sort: { "visits.visitDate": -1 } },
        {
            $group: {
                _id: "$_id",
                latestHbA1c: { $first: "$visits.metrics.HbA1cLevel" }
            }
        },
        { $match: { latestHbA1c: { $ne: null } } }
    ]);

    const avgHbA1c = patientsWithLatestVisit.length > 0
        ? patientsWithLatestVisit.reduce((sum, p) => sum + p.latestHbA1c, 0) / patientsWithLatestVisit.length
        : 0;

    // Count predictions run (visits with prediction data)
    const predictionsRun = await Visit.countDocuments({
        doctorId,
        "prediction.riskScore": { $ne: null }
    });

    // Get predictions last month for delta
    const predictionsLastMonth = await Visit.countDocuments({
        doctorId,
        "prediction.riskScore": { $ne: null },
        visitDate: { $gte: startOfLastMonth, $lte: endOfLastMonth }
    });

    const predictionsThisMonth = await Visit.countDocuments({
        doctorId,
        "prediction.riskScore": { $ne: null },
        visitDate: { $gte: startOfMonth }
    });

    // Calculate deltas
    const visitsDelta = visitsLastMonth > 0
        ? Math.round(((visitsThisMonth - visitsLastMonth) / visitsLastMonth) * 100)
        : (visitsThisMonth > 0 ? 100 : 0);

    const predictionsDelta = predictionsLastMonth > 0
        ? Math.round(((predictionsThisMonth - predictionsLastMonth) / predictionsLastMonth) * 100)
        : (predictionsThisMonth > 0 ? 100 : 0);

    return {
        totalPatients,
        visitsThisMonth,
        avgHbA1c: Number(avgHbA1c.toFixed(1)),
        predictionsRun,
        deltas: {
            patients: 0, // Would need historical tracking
            visits: visitsDelta,
            hba1c: 0, // Would need historical tracking
            predictions: predictionsDelta
        }
    };
}

async function getHbA1cTrends(doctorId, months = 6) {
    const now = new Date();
    const trends = [];

    for (let i = months - 1; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

        const monthData = await Visit.aggregate([
            {
                $match: {
                    doctorId,
                    visitDate: { $gte: monthStart, $lte: monthEnd },
                    "metrics.HbA1cLevel": { $ne: null }
                }
            },
            {
                $group: {
                    _id: null,
                    avgHbA1c: { $avg: "$metrics.HbA1cLevel" },
                    avgGlucose: { $avg: "$metrics.bloodGlucoseLevel" },
                    avgBmi: { $avg: "$metrics.bmi" }
                }
            }
        ]);

        trends.push({
            month: monthStart.toLocaleString('default', { month: 'short' }),
            avgHbA1c: monthData[0]?.avgHbA1c ? Number(monthData[0].avgHbA1c.toFixed(1)) : null,
            avgGlucose: monthData[0]?.avgGlucose ? Number(monthData[0].avgGlucose.toFixed(0)) : null,
            avgBmi: monthData[0]?.avgBmi ? Number(monthData[0].avgBmi.toFixed(1)) : null
        });
    }

    return trends;
}

module.exports = { getDashboardStats, getHbA1cTrends };
