import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import Toast from "../../components/Toast";

export default function AddVisit() {
  const { id } = useParams();
  const nav = useNavigate();
  const [msg, setMsg] = useState(null);

  const [visitDate, setVisitDate] = useState(new Date().toISOString().slice(0, 10));
  const [HbA1cLevel, setHbA1c] = useState("");
  const [bloodGlucoseLevel, setGlucose] = useState("");
  const [bmi, setBmi] = useState("");
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
        // Match your ML inputs here (example)
        HbA1cLevel: HbA1cLevel === "" ? null : Number(HbA1cLevel),
        bloodGlucoseLevel: bloodGlucoseLevel === "" ? null : Number(bloodGlucoseLevel),
        bmi: bmi === "" ? null : Number(bmi),
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
          HbA1cLevel: HbA1cLevel === "" ? null : Number(HbA1cLevel),
          bloodGlucoseLevel: bloodGlucoseLevel === "" ? null : Number(bloodGlucoseLevel),
          bmi: bmi === "" ? null : Number(bmi),
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

          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">HbA1c</label>
              <input className="form-control" type="number" step="0.1" value={HbA1cLevel} onChange={(e) => setHbA1c(e.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Blood Glucose</label>
              <input className="form-control" type="number" step="1" value={bloodGlucoseLevel} onChange={(e) => setGlucose(e.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label">BMI</label>
              <input className="form-control" type="number" step="0.1" value={bmi} onChange={(e) => setBmi(e.target.value)} />
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
