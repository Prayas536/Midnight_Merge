import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import Toast from "../../components/Toast";

export default function RegisterDoctor() {
  const { registerDoctor } = useContext(AuthContext);
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setMsg(null);
    try {
      await registerDoctor(name, email, password);
      navigate("/doctor/dashboard");
    } catch (err) {
      setMsg(err?.response?.data?.message || "Registration failed");
    }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-5">
        <h3 className="mb-3">Doctor Registration</h3>
        <Toast type="error" message={msg} onClose={() => setMsg(null)} />

        <form onSubmit={onSubmit} className="card card-body">
          <label className="form-label">Name</label>
          <input className="form-control mb-3" value={name} onChange={(e) => setName(e.target.value)} required />

          <label className="form-label">Email</label>
          <input className="form-control mb-3" value={email} onChange={(e) => setEmail(e.target.value)} required />

          <label className="form-label">Password (min 6 chars)</label>
          <input type="password" className="form-control mb-3" value={password} onChange={(e) => setPassword(e.target.value)} required />

          <button className="btn btn-primary w-100">Register</button>

          <div className="mt-3">
            <Link to="/login">Back to login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
