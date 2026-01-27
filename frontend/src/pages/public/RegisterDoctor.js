import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AuthContext } from "../../context/AuthContext";
import GlassCard from "../../components/ui/GlassCard";

export default function RegisterDoctor() {
  const { registerDoctor } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    licenseNumber: "",
    specialization: "",
    experience: ""
  });
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  async function onSubmit(e) {
    e.preventDefault();
    setMsg(null);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setMsg("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setMsg("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);
    try {
      await registerDoctor(formData.name, formData.email, formData.password);
      navigate("/doctor/dashboard");
    } catch (err) {
      setMsg(err?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  const isFormValid = formData.name && formData.email && formData.password &&
                     formData.confirmPassword && formData.licenseNumber;

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
            <i className="fas fa-user-plus fs-1 text-success"></i>
          </motion.div>
          <motion.h2
            className="auth-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Join Our Medical Team
          </motion.h2>
          <motion.p
            className="auth-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            Create your account to start managing patients
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

            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  <i className="fas fa-user me-2 text-primary"></i>Full Name *
                </label>
                <input
                  type="text"
                  className="form-control form-control-lg"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Dr. John Smith"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  <i className="fas fa-envelope me-2 text-primary"></i>Email Address *
                </label>
                <input
                  type="email"
                  className="form-control form-control-lg"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="doctor@hospital.com"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  <i className="fas fa-id-card me-2 text-primary"></i>Medical License *
                </label>
                <input
                  type="text"
                  className="form-control form-control-lg"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  required
                  placeholder="MD123456"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  <i className="fas fa-stethoscope me-2 text-primary"></i>Specialization
                </label>
                <select
                  className="form-select form-select-lg"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                >
                  <option value="">Select specialization</option>
                  <option value="endocrinology">Endocrinology</option>
                  <option value="internal-medicine">Internal Medicine</option>
                  <option value="family-medicine">Family Medicine</option>
                  <option value="diabetology">Diabetology</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  <i className="fas fa-lock me-2 text-primary"></i>Password *
                </label>
                <input
                  type="password"
                  className="form-control form-control-lg"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength="8"
                  placeholder="Minimum 8 characters"
                />
                <div className="form-text">Must be at least 8 characters long</div>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  <i className="fas fa-lock me-2 text-primary"></i>Confirm Password *
                </label>
                <input
                  type="password"
                  className="form-control form-control-lg"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Re-enter password"
                />
              </div>
            </div>

            <motion.button
              type="submit"
              className="btn btn-success w-100 btn-lg mt-4"
              disabled={loading || !isFormValid}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin me-2"></i>Creating Account...
                </>
              ) : (
                <>
                  <i className="fas fa-user-plus me-2"></i>Create Doctor Account
                </>
              )}
            </motion.button>
          </form>

          <div className="text-center mt-4">
            <p className="text-muted mb-2">Already have an account?</p>
            <Link
              to="/login"
              className="btn btn-outline-primary"
            >
              <i className="fas fa-sign-in-alt me-2"></i>Sign In Instead
            </Link>
          </div>
        </GlassCard>

        <div className="auth-footer">
          <div className="row g-3">
            <div className="col-4 text-center">
              <i className="fas fa-certificate text-success fs-4 mb-2"></i>
              <div className="small text-muted">Licensed</div>
            </div>
            <div className="col-4 text-center">
              <i className="fas fa-shield-alt text-primary fs-4 mb-2"></i>
              <div className="small text-muted">Secure</div>
            </div>
            <div className="col-4 text-center">
              <i className="fas fa-users text-info fs-4 mb-2"></i>
              <div className="small text-muted">Community</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
