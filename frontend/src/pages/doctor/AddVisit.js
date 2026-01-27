import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/axios";
import PageHeader from "../../components/layout/PageHeader";
import GlassCard from "../../components/ui/GlassCard";
import RiskGauge from "../../components/charts/RiskGauge";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function AddVisit() {
  const { id } = useParams();
  const nav = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [msg, setMsg] = useState(null);

  // Form data
  const [visitDate, setVisitDate] = useState(new Date().toISOString().slice(0, 10));
  const [gender, setGender] = useState("Male");
  const [age, setAge] = useState("");
  const [hypertension, setHypertension] = useState(0);
  const [heartDisease, setHeartDisease] = useState(0);
  const [smokingHistory, setSmokingHistory] = useState("never");
  const [bmi, setBmi] = useState("");
  const [HbA1cLevel, setHbA1c] = useState("");
  const [bloodGlucoseLevel, setGlucose] = useState("");
  const [notes, setNotes] = useState("");
  const [recommendations, setRecs] = useState("");

  // Prediction
  const [savePrediction, setSavePrediction] = useState(true);
  const [predLoading, setPredLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);

  const steps = [
    { id: 1, title: "Patient Info", icon: "fas fa-user" },
    { id: 2, title: "Health Metrics", icon: "fas fa-heartbeat" },
    { id: 3, title: "Assessment", icon: "fas fa-stethoscope" },
    { id: 4, title: "Review & Save", icon: "fas fa-check-circle" }
  ];

  useEffect(() => {
    async function fetchPatient() {
      try {
        const res = await api.get(`/patients/${id}`);
        const p = res.data.data;
        setPatient(p);
        setGender(p.gender.charAt(0).toUpperCase() + p.gender.slice(1));
        const today = new Date();
        const birthDate = new Date(p.dob);
        let calculatedAge = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          calculatedAge--;
        }
        setAge(calculatedAge.toString());
        if (p.hypertension !== null) setHypertension(p.hypertension ? 1 : 0);
        if (p.heartDisease !== null) setHeartDisease(p.heartDisease ? 1 : 0);
        if (p.smokingHistory) setSmokingHistory(p.smokingHistory);
        if (p.bmi) setBmi(p.bmi.toString());
        if (p.HbA1cLevel) setHbA1c(p.HbA1cLevel.toString());
        if (p.bloodGlucoseLevel) setGlucose(p.bloodGlucoseLevel.toString());
      } catch (e) {
        setMsg("Failed to load patient data");
      } finally {
        setLoading(false);
      }
    }
    fetchPatient();
  }, [id]);

  async function runPrediction() {
    setPredLoading(true);
    setMsg(null);
    try {
      const payload = {
        gender,
        age: age === "" ? null : Number(age),
        hypertension: Number(hypertension),
        heart_disease: Number(heartDisease),
        smoking_history: smokingHistory,
        bmi: bmi === "" ? null : Number(bmi),
        HbA1c_level: HbA1cLevel === "" ? null : Number(HbA1cLevel),
        blood_glucose_level: bloodGlucoseLevel === "" ? null : Number(bloodGlucoseLevel),
      };
      const res = await api.post("/predictions", payload);
      setPrediction(res.data.data);
    } catch (e) {
      setMsg(e?.response?.data?.message || "Prediction failed");
    } finally {
      setPredLoading(false);
    }
  }

  async function submit(e) {
    if (e && e.preventDefault) e.preventDefault();
    setMsg(null);
    try {
      const payload = {
        visitDate,
        metrics: {
          gender,
          age: age === "" ? null : Number(age),
          hypertension: Number(hypertension),
          heartDisease: Number(heartDisease),
          smokingHistory,
          bmi: bmi === "" ? null : Number(bmi),
          HbA1cLevel: HbA1cLevel === "" ? null : Number(HbA1cLevel),
          bloodGlucoseLevel: bloodGlucoseLevel === "" ? null : Number(bloodGlucoseLevel),
        },
        notes,
        recommendations,
        prediction: savePrediction && prediction ? {
          riskLabel: prediction.riskLabel,
          riskScore: prediction.riskScore,
          confidence: prediction.confidence,
          modelVersion: prediction.modelVersion,
          predictedAt: prediction.predictedAt,
        } : undefined,
      };
      const response = await api.post(`/patients/${id}/visits`, payload);
      if (response.data.success) {
        nav(`/doctor/patients/${id}`);
      }
    } catch (e) {
      console.error('Submit error:', e);
      const errorMsg = e?.response?.data?.message || e?.message || "Save failed";
      setMsg(errorMsg);
    }
  }

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1: return visitDate && age;
      case 2: return bmi || HbA1cLevel || bloodGlucoseLevel;
      case 3: return true; // Assessment is optional
      case 4: return true; // Review step
      default: return false;
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <PageHeader
        title="Add New Visit"
        subtitle={`Recording visit for ${patient?.name}`}
        showBack={true}
        backTo={`/doctor/patients/${id}`}
      />

      {msg && (
        <motion.div
          className="alert alert-danger"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {msg}
        </motion.div>
      )}

      {/* Stepper Progress */}
      <GlassCard className="p-4 mb-4">
        <div className="stepper">
          {steps.map((step, index) => (
            <div key={step.id} className="stepper-item">
              <div className={`stepper-circle ${currentStep >= step.id ? 'active' : ''}`}>
                <i className={step.icon}></i>
              </div>
              <div className="stepper-label">{step.title}</div>
              {index < steps.length - 1 && (
                <div className={`stepper-line ${currentStep > step.id ? 'active' : ''}`}></div>
              )}
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {currentStep === 1 && (
            <GlassCard className="p-4">
              <h5 className="mb-4">
                <i className="fas fa-user me-2 text-primary"></i>Patient Information
              </h5>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Patient Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={patient?.name || ""}
                    readOnly
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    <i className="fas fa-calendar me-2"></i>Visit Date *
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Gender</label>
                  <input
                    type="text"
                    className="form-control"
                    value={gender}
                    readOnly
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    <i className="fas fa-birthday-cake me-2"></i>Age *
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    required
                    min="1"
                    max="120"
                  />
                </div>
              </div>
            </GlassCard>
          )}

          {currentStep === 2 && (
            <GlassCard className="p-4">
              <h5 className="mb-4">
                <i className="fas fa-heartbeat me-2 text-danger"></i>Health Metrics
              </h5>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    <i className="fas fa-heartbeat me-2"></i>Hypertension
                  </label>
                  <select
                    className="form-select"
                    value={hypertension}
                    onChange={(e) => setHypertension(e.target.value)}
                  >
                    <option value={0}>No</option>
                    <option value={1}>Yes</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    <i className="fas fa-heart me-2"></i>Heart Disease
                  </label>
                  <select
                    className="form-select"
                    value={heartDisease}
                    onChange={(e) => setHeartDisease(e.target.value)}
                  >
                    <option value={0}>No</option>
                    <option value={1}>Yes</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    <i className="fas fa-smoking me-2"></i>Smoking History
                  </label>
                  <select
                    className="form-select"
                    value={smokingHistory}
                    onChange={(e) => setSmokingHistory(e.target.value)}
                  >
                    <option value="never">Never</option>
                    <option value="former">Former</option>
                    <option value="current">Current</option>
                    <option value="not current">Not Current</option>
                    <option value="No Info">No Info</option>
                    <option value="ever">Ever</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    <i className="fas fa-weight me-2"></i>BMI
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-control"
                    value={bmi}
                    onChange={(e) => setBmi(e.target.value)}
                    placeholder="e.g., 24.5"
                    min="10"
                    max="50"
                  />
                  <div className="form-text">Body Mass Index</div>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    <i className="fas fa-vial me-2"></i>HbA1c Level (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-control"
                    value={HbA1cLevel}
                    onChange={(e) => setHbA1c(e.target.value)}
                    placeholder="e.g., 5.7"
                    min="3"
                    max="15"
                  />
                  <div className="form-text">Glycated Hemoglobin</div>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    <i className="fas fa-tint me-2"></i>Blood Glucose (mg/dL)
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    value={bloodGlucoseLevel}
                    onChange={(e) => setGlucose(e.target.value)}
                    placeholder="e.g., 95"
                    min="50"
                    max="500"
                  />
                  <div className="form-text">Fasting Blood Glucose</div>
                </div>
              </div>
            </GlassCard>
          )}

          {currentStep === 3 && (
            <div className="row g-4">
              <div className="col-lg-8">
                <GlassCard className="p-4">
                  <h5 className="mb-4">
                    <i className="fas fa-stethoscope me-2 text-info"></i>Clinical Assessment
                  </h5>
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Doctor's Notes</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Enter clinical observations, symptoms, and assessment notes..."
                    />
                  </div>
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Recommendations</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      value={recommendations}
                      onChange={(e) => setRecs(e.target.value)}
                      placeholder="Enter treatment recommendations, lifestyle advice, and follow-up instructions..."
                    />
                  </div>
                </GlassCard>
              </div>
              <div className="col-lg-4">
                <GlassCard className="p-4 mb-4">
                  <h6 className="mb-3">
                    <i className="fas fa-brain me-2"></i>Risk Assessment
                  </h6>
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={savePrediction}
                        onChange={(e) => setSavePrediction(e.target.checked)}
                      />
                      <label className="form-check-label small">
                        Include prediction in visit record
                      </label>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline-primary w-100 mb-3"
                    onClick={runPrediction}
                    disabled={predLoading}
                  >
                    {predLoading ? (
                      <>
                        <i className="fas fa-spinner fa-spin me-2"></i>Analyzing...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-chart-line me-2"></i>Run Risk Assessment
                      </>
                    )}
                  </button>
                  {prediction && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center"
                    >
                      <RiskGauge riskScore={prediction.riskScore} riskLabel={prediction.riskLabel} />
                      <div className="mt-2">
                        <small className="text-muted">
                          Confidence: {(prediction.confidence * 100).toFixed(1)}%
                        </small>
                      </div>
                    </motion.div>
                  )}
                </GlassCard>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <GlassCard className="p-4">
              <h5 className="mb-4">
                <i className="fas fa-check-circle me-2 text-success"></i>Review & Save Visit
              </h5>
              <div className="review-section">
                <div className="review-item">
                  <h6>Visit Information</h6>
                  <div className="review-grid">
                    <div><strong>Patient:</strong> {patient?.name}</div>
                    <div><strong>Date:</strong> {new Date(visitDate).toLocaleDateString()}</div>
                    <div><strong>Age:</strong> {age} years</div>
                    <div><strong>Gender:</strong> {gender}</div>
                  </div>
                </div>

                <div className="review-item">
                  <h6>Health Metrics</h6>
                  <div className="review-grid">
                    <div><strong>BMI:</strong> {bmi || 'Not recorded'}</div>
                    <div><strong>HbA1c:</strong> {HbA1cLevel ? `${HbA1cLevel}%` : 'Not recorded'}</div>
                    <div><strong>Blood Glucose:</strong> {bloodGlucoseLevel ? `${bloodGlucoseLevel} mg/dL` : 'Not recorded'}</div>
                    <div><strong>Hypertension:</strong> {hypertension ? 'Yes' : 'No'}</div>
                    <div><strong>Heart Disease:</strong> {heartDisease ? 'Yes' : 'No'}</div>
                    <div><strong>Smoking:</strong> {smokingHistory}</div>
                  </div>
                </div>

                {notes && (
                  <div className="review-item">
                    <h6>Doctor's Notes</h6>
                    <p className="mb-0">{notes}</p>
                  </div>
                )}

                {recommendations && (
                  <div className="review-item">
                    <h6>Recommendations</h6>
                    <p className="mb-0">{recommendations}</p>
                  </div>
                )}

                {prediction && savePrediction && (
                  <div className="review-item">
                    <h6>Risk Assessment</h6>
                    <div className="d-flex align-items-center">
                      <span className={`badge bg-${prediction.riskLabel === 'High' ? 'danger' : prediction.riskLabel === 'Medium' ? 'warning' : 'success'} me-2`}>
                        {prediction.riskLabel} Risk
                      </span>
                      <small className="text-muted">
                        Score: {prediction.riskScore?.toFixed(2)} | Confidence: {(prediction.confidence * 100).toFixed(1)}%
                      </small>
                    </div>
                  </div>
                )}
              </div>
            </GlassCard>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="d-flex justify-content-between mt-4">
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={prevStep}
          disabled={currentStep === 1}
        >
          <i className="fas fa-arrow-left me-2"></i>Previous
        </button>

        {currentStep < steps.length ? (
          <button
            type="button"
            className="btn btn-primary"
            onClick={nextStep}
            disabled={!canProceedToNext()}
          >
            Next<i className="fas fa-arrow-right ms-2"></i>
          </button>
        ) : (
          <motion.button
            type="button"
            className="btn btn-success"
            onClick={submit}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <i className="fas fa-save me-2"></i>Save Visit
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
