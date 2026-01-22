import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../api/axios";
import LineChart from "../../components/charts/LineChart";
import Toast from "../../components/Toast";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function PatientDetails() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [visits, setVisits] = useState([]);
  const [msg, setMsg] = useState(null);

  async function load() {
    const p = await api.get(`/patients/${id}`);
    const v = await api.get(`/patients/${id}/visits`);
    setPatient(p.data.data);
    setVisits(v.data.data);
  }

  useEffect(() => { load(); }, [id]); // eslint-disable-line

  const labels = useMemo(() => visits.slice().reverse().map(v => new Date(v.visitDate).toLocaleDateString()), [visits]);
  const a1c = useMemo(() => visits.slice().reverse().map(v => v.metrics?.HbA1cLevel ?? null), [visits]);
  const glucose = useMemo(() => visits.slice().reverse().map(v => v.metrics?.bloodGlucoseLevel ?? null), [visits]);
  const bmi = useMemo(() => visits.slice().reverse().map(v => v.metrics?.bmi ?? null), [visits]);

  if (!patient) return <LoadingSpinner />;

  async function deletePatient() {
    if (!window.confirm("Delete this patient?")) return;
    try {
      await api.delete(`/patients/${id}`);
      window.location.href = "/doctor/patients";
    } catch (e) {
      setMsg(e?.response?.data?.message || "Delete failed");
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <h3 className="mb-1">{patient.name}</h3>
          <div className="text-muted">Patient ID: <code>{patient.patientId}</code></div>
        </div>
        <div className="d-flex gap-2">
          <Link className="btn btn-primary" to={`/doctor/patients/${id}/add-visit`}>
            <i className="fa-solid fa-plus me-2" />Add Visit
          </Link>
          <button className="btn btn-outline-danger" onClick={deletePatient}>
            <i className="fa-solid fa-trash me-2" />Delete
          </button>
        </div>
      </div>

      <Toast type="error" message={msg} onClose={() => setMsg(null)} />

      <div className="row g-3 mt-2">
        <div className="col-md-4">
          <div className="card card-body">
            <div className="text-muted">Gender</div>
            <div className="text-capitalize">{patient.gender}</div>
            <hr />
            <div className="text-muted">Hypertension</div>
            <div>{patient.hypertension ? "Yes" : "No"}</div>
            <div className="text-muted mt-2">Heart disease</div>
            <div>{patient.heartDisease ? "Yes" : "No"}</div>
            <div className="text-muted mt-2">Smoking</div>
            <div className="text-capitalize">{patient.smokingHistory}</div>
          </div>
        </div>
        <div className="col-md-8">
          <div className="row g-3">
            <div className="col-md-6"><LineChart title="HbA1c over time" labels={labels} values={a1c} /></div>
            <div className="col-md-6"><LineChart title="Glucose over time" labels={labels} values={glucose} /></div>
            <div className="col-md-12"><LineChart title="BMI over time" labels={labels} values={bmi} /></div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <h5>Visits</h5>
        {visits.length === 0 ? (
          <div className="text-muted">No visits yet.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-sm align-middle">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>HbA1c</th>
                  <th>Glucose</th>
                  <th>BMI</th>
                  <th>Prediction</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {visits.map((v) => (
                  <tr key={v._id}>
                    <td>{new Date(v.visitDate).toLocaleDateString()}</td>
                    <td>{v.metrics?.HbA1cLevel ?? "-"}</td>
                    <td>{v.metrics?.bloodGlucoseLevel ?? "-"}</td>
                    <td>{v.metrics?.bmi ?? "-"}</td>
                    <td>
                      {v.prediction?.riskLabel ? (
                        <span>
                          <span className="badge text-bg-info me-2">{v.prediction.riskLabel}</span>
                          {v.prediction.riskScore ?? ""}
                        </span>
                      ) : "-"}
                    </td>
                    <td style={{ maxWidth: 420 }}>{v.notes || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
