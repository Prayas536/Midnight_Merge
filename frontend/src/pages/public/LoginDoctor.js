import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import Toast from "../../components/Toast";

export default function LoginDoctor() {
  const { loginDoctor } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setMsg(null);
    try {
      await loginDoctor(email, password);
      navigate("/doctor/dashboard");
    } catch (err) {
      setMsg(err?.response?.data?.message || "Login failed");
    }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-5">
        <h3 className="mb-3">Doctor Login</h3>
        <Toast type="error" message={msg} onClose={() => setMsg(null)} />

        <form onSubmit={onSubmit} className="card card-body">
          <label className="form-label">Email</label>
          <input className="form-control mb-3" value={email} onChange={(e) => setEmail(e.target.value)} required />

          <label className="form-label">Password</label>
          <input type="password" className="form-control mb-3" value={password} onChange={(e) => setPassword(e.target.value)} required />

          <button className="btn btn-primary w-100">Login</button>

          <div className="mt-3 d-flex justify-content-between">
            <Link to="/register-doctor">Register</Link>
            <Link to="/patient-login">Patient Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
