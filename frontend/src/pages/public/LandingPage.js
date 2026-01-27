import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import GlassCard from "../../components/ui/GlassCard";

export default function LandingPage() {
  const features = [
    {
      icon: "fas fa-brain",
      title: "AI-Powered Predictions",
      description: "Advanced machine learning algorithms for accurate diabetes risk assessment"
    },
    {
      icon: "fas fa-chart-line",
      title: "Health Monitoring",
      description: "Comprehensive tracking of HbA1c, blood glucose, and BMI over time"
    },
    {
      icon: "fas fa-users",
      title: "Patient Management",
      description: "Efficient patient records management with detailed visit histories"
    },
    {
      icon: "fas fa-shield-alt",
      title: "Secure & Private",
      description: "HIPAA-compliant platform ensuring patient data confidentiality"
    }
  ];

  const stats = [
    { number: "~95%", label: "Prediction Accuracy" },
    { number: "10K+", label: "Patients Managed" },
    { number: "500+", label: "Healthcare Providers" },
    { number: "24/7", label: "System Availability" }
  ];

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <motion.div
            className="hero-content text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="hero-logo mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <i className="fas fa-stethoscope fs-1 text-primary"></i>
            </motion.div>

            <h1 className="hero-title">
              Advanced Diabetes Patient Management System
            </h1>

            <p className="hero-subtitle">
              Revolutionizing diabetes care with AI-powered risk assessment,
              comprehensive patient monitoring, and streamlined healthcare workflows.
            </p>

            <motion.div
              className="hero-buttons mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Link to="/login" className="btn btn-primary btn-lg me-3">
                <i className="fas fa-user-md me-2"></i>Doctor Login
              </Link>
              <Link to="/patient-login" className="btn btn-outline-primary btn-lg meow">
                <i className="fas fa-user me-2"></i>Patient Portal
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section py-5">
        <div className="container">
          <div className="row g-4">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="col-md-3 col-sm-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.8 }}
              >
                <GlassCard className="text-center p-4">
                  <div className="stat-number display-4 fw-bold text-primary mb-2">
                    {stat.number}
                  </div>
                  <div className="stat-label text-muted">
                    {stat.label}
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section py-5">
        <div className="container">
          <motion.div
            className="text-center mb-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <h2 className="section-title">Why Choose Our Platform?</h2>
            <p className="section-subtitle">
              Cutting-edge technology meets compassionate healthcare
            </p>
          </motion.div>

          <div className="row g-4">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="col-lg-3 col-md-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 1.4 }}
              >
                <GlassCard className="feature-card text-center p-4 h-100">
                  <div className="feature-icon1 mb-3">
                    <i className={`${feature.icon} fs-2 text-primary`}></i>
                  </div>
                  <h5 className="feature-title mb-3">{feature.title}</h5>
                  <p className="feature-description text-muted mb-0">
                    {feature.description}
                  </p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section py-5">
        <div className="container">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 2 }}
          >
            <GlassCard className="p-5">
              <h3 className="mb-3">Ready to Transform Diabetes Care?</h3>
              <p className="text-muted mb-4">
                Join thousands of healthcare providers using our platform to deliver
                exceptional diabetes management and patient care.
              </p>
              <div className="d-flex justify-content-center gap-3">
                <Link to="/register-doctor" className="btn btn-primary btn-lg">
                  <i className="fas fa-user-plus me-2"></i>Get Started
                </Link>
                <Link to="/login" className="btn btn-outline-primary btn-lg">
                  <i className="fas fa-sign-in-alt me-2"></i>Sign In
                </Link>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer py-4">
        <div className="container text-center">
          <div className="row g-4">
            <div className="col-md-4">
              <h6 className="fw-bold mb-2">Diabetes PMS</h6>
              <p className="text-muted small mb-0">
                Advanced healthcare technology for better diabetes management
              </p>
            </div>
            <div className="col-md-4">
              <h6 className="fw-bold mb-2">Contact</h6>
              <p className="text-muted small mb-0">
                singhyashwant439@gmail.com<br />
                24/7 Technical Support
              </p>
            </div>
            <div className="col-md-4">
              <h6 className="fw-bold mb-2">Legal</h6>
              <p className="text-muted small mb-0">
                HIPAA Compliant<br />
                Privacy Protected
              </p>
            </div>
          </div>
          <hr className="my-4" />
          <p className="text-muted small mb-0">
            © 2026 Diabetes Patient Management System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}