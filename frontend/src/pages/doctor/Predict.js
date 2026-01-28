import React, { useState } from "react";
import { motion } from "framer-motion";
import api from "../../api/axios";
import PageHeader from "../../components/layout/PageHeader";
import GlassCard from "../../components/ui/GlassCard";
import RiskGauge from "../../components/charts/RiskGauge";

export default function Predict() {
  const [formData, setFormData] = useState({
    gender: "Male",
    age: "",
    hypertension: 0,
    heart_disease: 0,
    smoking_history: "never",
    bmi: "",
    HbA1c_level: "",
    blood_glucose_level: ""
  });
  const [msg, setMsg] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    setResult(null);
    try {
      const payload = {
        ...formData,
        age: Number(formData.age),
        hypertension: Number(formData.hypertension),
        heart_disease: Number(formData.heart_disease),
        bmi: Number(formData.bmi),
        HbA1c_level: Number(formData.HbA1c_level),
        blood_glucose_level: Number(formData.blood_glucose_level)
      };
      const res = await api.post("/predictions", payload);
      setResult(res.data.data);
    } catch (e2) {
      setMsg(e2?.response?.data?.message || "Prediction failed");
    } finally {
      setLoading(false);
    }
  }

  const isFormValid = formData.age && formData.bmi && formData.HbA1c_level && formData.blood_glucose_level;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <PageHeader
        title="Diabetes Risk Assessment"
        subtitle="Advanced AI-powered risk prediction for personalized diabetes management"
      />

      <div className="row g-4">
        {/* Left Side - Form */}
        <div className="col-lg-6">
          <GlassCard className="p-4">
            <h5 className="mb-4">
              <i className="fas fa-clipboard-list me-2"></i>Patient Information
            </h5>

            {msg && (
              <motion.div
                className="alert alert-danger"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {msg}
              </motion.div>
            )}

            <form onSubmit={submit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Gender</label>
                  <select
                    name="gender"
                    className="form-select"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Age</label>
                  <input
                    name="age"
                    type="number"
                    className="form-control"
                    value={formData.age}
                    onChange={handleChange}
                    required
                    min="1"
                    max="120"
                    placeholder="Enter age"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Hypertension</label>
                  <select
                    name="hypertension"
                    className="form-select"
                    value={formData.hypertension}
                    onChange={handleChange}
                  >
                    <option value={0}>No</option>
                    <option value={1}>Yes</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Heart Disease</label>
                  <select
                    name="heart_disease"
                    className="form-select"
                    value={formData.heart_disease}
                    onChange={handleChange}
                  >
                    <option value={0}>No</option>
                    <option value={1}>Yes</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Smoking History</label>
                  <select
                    name="smoking_history"
                    className="form-select"
                    value={formData.smoking_history}
                    onChange={handleChange}
                  >
                    <option value="never">Never</option>
                    <option value="former">Former</option>
                    <option value="current">Current</option>
                    <option value="not current">Not Current</option>
                    <option value="No Info">No Info</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">BMI</label>
                  <input
                    name="bmi"
                    type="number"
                    step="0.1"
                    className="form-control"
                    value={formData.bmi}
                    onChange={handleChange}
                    required
                    min="10"
                    max="50"
                    placeholder="e.g., 24.5"
                  />
                  <div className="form-text">Body Mass Index</div>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">HbA1c Level (%)</label>
                  <input
                    name="HbA1c_level"
                    type="number"
                    step="0.1"
                    className="form-control"
                    value={formData.HbA1c_level}
                    onChange={handleChange}
                    required
                    min="3"
                    max="15"
                    placeholder="e.g., 7.2"
                  />
                  <div className="form-text">Glycated Hemoglobin</div>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Blood Glucose (mg/dL)</label>
                  <input
                    name="blood_glucose_level"
                    type="number"
                    className="form-control"
                    value={formData.blood_glucose_level}
                    onChange={handleChange}
                    required
                    min="50"
                    max="500"
                    placeholder="e.g., 140"
                  />
                  <div className="form-text">Fasting Blood Glucose</div>
                </div>
              </div>

              <motion.button
                type="submit"
                className="btn btn-primary w-100 mt-4"
                disabled={loading || !isFormValid}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin me-2"></i>Analyzing Risk...
                  </>
                ) : (
                  <>
                    <i className="fas fa-brain me-2"></i>Calculate Risk Assessment
                  </>
                )}
              </motion.button>
            </form>
          </GlassCard>
        </div>

        {/* Right Side - Preview/Results */}
        <div className="col-lg-6">
          {!result ? (
            <GlassCard className="p-4 text-center">
              <div className="mb-4">
                <i className="fas fa-chart-pie fs-1 text-muted"></i>
              </div>
              <h5>Risk Assessment Preview</h5>
              <p className="text-muted">Fill out the form to see the risk analysis</p>
              {!isFormValid && (
                <div className="mt-3">
                  <small className="text-warning">
                    <i className="fas fa-info-circle me-1"></i>
                    Complete all required fields to enable prediction
                  </small>
                </div>
              )}
            </GlassCard>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <GlassCard className="p-4">
                <h5 className="text-center mb-4">
                  <i className="fas fa-chart-line me-2"></i>Risk Assessment Results
                </h5>

                <div className="mb-4">
                  <RiskGauge riskScore={result.riskScore} riskLabel={result.riskLabel} />
                </div>

                <div className="row g-3 mb-4">
                  <div className="col-6">
                    <div className="text-center">
                      <div className="fw-semibold text-muted small">Risk Score</div>
                      <div className="fs-4 fw-bold">{result.riskScore?.toFixed(3) || 'N/A'}</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="text-center">
                      <div className="fw-semibold text-muted small">Confidence</div>
                      <div className="fs-4 fw-bold">{result.confidence ? `${(result.confidence * 100).toFixed(1)}%` : 'N/A'}</div>
                    </div>
                  </div>
                </div>

                <div className="border-top pt-4">
                  <h6 className="fw-semibold mb-3">
                    <i className="fas fa-lightbulb me-2"></i>Recommendations
                  </h6>
                  <div className="bg-dark p-3 rounded">
                    <p className="mb-2">
                      <strong>Immediate Actions:</strong>
                    </p>
                    <ul className="mb-0 small">
                      <li>Schedule follow-up appointment within 2 weeks</li>
                      <li>Monitor blood glucose levels daily</li>
                      <li>Review medication adherence</li>
                      <li>Consider lifestyle counseling</li>
                    </ul>
                  </div>
                </div>

                <div className="d-flex gap-2 mt-4">
                  <button className="btn btn-outline-primary flex-fill">
                    <i className="fas fa-save me-2"></i>Save to Patient
                  </button>
                  <button className="btn btn-outline-secondary flex-fill">
                    <i className="fas fa-print me-2"></i>Export Report
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
