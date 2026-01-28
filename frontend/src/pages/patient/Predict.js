import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import PageHeader from "../../components/layout/PageHeader";
import GlassCard from "../../components/ui/GlassCard";
import RiskGauge from "../../components/charts/RiskGauge";

export default function PatientPredict() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
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
  const [showPostPredictionModal, setShowPostPredictionModal] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await api.get("/my/profile");
      const profileData = res.data.data;
      setProfile(profileData);

      // Pre-fill form with profile data
      setFormData(prev => ({
        ...prev,
        gender: profileData.gender || prev.gender,
        age: profileData.dob ? new Date().getFullYear() - new Date(profileData.dob).getFullYear() : prev.age,
        hypertension: profileData.hypertension ? 1 : 0,
        heart_disease: profileData.heartDisease ? 1 : 0,
        smoking_history: profileData.smokingHistory || prev.smoking_history,
        bmi: profileData.bmi || prev.bmi,
        HbA1c_level: profileData.HbA1cLevel || prev.HbA1c_level,
        blood_glucose_level: profileData.bloodGlucoseLevel || prev.blood_glucose_level
      }));
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

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
      
      // Save prediction context for AI chat
      localStorage.setItem(
        "prediction_context",
        JSON.stringify({
          prediction: res.data.data.prediction,
          risk_percent: res.data.data.risk_percent,
          patient_data: formData
        })
      );

      // Show post-prediction modal after a brief delay
      setTimeout(() => {
        setShowPostPredictionModal(true);
      }, 800);
    } catch (e2) {
      setMsg(e2?.response?.data?.message || "Prediction failed");
    } finally {
      setLoading(false);
    }
  }

  const handleOpenAIChat = () => {
    setShowPostPredictionModal(false);
    navigate("/patient/ai-chat");
  };

  const isFormValid = formData.age && formData.bmi && formData.HbA1c_level && formData.blood_glucose_level;

  const getNextSteps = (riskLabel) => {
    switch (riskLabel) {
      case 'High':
        return {
          title: "Immediate Action Required",
          steps: [
            "Schedule an appointment with your doctor within 1 week",
            "Monitor blood glucose levels daily",
            "Review and adjust medication as prescribed",
            "Consider lifestyle modifications and dietary changes",
            "Regular exercise and weight management"
          ],
          color: "danger"
        };
      case 'Medium':
        return {
          title: "Monitor Closely",
          steps: [
            "Schedule follow-up appointment within 2-4 weeks",
            "Continue regular blood glucose monitoring",
            "Maintain healthy lifestyle habits",
            "Discuss results with your healthcare provider",
            "Consider preventive measures"
          ],
          color: "warning"
        };
      default:
        return {
          title: "Maintain Healthy Habits",
          steps: [
            "Continue regular check-ups every 3-6 months",
            "Maintain healthy diet and exercise routine",
            "Monitor blood glucose levels as recommended",
            "Stay informed about diabetes prevention",
            "Share results with your doctor for records"
          ],
          color: "success"
        };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <PageHeader
        title="Diabetes Risk Assessment"
        subtitle="Get personalized insights about your diabetes risk factors"
      />

      <div className="row g-4">
        {/* Form Section */}
        <div className="col-lg-8">
          <GlassCard className="p-4">
            <h5 className="mb-4">
              <i className="fas fa-clipboard-list me-2"></i>Health Information
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
                    placeholder="Enter your age"
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
                    placeholder="e.g., 5.7"
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
                    placeholder="e.g., 95"
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
                    <i className="fas fa-spinner fa-spin me-2"></i>Analyzing Your Risk...
                  </>
                ) : (
                  <>
                    <i className="fas fa-brain me-2"></i>Get My Risk Assessment
                  </>
                )}
              </motion.button>
            </form>
          </GlassCard>
        </div>

        {/* Results Section */}
        <div className="col-lg-4">
          {!result ? (
            <GlassCard className="p-4 text-center">
              <div className="mb-4">
                <i className="fas fa-chart-pie fs-1 text-muted"></i>
              </div>
              <h6>Your Risk Assessment</h6>
              <p className="text-muted small">Complete the form to see your personalized risk analysis</p>
            </GlassCard>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <GlassCard className="p-4 mb-4">
                <h6 className="text-center mb-4">Your Risk Assessment</h6>
                <RiskGauge riskScore={result.riskScore} riskLabel={result.riskLabel} />
                <div className="text-center mt-3">
                  <small className="text-muted">Confidence: {(result.confidence * 100).toFixed(1)}%</small>
                </div>
              </GlassCard>

              {/* Next Steps Card */}
              <GlassCard className={`p-4 border-${getNextSteps(result.riskLabel).color}`}>
                <div className="d-flex align-items-start mb-3">
                  <i className={`fas fa-info-circle text-${getNextSteps(result.riskLabel).color} me-2 mt-1`}></i>
                  <h6 className={`mb-0 text-${getNextSteps(result.riskLabel).color}`}>
                    {getNextSteps(result.riskLabel).title}
                  </h6>
                </div>
                <ul className="small mb-0">
                  {getNextSteps(result.riskLabel).steps.map((step, index) => (
                    <li key={index} className="mb-2">{step}</li>
                  ))}
                </ul>
                <div className="mt-3 pt-3 border-top">
                  <p className="small text-muted mb-2">
                    <i className="fas fa-user-md me-1"></i>
                    Remember: This is not a medical diagnosis. Always consult with your healthcare provider.
                  </p>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </div>
      </div>

      {/* Post-Prediction Modal */}
      {showPostPredictionModal && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowPostPredictionModal(false)}
        >
          <motion.div
            className="modal-content-prediction"
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header-prediction">
              <h5 className="modal-title-prediction">
                <i className="fas fa-check-circle text-success me-2"></i>
                Assessment Complete!
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowPostPredictionModal(false)}
              ></button>
            </div>
            <div className="modal-body-prediction">
              <p className="mb-3">
                Your risk assessment has been completed and saved. Would you like to chat with our AI Assistant for personalized insights and recommendations?
              </p>
              <div className="alert alert-info mb-3">
                <i className="fas fa-lightbulb me-2"></i>
                <strong>AI Assistant can:</strong> Answer your health questions, explain risk factors, and provide lifestyle recommendations.
              </div>
            </div>
            <div className="modal-footer-prediction">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowPostPredictionModal(false)}
              >
                Maybe Later
              </button>
              <button
                type="button"
                className="btn btn-primary gradient-btn"
                onClick={handleOpenAIChat}
              >
                <i className="fas fa-robot me-2"></i>
                Chat with AI Assistant
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
