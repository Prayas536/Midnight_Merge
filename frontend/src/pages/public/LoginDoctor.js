import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AuthContext } from "../../context/AuthContext";
import GlassCard from "../../components/ui/GlassCard";

export default function LoginDoctor() {
  const { loginDoctor } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      await loginDoctor(email, password);
      navigate("/doctor/dashboard");
    } catch (err) {
      setMsg(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-vh-100 d-flex">
      {/* Left Side - Animated Gradient */}
      <motion.div
        className="d-none d-md-flex col-md-6 align-items-center justify-content-center position-relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="position-absolute top-0 start-0 w-100 h-100 primary-gradient opacity-90"></div>
        <div className="position-absolute top-0 start-0 w-100 h-100" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
        <motion.div
          className="text-center text-white p-5"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 1.5 }}
        >
          <motion.i
            className="fas fa-stethoscope fs-1 mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1, duration: 0.8, type: "spring" }}
          ></motion.i>
          <motion.h2
            className="h1 fw-bold mb-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            Clinical Excellence
          </motion.h2>
          <motion.p
            className="lead"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.8 }}
          >
            Advanced diabetes management platform for healthcare professionals
          </motion.p>
        </motion.div>
      </motion.div>

      {/* Right Side - Login Card */}
      <div className="col-12 col-md-6 d-flex align-items-center justify-content-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="w-100"
          style={{ maxWidth: '400px' }}
        >
          <GlassCard className="p-4">
            <div className="text-center mb-4">
              <i className="fas fa-user-md fs-2 text-primary mb-3"></i>
              <h3 className="h4 fw-bold">Doctor Login</h3>
              <p className="text-muted small">Access your medical dashboard</p>
            </div>

            {msg && (
              <motion.div
                className="alert alert-danger"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {msg}
              </motion.div>
            )}

            <form onSubmit={onSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold">Email Address</label>
                <input
                  className="form-control"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="doctor@gmail.com"
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Password</label>
                <div className="input-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>

              <motion.button
                type="submit"
                className="btn btn-primary w-100 mb-3"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin me-2"></i>Signing in...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sign-in-alt me-2"></i>Sign In
                  </>
                )}
              </motion.button>
            </form>

            <div className="text-center">
              <Link to="/register-doctor" className="text-decoration-none d-block mb-2">
                <i className="fas fa-user-plus me-1"></i>Register as Doctor
              </Link>
              <Link to="/patient-login" className="text-decoration-none">
                <i className="fas fa-user me-1"></i>Patient Portal
              </Link>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
