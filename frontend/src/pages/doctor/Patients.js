import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import Toast from "../../components/Toast";
import { Link } from "react-router-dom";

const emptyForm = {
  name: "",
  dob: "",
  gender: "male",
  hypertension: false,
  heartDisease: false,
  smokingHistory: "no info",
  bmi: "",
  HbA1cLevel: "",
  bloodGlucoseLevel: "",
};

export default function Patients() {
  const [q, setQ] = useState("");
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [patientLogin, setPatientLogin] = useState(null);

  async function load() {
    setLoading(true);
    const res = await api.get("/patients", { params: q ? { q } : {} });
    setPatients(res.data.data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []); // eslint-disable-line

  async function createPatient(e) {
    e.preventDefault();
    setMsg(null);
    try {
      const payload = {
        ...form,
        bmi: form.bmi === "" ? null : Number(form.bmi),
        HbA1cLevel: form.HbA1cLevel === "" ? null : Number(form.HbA1cLevel),
        bloodGlucoseLevel: form.bloodGlucoseLevel === "" ? null : Number(form.bloodGlucoseLevel),
      };
      const res = await api.post("/patients", payload);
      setPatientLogin(res.data.data.patientLogin);
      setShowModal(false);
      setForm(emptyForm);
      await load();
    } catch (err) {
      setMsg(err?.response?.data?.message || "Create failed");
    }
  }

  const filtered = useMemo(() => patients, [patients]);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="m-0">Patients</h3>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <i className="fa-solid fa-user-plus me-2" />Add Patient
        </button>
      </div>

      <Toast type="error" message={msg} onClose={() => setMsg(null)} />

      {patientLogin && (
        <div className="alert alert-warning">
          <div className="fw-semibold mb-2">Patient login created (shown once)</div>
          <div>Patient ID: <code>{patientLogin.patientId}</code></div>
          <div>Password: <code>{patientLogin.password}</code></div>
        </div>
      )}

      <div className="card card-body mb-3">
        <div className="row g-2 align-items-center">
          <div className="col-md-6">
            <input className="form-control" placeholder="Search by name or patientId..." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="col-md-2">
            <button className="btn btn-outline-secondary w-100" onClick={load}>Search</button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-muted">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-muted">No patients found.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>Patient ID</th>
                <th>Name</th>
                <th>Gender</th>
                <th>Baseline HbA1c</th>
                <th>Baseline Glucose</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p._id}>
                  <td><code>{p.patientId}</code></td>
                  <td>{p.name}</td>
                  <td className="text-capitalize">{p.gender}</td>
                  <td>{p.HbA1cLevel ?? "-"}</td>
                  <td>{p.bloodGlucoseLevel ?? "-"}</td>
                  <td className="text-end">
                    <Link className="btn btn-sm btn-outline-primary" to={`/doctor/patients/${p._id}`}>
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Simple Bootstrap modal (no JS dependency required) */}
      {showModal && (
        <div className="modal d-block" tabIndex="-1" role="dialog" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Patient</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <form onSubmit={createPatient}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Name</label>
                      <input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">DOB</label>
                      <input type="date" className="form-control" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} required />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Gender</label>
                      <select className="form-select" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Smoking</label>
                      <select className="form-select" value={form.smokingHistory} onChange={(e) => setForm({ ...form, smokingHistory: e.target.value })}>
                        <option value="no info">No Info</option>
                        <option value="never">Never</option>
                        <option value="former">Former</option>
                        <option value="current">Current</option>
                        <option value="not current">Not Current</option>
                      </select>
                    </div>
                    <div className="col-md-4 d-flex align-items-end">
                      <div className="form-check me-3">
                        <input className="form-check-input" type="checkbox" checked={form.hypertension} onChange={(e) => setForm({ ...form, hypertension: e.target.checked })} />
                        <label className="form-check-label">Hypertension</label>
                      </div>
                      <div className="form-check">
                        <input className="form-check-input" type="checkbox" checked={form.heartDisease} onChange={(e) => setForm({ ...form, heartDisease: e.target.checked })} />
                        <label className="form-check-label">Heart disease</label>
                      </div>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label">BMI</label>
                      <input className="form-control" type="number" step="0.1" value={form.bmi} onChange={(e) => setForm({ ...form, bmi: e.target.value })} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">HbA1c</label>
                      <input className="form-control" type="number" step="0.1" value={form.HbA1cLevel} onChange={(e) => setForm({ ...form, HbA1cLevel: e.target.value })} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Blood Glucose</label>
                      <input className="form-control" type="number" step="1" value={form.bloodGlucoseLevel} onChange={(e) => setForm({ ...form, bloodGlucoseLevel: e.target.value })} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button className="btn btn-primary">Create</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
