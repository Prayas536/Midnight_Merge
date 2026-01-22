import React, { useState } from "react";
import { motion } from "framer-motion";
import api from "../../api/axios";
import Toast from "../../components/Toast";

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

  return (
    <motion.div 
      className="container mt-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="row justify-content-center">
        <div className="col-md-8">
          <motion.h3 
            className="mb-4 text-center text-white"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <i className="fas fa-brain me-2"></i>Diabetes Risk Prediction
          </motion.h3>
          <Toast type="error" message={msg} onClose={() => setMsg(null)} />

          <motion.form 
            onSubmit={submit} 
            className="card card-body shadow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  <i className="fas fa-venus-mars me-1"></i>Gender
                </label>
                <select className="form-control" name="gender" value={formData.gender} onChange={handleChange}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  <i className="fas fa-birthday-cake me-1"></i>Age
                </label>
                <input className="form-control" type="number" name="age" value={formData.age} onChange={handleChange} required />
              </div>
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  <i className="fas fa-heartbeat me-1"></i>Hypertension
                </label>
                <select className="form-control" name="hypertension" value={formData.hypertension} onChange={handleChange}>
                  <option value={0}>No</option>
                  <option value={1}>Yes</option>
                </select>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  <i className="fas fa-heart me-1"></i>Heart Disease
                </label>
                <select className="form-control" name="heart_disease" value={formData.heart_disease} onChange={handleChange}>
                  <option value={0}>No</option>
                  <option value={1}>Yes</option>
                </select>
              </div>
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  <i className="fas fa-smoking me-1"></i>Smoking History
                </label>
                <select className="form-control" name="smoking_history" value={formData.smoking_history} onChange={handleChange}>
                  <option value="never">Never</option>
                  <option value="former">Former</option>
                  <option value="current">Current</option>
                  <option value="not current">Not Current</option>
                  <option value="No Info">No Info</option>
                  <option value="ever">Ever</option>
                </select>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  <i className="fas fa-weight me-1"></i>BMI
                </label>
                <input className="form-control" type="number" step="0.1" name="bmi" value={formData.bmi} onChange={handleChange} required />
              </div>
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  <i className="fas fa-vial me-1"></i>HbA1c Level
                </label>
                <input className="form-control" type="number" step="0.1" name="HbA1c_level" value={formData.HbA1c_level} onChange={handleChange} required />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  <i className="fas fa-tint me-1"></i>Blood Glucose Level
                </label>
                <input className="form-control" type="number" name="blood_glucose_level" value={formData.blood_glucose_level} onChange={handleChange} required />
              </div>
            </div>
            <motion.button 
              className="btn btn-primary w-100" 
              disabled={loading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Predicting...
                </>
              ) : (
                <>
                  <i className="fas fa-chart-line me-2"></i>Predict Risk
                </>
              )}
            </motion.button>
          </motion.form>

          {result && (
            <motion.div 
              className="card card-body mt-4 shadow fade-in"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <h5 className="card-title">
                <i className="fas fa-clipboard-check me-2"></i>Prediction Result
              </h5>
              <div className="mb-2">
                <strong>Risk Level:</strong> 
                <span className={`badge ms-2 ${result.riskLabel === 'High Risk' ? 'bg-danger' : result.riskLabel === 'Medium Risk' ? 'bg-warning text-dark' : 'bg-success'}`}>
                  {result.riskLabel}
                </span>
              </div>
              <div className="mb-2"><strong>Risk Score:</strong> {result.riskScore ? `${(result.riskScore * 100).toFixed(2)}%` : 'N/A'}</div>
              <div className="mb-2"><strong>Confidence:</strong> {result.confidence ? `${(result.confidence * 100).toFixed(2)}%` : 'N/A'}</div>
              <div className="text-muted">Model: {result.modelVersion} • Predicted at: {new Date(result.predictedAt).toLocaleString()}</div>
              {result.explanation && (
                <motion.div 
                  className="mt-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <h6><i className="fas fa-robot me-2"></i>AI Explanation:</h6>
                  <div dangerouslySetInnerHTML={{ __html: result.explanation.replace(/\n/g, '<br>') }} />
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
