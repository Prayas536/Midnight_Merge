import React, { useEffect, useState, useContext } from "react";
import { motion } from "framer-motion";
import api from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import PageHeader from "../../components/layout/PageHeader";
import GlassCard from "../../components/ui/GlassCard";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function PatientProfile() {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await api.get("/my/profile");
      setProfile(res.data.data);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const getRiskLevel = (bmi, hba1c) => {
    if (!bmi || !hba1c) return { level: 'Unknown', color: 'secondary' };

    let risk = 'Low';
    let color = 'success';

    if (bmi >= 30 || hba1c >= 6.5) {
      risk = 'High';
      color = 'danger';
    } else if (bmi >= 25 || hba1c >= 5.7) {
      risk = 'Medium';
      color = 'warning';
    }

    return { level: risk, color };
  };

  const riskInfo = getRiskLevel(profile?.bmi, profile?.HbA1cLevel);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <PageHeader
        title="My Health Profile"
        subtitle="Your personal health information and metrics"
      />

      <div className="row g-4">
        {/* Personal Information */}
        <div className="col-lg-8">
          <GlassCard className="p-4">
            <div className="d-flex align-items-center mb-4">
              <div className="avatar-circle me-3">
                <i className="fas fa-user fs-2 text-primary"></i>
              </div>
              <div>
                <h5 className="mb-1">{profile?.name}</h5>
                <p className="text-muted mb-0">Patient ID: {profile?.patientId}</p>
              </div>
            </div>

            <div className="row g-4">
              <div className="col-md-6">
                <h6 className="text-muted mb-3">
                  <i className="fas fa-id-card me-2"></i>Demographics
                </h6>
                <div className="mb-3">
                  <small className="text-muted d-block">Date of Birth</small>
                  <span className="fw-semibold">
                    {profile?.dob ? new Date(profile.dob).toLocaleDateString() : 'Not provided'}
                  </span>
                </div>
                <div className="mb-3">
                  <small className="text-muted d-block">Gender</small>
                  <span className="fw-semibold text-capitalize">{profile?.gender || 'Not specified'}</span>
                </div>
                <div>
                  <small className="text-muted d-block">Age</small>
                  <span className="fw-semibold">
                    {profile?.dob ? new Date().getFullYear() - new Date(profile.dob).getFullYear() : 'Unknown'} years
                  </span>
                </div>
              </div>

              <div className="col-md-6">
                <h6 className="text-muted mb-3">
                  <i className="fas fa-heartbeat me-2"></i>Health Conditions
                </h6>
                <div className="mb-3">
                  <small className="text-muted d-block">Hypertension</small>
                  <span className={`badge ${profile?.hypertension ? 'bg-danger' : 'bg-success'}`}>
                    {profile?.hypertension ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="mb-3">
                  <small className="text-muted d-block">Heart Disease</small>
                  <span className={`badge ${profile?.heartDisease ? 'bg-danger' : 'bg-success'}`}>
                    {profile?.heartDisease ? 'Yes' : 'No'}
                  </span>
                </div>
                <div>
                  <small className="text-muted d-block">Smoking History</small>
                  <span className="fw-semibold text-capitalize">{profile?.smokingHistory || 'Not specified'}</span>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Health Metrics */}
        <div className="col-lg-4">
          <GlassCard className="p-4 mb-4">
            <h6 className="text-muted mb-3">
              <i className="fas fa-chart-line me-2"></i>Current Metrics
            </h6>

            <div className="metric-item mb-3">
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted">BMI</span>
                <span className="fw-bold fs-5">{profile?.bmi || 'N/A'}</span>
              </div>
              <div className="progress mt-2" style={{ height: '6px' }}>
                <div
                  className="progress-bar bg-primary"
                  style={{ width: profile?.bmi ? `${Math.min((profile.bmi / 40) * 100, 100)}%` : '0%' }}
                ></div>
              </div>
              <small className="text-muted">Normal: 18.5-24.9</small>
            </div>

            <div className="metric-item mb-3">
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted">HbA1c</span>
                <span className="fw-bold fs-5">{profile?.HbA1cLevel ? `${profile.HbA1cLevel}%` : 'N/A'}</span>
              </div>
              <div className="progress mt-2" style={{ height: '6px' }}>
                <div
                  className="progress-bar bg-info"
                  style={{ width: profile?.HbA1cLevel ? `${Math.min((profile.HbA1cLevel / 10) * 100, 100)}%` : '0%' }}
                ></div>
              </div>
              <small className="text-muted">Normal: &lt;5.7%</small>
            </div>

            <div className="metric-item">
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted">Blood Glucose</span>
                <span className="fw-bold fs-5">{profile?.bloodGlucoseLevel ? `${profile.bloodGlucoseLevel} mg/dL` : 'N/A'}</span>
              </div>
              <div className="progress mt-2" style={{ height: '6px' }}>
                <div
                  className="progress-bar bg-success"
                  style={{ width: profile?.bloodGlucoseLevel ? `${Math.min((profile.bloodGlucoseLevel / 200) * 100, 100)}%` : '0%' }}
                ></div>
              </div>
              <small className="text-muted">Fasting: 70-99 mg/dL</small>
            </div>
          </GlassCard>

          {/* Risk Assessment */}
          <GlassCard className={`p-4 border-${riskInfo.color}`}>
            <div className="text-center">
              <div className={`risk-indicator mb-3 bg-${riskInfo.color}`}>
                <i className="fas fa-exclamation-triangle fs-2 text-white"></i>
              </div>
              <h6 className="mb-2">Diabetes Risk Level</h6>
              <span className={`badge bg-${riskInfo.color} fs-6 px-3 py-2`}>
                {riskInfo.level} Risk
              </span>
              <p className="text-muted small mt-3 mb-0">
                Based on your current BMI and HbA1c levels
              </p>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Additional Information */}
      <div className="row mt-4">
        <div className="col-12">
          <GlassCard className="p-4">
            <h6 className="text-muted mb-3">
              <i className="fas fa-info-circle me-2"></i>Important Notes
            </h6>
            <div className="row g-3">
              <div className="col-md-4">
                <div className="d-flex align-items-start">
                  <i className="fas fa-calendar-check text-primary me-3 mt-1"></i>
                  <div>
                    <h6 className="mb-1">Regular Check-ups</h6>
                    <p className="text-muted small mb-0">Schedule quarterly visits with your healthcare provider</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="d-flex align-items-start">
                  <i className="fas fa-weight text-info me-3 mt-1"></i>
                  <div>
                    <h6 className="mb-1">Monitor BMI</h6>
                    <p className="text-muted small mb-0">Maintain healthy weight through diet and exercise</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="d-flex align-items-start">
                  <i className="fas fa-vial text-success me-3 mt-1"></i>
                  <div>
                    <h6 className="mb-1">Blood Tests</h6>
                    <p className="text-muted small mb-0">Regular HbA1c and glucose monitoring</p>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </motion.div>
  );
}
