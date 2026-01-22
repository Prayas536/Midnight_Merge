import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import Toast from "../../components/Toast";

export default function LoginPatient() {
  const { loginPatient } = useContext(AuthContext);
  const navigate = useNavigate();
  const [patientId, setPatientId] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setMsg(null);
    try {
      await loginPatient(patientId, password);
      navigate("/patient/dashboard");
    } catch (err) {
      setMsg(err?.response?.data?.message || "Login failed");
    }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-5">
        <h3 className="mb-3">Patient Login</h3>
        <Toast type="error" message={msg} onClose={() => setMsg(null)} />

        <form onSubmit={onSubmit} className="card card-body">
          <label className="form-label">Patient ID</label>
          <input className="form-control mb-3" value={patientId} onChange={(e) => setPatientId(e.target.value)} required />

          <label className="form-label">Password</label>
          <input type="password" className="form-control mb-3" value={password} onChange={(e) => setPassword(e.target.value)} required />

          <button className="btn btn-primary w-100">Login</button>

          <div className="mt-3">
            <Link to="/login">Doctor Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
