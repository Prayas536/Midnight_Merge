import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import Toast from "../../components/Toast";

export default function AddVisit() {
  const { id } = useParams();
  const nav = useNavigate();
  const [msg, setMsg] = useState(null);

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

  const [savePrediction, setSavePrediction] = useState(true);
  const [predLoading, setPredLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);

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
    e.preventDefault();
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
      await api.post(`/patients/${id}/visits`, payload);
      nav(`/doctor/patients/${id}`);
    } catch (e) {
      setMsg(e?.response?.data?.message || "Save failed");
    }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-8">
        <div className="d-flex justify-content-between align-items-center">
          <h3>Add Visit</h3>
          <Link className="btn btn-outline-secondary" to={`/doctor/patients/${id}`}>Back</Link>
        </div>

        <Toast type="error" message={msg} onClose={() => setMsg(null)} />

        <form onSubmit={submit} className="card card-body mt-3">
          <label className="form-label">Visit Date</label>
          <input type="date" className="form-control mb-3" value={visitDate} onChange={(e) => setVisitDate(e.target.value)} required />

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">
                <i className="fas fa-venus-mars me-1"></i>Gender
              </label>
              <select className="form-control" value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">
                <i className="fas fa-birthday-cake me-1"></i>Age
              </label>
              <input className="form-control" type="number" value={age} onChange={(e) => setAge(e.target.value)} />
            </div>
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">
                <i className="fas fa-heartbeat me-1"></i>Hypertension
              </label>
              <select className="form-control" value={hypertension} onChange={(e) => setHypertension(e.target.value)}>
                <option value={0}>No</option>
                <option value={1}>Yes</option>
              </select>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">
                <i className="fas fa-heart me-1"></i>Heart Disease
              </label>
              <select className="form-control" value={heartDisease} onChange={(e) => setHeartDisease(e.target.value)}>
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
              <select className="form-control" value={smokingHistory} onChange={(e) => setSmokingHistory(e.target.value)}>
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
              <input className="form-control" type="number" step="0.1" value={bmi} onChange={(e) => setBmi(e.target.value)} />
            </div>
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">
                <i className="fas fa-vial me-1"></i>HbA1c Level
              </label>
              <input className="form-control" type="number" step="0.1" value={HbA1cLevel} onChange={(e) => setHbA1c(e.target.value)} />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">
                <i className="fas fa-tint me-1"></i>Blood Glucose Level
              </label>
              <input className="form-control" type="number" value={bloodGlucoseLevel} onChange={(e) => setGlucose(e.target.value)} />
            </div>
          </div>

          <label className="form-label mt-3">Notes</label>
          <textarea className="form-control mb-3" rows="3" value={notes} onChange={(e) => setNotes(e.target.value)} />

          <label className="form-label">Recommendations</label>
          <textarea className="form-control mb-3" rows="3" value={recommendations} onChange={(e) => setRecs(e.target.value)} />

          <div className="d-flex align-items-center justify-content-between">
            <div className="form-check">
              <input className="form-check-input" type="checkbox" checked={savePrediction} onChange={(e) => setSavePrediction(e.target.checked)} />
              <label className="form-check-label">Store prediction with visit</label>
            </div>
            <button type="button" className="btn btn-outline-primary" onClick={runPrediction} disabled={predLoading}>
              {predLoading ? "Predicting..." : "Run Prediction"}
            </button>
          </div>

          {prediction && (
            <div className="alert alert-info mt-3">
              <div className="fw-semibold">Prediction</div>
              <div>Label: <b>{prediction.riskLabel}</b></div>
              <div>Score: <b>{String(prediction.riskScore ?? "-")}</b></div>
              <div>Confidence: <b>{String(prediction.confidence ?? "-")}</b></div>
            </div>
          )}

          <button className="btn btn-primary mt-3">Save Visit</button>
        </form>
      </div>
    </div>
  );
}
