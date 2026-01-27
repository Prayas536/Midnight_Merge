import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AuthContext } from "../../context/AuthContext";
import GlassCard from "../../components/ui/GlassCard";

export default function LoginPatient() {
  const { loginPatient } = useContext(AuthContext);
  const navigate = useNavigate();
  const [patientId, setPatientId] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      await loginPatient(patientId, password);
      navigate("/patient/dashboard");
    } catch (err) {
      setMsg(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="auth-content"
      >
        <div className="text-center mb-5">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="auth-logo mb-4"
          >
            <i className="fas fa-heartbeat fs-1 text-primary"></i>
          </motion.div>
          <motion.h2
            className="auth-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Welcome Back
          </motion.h2>
          <motion.p
            className="auth-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            Access your health dashboard
          </motion.p>
        </div>

        <GlassCard className="p-4">
          <form onSubmit={onSubmit}>
            {msg && (
              <motion.div
                className="alert alert-danger"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <i className="fas fa-exclamation-triangle me-2"></i>
                {msg}
              </motion.div>
            )}

            <div className="mb-4">
              <label className="form-label fw-semibold">
                <i className="fas fa-id-card me-2 text-primary"></i>Patient ID
              </label>
              <input
                type="text"
                className="form-control form-control-lg"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                placeholder="Enter your patient ID"
                required
              />
              <div className="form-text">
                Your unique patient identifier provided by your doctor
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold">
                <i className="fas fa-lock me-2 text-primary"></i>Password
              </label>
              <input
                type="password"
                className="form-control form-control-lg"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <motion.button
              type="submit"
              className="btn btn-primary w-100 btn-lg mb-4"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin me-2"></i>Signing In...
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt me-2"></i>Access My Health Records
                </>
              )}
            </motion.button>
          </form>

          <div className="text-center">
            <p className="text-muted mb-2">Are you a healthcare provider?</p>
            <Link
              to="/login"
              className="btn btn-outline-primary"
            >
              <i className="fas fa-user-md me-2"></i>Doctor Login
            </Link>
          </div>
        </GlassCard>

        <div className="auth-footer">
          <div className="row g-3">
            <div className="col-4 text-center">
              <i className="fas fa-shield-alt text-success fs-4 mb-2"></i>
              <div className="small text-muted">Secure</div>
            </div>
            <div className="col-4 text-center">
              <i className="fas fa-heart text-danger fs-4 mb-2"></i>
              <div className="small text-muted">Personalized</div>
            </div>
            <div className="col-4 text-center">
              <i className="fas fa-clock text-info fs-4 mb-2"></i>
              <div className="small text-muted">24/7 Access</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
