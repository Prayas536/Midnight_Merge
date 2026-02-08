import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/axios";
import PageHeader from "../../components/layout/PageHeader";
import GlassCard from "../../components/ui/GlassCard";
import RiskGauge from "../../components/charts/RiskGauge";


export default function Predict() {
  const [showModal, setShowModal] = useState(false);
  const [featureName, setFeatureName] = useState("");
  const [activeTab, setActiveTab] = useState("risk"); // "risk" or "medicine"

  const openComingSoon = (feature) => {
    setFeatureName(feature);
    setShowModal(true);
  };

  // Diabetes Risk Form State
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

  // Medicine Recommendation Form State
  const [medicineFormData, setMedicineFormData] = useState({
    Target: "Type 2 Diabetes",
    Genetic_Markers: "Negative",
    Autoantibodies: "Negative",
    Family_History: "No",
    Environmental_Factors: "Absent",
    Insulin_Levels: "",
    Age: "",
    BMI: "",
    Physical_Activity: "Moderate",
    Dietary_Habits: "Healthy",
    Blood_Pressure: "",
    Cholesterol_Levels: "",
    Waist_Circumference: "",
    Blood_Glucose_Levels: "",
    Ethnicity: "Low Risk",
    Socioeconomic_Factors: "Medium",
    Smoking_Status: "Non-Smoker",
    Alcohol_Consumption: "Low",
    Glucose_Tolerance_Test: "Normal",
    History_of_PCOS: "No",
    Previous_Gestational_Diabetes: "No",
    Pregnancy_History: "Normal",
    Weight_Gain_During_Pregnancy: "",
    Pancreatic_Health: "",
    Pulmonary_Function: "",
    Cystic_Fibrosis_Diagnosis: "No",
    Steroid_Use_History: "No",
    Genetic_Testing: "Negative",
    Neurological_Assessments: "",
    Liver_Function_Tests: "Normal",
    Digestive_Enzyme_Levels: "",
    Urine_Test: "Normal",
    Birth_Weight: "",
    Early_Onset_Symptoms: "No",
    diabetes: 0,
    HbA1c_level: ""
  });
  const [medicineMsg, setMedicineMsg] = useState(null);
  const [medicineResult, setMedicineResult] = useState(null);
  const [medicineLoading, setMedicineLoading] = useState(false);
  const [dropdownOptions, setDropdownOptions] = useState(null);

  // Dropdown options for medicine form
  const defaultDropdownOptions = {
    Target: ["Type 2 Diabetes", "Type 1 Diabetes", "Prediabetic", "Gestational Diabetes", "LADA", "MODY", "Steroid-Induced Diabetes", "Neonatal Diabetes Mellitus (NDM)", "Wolfram Syndrome", "Wolcott-Rallison Syndrome", "Secondary Diabetes", "Type 3c Diabetes (Pancreatogenic Diabetes)", "Cystic Fibrosis-Related Diabetes (CFRD)"],
    Genetic_Markers: ["Positive", "Negative"],
    Autoantibodies: ["Positive", "Negative"],
    Family_History: ["Yes", "No"],
    Environmental_Factors: ["Present", "Absent"],
    Physical_Activity: ["High", "Moderate", "Low"],
    Dietary_Habits: ["Healthy", "Unhealthy"],
    Ethnicity: ["Low Risk", "High Risk"],
    Socioeconomic_Factors: ["High", "Medium", "Low"],
    Smoking_Status: ["Smoker", "Non-Smoker"],
    Alcohol_Consumption: ["High", "Moderate", "Low"],
    Glucose_Tolerance_Test: ["Normal", "Abnormal"],
    History_of_PCOS: ["Yes", "No"],
    Previous_Gestational_Diabetes: ["Yes", "No"],
    Pregnancy_History: ["Normal", "Complications"],
    Cystic_Fibrosis_Diagnosis: ["Yes", "No"],
    Steroid_Use_History: ["Yes", "No"],
    Genetic_Testing: ["Positive", "Negative"],
    Liver_Function_Tests: ["Normal", "Abnormal"],
    Urine_Test: ["Normal", "Ketones Present", "Glucose Present", "Protein Present"],
    Early_Onset_Symptoms: ["Yes", "No"],
    diabetes: [0, 1]
  };

  useEffect(() => {
    // Try to fetch dropdown options from API
    const fetchDropdownOptions = async () => {
      try {
        const res = await api.get("/medicine/dropdown-options");
        if (res.data.success) {
          setDropdownOptions(res.data.data);
        }
      } catch (e) {
        console.log("Using default dropdown options");
        setDropdownOptions(defaultDropdownOptions);
      }
    };
    fetchDropdownOptions();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMedicineChange = (e) => {
    const { name, value } = e.target;
    setMedicineFormData(prev => ({
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

  async function submitMedicine(e) {
    e.preventDefault();
    setMedicineLoading(true);
    setMedicineMsg(null);
    setMedicineResult(null);
    try {
      const payload = {
        ...medicineFormData,
        Insulin_Levels: Number(medicineFormData.Insulin_Levels) || 0,
        Age: Number(medicineFormData.Age) || 0,
        BMI: Number(medicineFormData.BMI) || 0,
        Blood_Pressure: Number(medicineFormData.Blood_Pressure) || 0,
        Cholesterol_Levels: Number(medicineFormData.Cholesterol_Levels) || 0,
        Waist_Circumference: Number(medicineFormData.Waist_Circumference) || 0,
        Blood_Glucose_Levels: Number(medicineFormData.Blood_Glucose_Levels) || 0,
        Weight_Gain_During_Pregnancy: Number(medicineFormData.Weight_Gain_During_Pregnancy) || 0,
        Pancreatic_Health: Number(medicineFormData.Pancreatic_Health) || 0,
        Pulmonary_Function: Number(medicineFormData.Pulmonary_Function) || 0,
        Neurological_Assessments: Number(medicineFormData.Neurological_Assessments) || 0,
        Digestive_Enzyme_Levels: Number(medicineFormData.Digestive_Enzyme_Levels) || 0,
        Birth_Weight: Number(medicineFormData.Birth_Weight) || 0,
        diabetes: Number(medicineFormData.diabetes),
        HbA1c_level: Number(medicineFormData.HbA1c_level) || 0
      };
      const res = await api.post("/medicine/recommend", payload);
      setMedicineResult(res.data.data);
    } catch (e2) {
      setMedicineMsg(e2?.response?.data?.message || "Medicine recommendation failed");
    } finally {
      setMedicineLoading(false);
    }
  }

  const isFormValid = formData.age && formData.bmi && formData.HbA1c_level && formData.blood_glucose_level;
  const isMedicineFormValid = medicineFormData.Age && medicineFormData.BMI && medicineFormData.HbA1c_level && medicineFormData.Blood_Glucose_Levels;

  const options = dropdownOptions || defaultDropdownOptions;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <PageHeader
        title="Diabetes Risk Assessment & Medicine Recommendation"
        subtitle="Advanced AI-powered risk prediction and personalized treatment recommendations"
      />

      {/* Tab Navigation */}
      <div className="mb-4">
        <GlassCard className="p-2 d-inline-flex bg-light bg-opacity-50 rounded-pill p-1 border">
          <button
            type="button"
            className={`btn btn-sm rounded-pill px-4 fw-semibold transition-all ${activeTab === "risk" ? "bg-white shadow-sm text-primary" : "text-muted hover-text-dark"}`}
            onClick={() => setActiveTab("risk")}
            style={{ minWidth: '180px' }}
          >
            <i className="fas fa-chart-line me-2"></i>Risk Assessment
          </button>
          <button
            type="button"
            className={`btn btn-sm rounded-pill px-4 fw-semibold transition-all ${activeTab === "medicine" ? "bg-white shadow-sm text-primary" : "text-muted hover-text-dark"}`}
            onClick={() => setActiveTab("medicine")}
            style={{ minWidth: '180px' }}
          >
            <i className="fas fa-pills me-2"></i>Medicine Recommendation
          </button>
        </GlassCard>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "risk" && (
          <motion.div
            key="risk"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
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
                        <div className=" p-3 rounded">
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
                        <button
                          className="btn btn-outline-primary flex-fill"
                          onClick={() => openComingSoon("Save to Patient")}
                        >
                          <i className="fas fa-save me-2"></i>Save to Patient
                        </button>
                        <button
                          className="btn btn-outline-secondary flex-fill"
                          onClick={() => openComingSoon("Export Report")}
                        >
                          <i className="fas fa-print me-2"></i>Export Report
                        </button>
                      </div>
                    </GlassCard>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "medicine" && (
          <motion.div
            key="medicine"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="row g-4">
              {/* Medicine Form */}
              <div className="col-lg-8">
                <GlassCard className="p-4">
                  <h5 className="mb-4">
                    <i className="fas fa-pills me-2"></i>Patient Health Data for Medicine Recommendation
                  </h5>

                  {medicineMsg && (
                    <motion.div
                      className="alert alert-danger"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {medicineMsg}
                    </motion.div>
                  )}

                  <form onSubmit={submitMedicine}>
                    {/* Basic Info Section */}
                    <h6 className="text-primary mb-3 border-bottom pb-2">
                      <i className="fas fa-user me-2"></i>Basic Information
                    </h6>
                    <div className="row g-3 mb-4">
                      <div className="col-md-4">
                        <label className="form-label fw-semibold">Diabetes Type</label>
                        <select name="Target" className="form-select" value={medicineFormData.Target} onChange={handleMedicineChange}>
                          {options.Target?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label fw-semibold">Age</label>
                        <input name="Age" type="number" className="form-control" value={medicineFormData.Age} onChange={handleMedicineChange} placeholder="Years" min="0" max="120" />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label fw-semibold">BMI</label>
                        <input name="BMI" type="number" step="0.1" className="form-control" value={medicineFormData.BMI} onChange={handleMedicineChange} placeholder="kg/m²" min="10" max="60" />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label fw-semibold">Diabetes Status</label>
                        <select name="diabetes" className="form-select" value={medicineFormData.diabetes} onChange={handleMedicineChange}>
                          <option value={0}>No</option>
                          <option value={1}>Yes</option>
                        </select>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label fw-semibold">HbA1c Level (%)</label>
                        <input name="HbA1c_level" type="number" step="0.1" className="form-control" value={medicineFormData.HbA1c_level} onChange={handleMedicineChange} placeholder="e.g., 7.2" min="0" max="15" />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label fw-semibold">Blood Glucose (mg/dL)</label>
                        <input name="Blood_Glucose_Levels" type="number" className="form-control" value={medicineFormData.Blood_Glucose_Levels} onChange={handleMedicineChange} placeholder="e.g., 140" min="0" max="600" />
                      </div>
                    </div>

                    {/* Genetic & Family Section */}
                    <h6 className="text-primary mb-3 border-bottom pb-2">
                      <i className="fas fa-dna me-2"></i>Genetic & Family History
                    </h6>
                    <div className="row g-3 mb-4">
                      <div className="col-md-3">
                        <label className="form-label fw-semibold">Genetic Markers</label>
                        <select name="Genetic_Markers" className="form-select" value={medicineFormData.Genetic_Markers} onChange={handleMedicineChange}>
                          {options.Genetic_Markers?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                      <div className="col-md-3">
                        <label className="form-label fw-semibold">Autoantibodies</label>
                        <select name="Autoantibodies" className="form-select" value={medicineFormData.Autoantibodies} onChange={handleMedicineChange}>
                          {options.Autoantibodies?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                      <div className="col-md-3">
                        <label className="form-label fw-semibold">Family History</label>
                        <select name="Family_History" className="form-select" value={medicineFormData.Family_History} onChange={handleMedicineChange}>
                          {options.Family_History?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                      <div className="col-md-3">
                        <label className="form-label fw-semibold">Genetic Testing</label>
                        <select name="Genetic_Testing" className="form-select" value={medicineFormData.Genetic_Testing} onChange={handleMedicineChange}>
                          {options.Genetic_Testing?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Health Metrics Section */}
                    <h6 className="text-primary mb-3 border-bottom pb-2">
                      <i className="fas fa-heartbeat me-2"></i>Health Metrics
                    </h6>
                    <div className="row g-3 mb-4">
                      <div className="col-md-3">
                        <label className="form-label fw-semibold">Insulin Levels</label>
                        <input name="Insulin_Levels" type="number" className="form-control" value={medicineFormData.Insulin_Levels} onChange={handleMedicineChange} placeholder="µU/mL" />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label fw-semibold">Blood Pressure</label>
                        <input name="Blood_Pressure" type="number" className="form-control" value={medicineFormData.Blood_Pressure} onChange={handleMedicineChange} placeholder="mmHg" />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label fw-semibold">Cholesterol</label>
                        <input name="Cholesterol_Levels" type="number" className="form-control" value={medicineFormData.Cholesterol_Levels} onChange={handleMedicineChange} placeholder="mg/dL" />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label fw-semibold">Waist Circumference</label>
                        <input name="Waist_Circumference" type="number" className="form-control" value={medicineFormData.Waist_Circumference} onChange={handleMedicineChange} placeholder="cm" />
                      </div>
                    </div>

                    {/* Lifestyle Section */}
                    <h6 className="text-primary mb-3 border-bottom pb-2">
                      <i className="fas fa-running me-2"></i>Lifestyle & Demographics
                    </h6>
                    <div className="row g-3 mb-4">
                      <div className="col-md-3">
                        <label className="form-label fw-semibold">Physical Activity</label>
                        <select name="Physical_Activity" className="form-select" value={medicineFormData.Physical_Activity} onChange={handleMedicineChange}>
                          {options.Physical_Activity?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                      <div className="col-md-3">
                        <label className="form-label fw-semibold">Dietary Habits</label>
                        <select name="Dietary_Habits" className="form-select" value={medicineFormData.Dietary_Habits} onChange={handleMedicineChange}>
                          {options.Dietary_Habits?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                      <div className="col-md-3">
                        <label className="form-label fw-semibold">Smoking Status</label>
                        <select name="Smoking_Status" className="form-select" value={medicineFormData.Smoking_Status} onChange={handleMedicineChange}>
                          {options.Smoking_Status?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                      <div className="col-md-3">
                        <label className="form-label fw-semibold">Alcohol Consumption</label>
                        <select name="Alcohol_Consumption" className="form-select" value={medicineFormData.Alcohol_Consumption} onChange={handleMedicineChange}>
                          {options.Alcohol_Consumption?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                      <div className="col-md-3">
                        <label className="form-label fw-semibold">Ethnicity Risk</label>
                        <select name="Ethnicity" className="form-select" value={medicineFormData.Ethnicity} onChange={handleMedicineChange}>
                          {options.Ethnicity?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                      <div className="col-md-3">
                        <label className="form-label fw-semibold">Socioeconomic</label>
                        <select name="Socioeconomic_Factors" className="form-select" value={medicineFormData.Socioeconomic_Factors} onChange={handleMedicineChange}>
                          {options.Socioeconomic_Factors?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                      <div className="col-md-3">
                        <label className="form-label fw-semibold">Env. Factors</label>
                        <select name="Environmental_Factors" className="form-select" value={medicineFormData.Environmental_Factors} onChange={handleMedicineChange}>
                          {options.Environmental_Factors?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Medical History Section */}
                    <h6 className="text-primary mb-3 border-bottom pb-2">
                      <i className="fas fa-file-medical me-2"></i>Medical History & Tests
                    </h6>
                    <div className="row g-3 mb-4">
                      <div className="col-md-3">
                        <label className="form-label fw-semibold">Glucose Tolerance</label>
                        <select name="Glucose_Tolerance_Test" className="form-select" value={medicineFormData.Glucose_Tolerance_Test} onChange={handleMedicineChange}>
                          {options.Glucose_Tolerance_Test?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                      <div className="col-md-3">
                        <label className="form-label fw-semibold">Liver Function</label>
                        <select name="Liver_Function_Tests" className="form-select" value={medicineFormData.Liver_Function_Tests} onChange={handleMedicineChange}>
                          {options.Liver_Function_Tests?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                      <div className="col-md-3">
                        <label className="form-label fw-semibold">Urine Test</label>
                        <select name="Urine_Test" className="form-select" value={medicineFormData.Urine_Test} onChange={handleMedicineChange}>
                          {options.Urine_Test?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                      <div className="col-md-3">
                        <label className="form-label fw-semibold">Early Onset</label>
                        <select name="Early_Onset_Symptoms" className="form-select" value={medicineFormData.Early_Onset_Symptoms} onChange={handleMedicineChange}>
                          {options.Early_Onset_Symptoms?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                      <div className="col-md-3">
                        <label className="form-label fw-semibold">Pancreatic Health</label>
                        <input name="Pancreatic_Health" type="number" className="form-control" value={medicineFormData.Pancreatic_Health} onChange={handleMedicineChange} placeholder="Score" />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label fw-semibold">Pulmonary Function</label>
                        <input name="Pulmonary_Function" type="number" className="form-control" value={medicineFormData.Pulmonary_Function} onChange={handleMedicineChange} placeholder="%" />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label fw-semibold">Neuro Assessments</label>
                        <input name="Neurological_Assessments" type="number" className="form-control" value={medicineFormData.Neurological_Assessments} onChange={handleMedicineChange} placeholder="Score" />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label fw-semibold">Digestive Enzymes</label>
                        <input name="Digestive_Enzyme_Levels" type="number" className="form-control" value={medicineFormData.Digestive_Enzyme_Levels} onChange={handleMedicineChange} placeholder="U/L" />
                      </div>
                    </div>

                    {/* Special Conditions Section */}
                    <h6 className="text-primary mb-3 border-bottom pb-2">
                      <i className="fas fa-notes-medical me-2"></i>Special Conditions
                    </h6>
                    <div className="row g-3 mb-4">
                      <div className="col-md-3">
                        <label className="form-label fw-semibold">History of PCOS</label>
                        <select name="History_of_PCOS" className="form-select" value={medicineFormData.History_of_PCOS} onChange={handleMedicineChange}>
                          {options.History_of_PCOS?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                      <div className="col-md-3">
                        <label className="form-label fw-semibold">Prev. Gest. Diabetes</label>
                        <select name="Previous_Gestational_Diabetes" className="form-select" value={medicineFormData.Previous_Gestational_Diabetes} onChange={handleMedicineChange}>
                          {options.Previous_Gestational_Diabetes?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                      <div className="col-md-3">
                        <label className="form-label fw-semibold">Pregnancy History</label>
                        <select name="Pregnancy_History" className="form-select" value={medicineFormData.Pregnancy_History} onChange={handleMedicineChange}>
                          {options.Pregnancy_History?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                      <div className="col-md-3">
                        <label className="form-label fw-semibold">Weight Gain (Preg.)</label>
                        <input name="Weight_Gain_During_Pregnancy" type="number" className="form-control" value={medicineFormData.Weight_Gain_During_Pregnancy} onChange={handleMedicineChange} placeholder="kg" />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label fw-semibold">Cystic Fibrosis</label>
                        <select name="Cystic_Fibrosis_Diagnosis" className="form-select" value={medicineFormData.Cystic_Fibrosis_Diagnosis} onChange={handleMedicineChange}>
                          {options.Cystic_Fibrosis_Diagnosis?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                      <div className="col-md-3">
                        <label className="form-label fw-semibold">Steroid Use</label>
                        <select name="Steroid_Use_History" className="form-select" value={medicineFormData.Steroid_Use_History} onChange={handleMedicineChange}>
                          {options.Steroid_Use_History?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                      <div className="col-md-3">
                        <label className="form-label fw-semibold">Birth Weight</label>
                        <input name="Birth_Weight" type="number" className="form-control" value={medicineFormData.Birth_Weight} onChange={handleMedicineChange} placeholder="grams" />
                      </div>
                    </div>

                    <motion.button
                      type="submit"
                      className="btn btn-success w-100 mt-3"
                      disabled={medicineLoading || !isMedicineFormValid}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {medicineLoading ? (
                        <>
                          <i className="fas fa-spinner fa-spin me-2"></i>Analyzing...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-prescription-bottle-alt me-2"></i>Get Medicine Recommendation
                        </>
                      )}
                    </motion.button>
                  </form>
                </GlassCard>
              </div>

              {/* Medicine Results */}
              <div className="col-lg-4">
                {!medicineResult ? (
                  <GlassCard className="p-4 text-center">
                    <div className="mb-4">
                      <i className="fas fa-pills fs-1 text-muted"></i>
                    </div>
                    <h5>Medicine Recommendation</h5>
                    <p className="text-muted">Fill out the comprehensive patient data to receive AI-powered medicine recommendations</p>
                    {!isMedicineFormValid && (
                      <div className="mt-3">
                        <small className="text-warning">
                          <i className="fas fa-info-circle me-1"></i>
                          Fill in Age, BMI, HbA1c, and Blood Glucose to enable recommendation
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
                        <i className="fas fa-prescription me-2"></i>Recommendation Results
                      </h5>

                      {/* Medicine Card */}
                      <div className="card border-0 shadow-sm mb-3 overflow-hidden text-white" style={{ background: 'linear-gradient(135deg, #11998e, #38ef7d)' }}>
                        <div className="card-body text-center p-4">
                          <div className="mb-2 bg-white bg-opacity-25 d-inline-block px-3 py-1 rounded-pill">
                            <small className="fw-bold text-uppercase" style={{ letterSpacing: '1px' }}>Recommended Medicine</small>
                          </div>
                          <h3 className="card-title mb-0 display-6 fw-bold mt-2">{medicineResult.recommendedMedicine}</h3>
                        </div>
                      </div>

                      {/* Dosage Card */}
                      <div className="card border-0 shadow-sm mb-3 overflow-hidden text-white" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
                        <div className="card-body text-center p-4">
                          <div className="mb-2 bg-white bg-opacity-25 d-inline-block px-3 py-1 rounded-pill">
                            <small className="fw-bold text-uppercase" style={{ letterSpacing: '1px' }}>Recommended Dosage</small>
                          </div>
                          <h3 className="card-title mb-0 display-6 fw-bold mt-2">{medicineResult.dosage || 'Standard Dosage'}</h3>
                          <small className="d-block mt-2 opacity-75">Take as prescribed by physician</small>
                        </div>
                      </div>


                      {/* Confidence */}
                      <div className="row g-2 mb-4">
                        <div className="col-6">
                          <div className="text-center p-2 rounded" style={{ background: 'var(--glass-bg)' }}>
                            <small className="text-muted d-block">Medicine Confidence</small>
                            <strong>{(medicineResult.medicineConfidence * 100).toFixed(1)}%</strong>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="text-center p-2 rounded" style={{ background: 'var(--glass-bg)' }}>
                            <small className="text-muted d-block">Dosage Confidence</small>
                            <strong>{(medicineResult.dosageConfidence * 100).toFixed(1)}%</strong>
                          </div>
                        </div>
                      </div>

                      {/* All Probabilities */}
                      {medicineResult.allProbabilities && (
                        <div className="border-top pt-3">
                          <h6 className="small fw-semibold mb-2">All Treatment Probabilities</h6>
                          {Object.entries(medicineResult.allProbabilities).map(([med, prob]) => (
                            <div key={med} className="d-flex justify-content-between align-items-center mb-2">
                              <span className="small">{med}</span>
                              <div className="progress flex-grow-1 mx-2" style={{ height: '8px' }}>
                                <div className="progress-bar bg-success" style={{ width: `${prob * 100}%` }}></div>
                              </div>
                              <span className="small fw-semibold">{(prob * 100).toFixed(1)}%</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="alert alert-warning mt-3 small">
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        <strong>Disclaimer:</strong> This is an AI-generated recommendation. Always use clinical judgment and consider individual patient factors.
                      </div>

                      <div className="d-flex gap-2 mt-3">
                        <button
                          className="btn btn-outline-primary flex-fill"
                          onClick={() => openComingSoon("Save Prescription")}
                        >
                          <i className="fas fa-save me-2"></i>Save
                        </button>
                        <button
                          className="btn btn-outline-secondary flex-fill"
                          onClick={() => openComingSoon("Print Prescription")}
                        >
                          <i className="fas fa-print me-2"></i>Print
                        </button>
                      </div>
                    </GlassCard>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div >
        )
        }
      </AnimatePresence >

      {/* Coming Soon Modal */}
      {
        showModal && (
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <motion.div
                className="modal-content"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <div className="modal-header">
                  <h5 className="modal-title">
                    <i className="fas fa-tools me-2"></i>Coming Soon
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  ></button>
                </div>

                <div className="modal-body text-center">
                  <i className="fas fa-hourglass-half fs-1 text-primary mb-3"></i>
                  <p className="mb-1 fw-semibold">{featureName}</p>
                  <p className="text-muted mb-0">
                    This feature is under development and will be available soon
                  </p>
                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-primary w-100"
                    onClick={() => setShowModal(false)}
                  >
                    Got it
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Backdrop */}
            <div
              className="modal-backdrop fade show"
              onClick={() => setShowModal(false)}
            ></div>
          </div>
        )
      }
    </motion.div >
  );
}
