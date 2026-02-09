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
              <div className="col-md-6 border-end">
                <h6 className="text-muted mb-4 fw-bold text-uppercase small">
                  <i className="fas fa-id-card me-2"></i>Demographics
                </h6>
                <div className="d-flex justify-content-between mb-3 border-bottom pb-2">
                  <span className="text-muted">Date of Birth</span>
                  <span className="fw-semibold">
                    {profile?.dob ? new Date(profile.dob).toLocaleDateString() : 'Not provided'}
                  </span>
                </div>
                <div className="d-flex justify-content-between mb-3 border-bottom pb-2">
                  <span className="text-muted">Gender</span>
                  <span className="fw-semibold text-capitalize">{profile?.gender || 'Not specified'}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Age</span>
                  <span className="fw-semibold">
                    {profile?.dob ? new Date().getFullYear() - new Date(profile.dob).getFullYear() : 'Unknown'} years
                  </span>
                </div>
              </div>

              <div className="col-md-6">
                <h6 className="text-muted mb-4 fw-bold text-uppercase small">
                  <i className="fas fa-heartbeat me-2"></i>Health Conditions
                </h6>
                <div className="d-flex justify-content-between mb-3 border-bottom pb-2">
                  <span className="text-muted">Hypertension</span>
                  <span className={`badge ${profile?.hypertension ? 'bg-danger' : 'bg-success'} rounded-pill px-3`}>
                    {profile?.hypertension ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="d-flex justify-content-between mb-3 border-bottom pb-2">
                  <span className="text-muted">Heart Disease</span>
                  <span className={`badge ${profile?.heartDisease ? 'bg-danger' : 'bg-success'} rounded-pill px-3`}>
                    {profile?.heartDisease ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Smoking History</span>
                  <span className="fw-semibold text-capitalize">{profile?.smokingHistory || 'Not specified'}</span>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Health Metrics */}
        <div className="col-lg-4">
          <GlassCard className="p-4 mb-4">
            <h6 className="text-muted mb-4 fw-bold text-uppercase small">
              <i className="fas fa-chart-line me-2"></i>Current Metrics
            </h6>

            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-end mb-1">
                <span className="text-muted fw-medium">BMI</span>
                <span className="fw-bold fs-5 text-dark">{profile?.bmi || 'N/A'}</span>
              </div>
              <div className="progress rounded-pill bg-light mb-1" style={{ height: '6px' }}>
                <div
                  className="progress-bar bg-primary rounded-pill"
                  style={{ width: profile?.bmi ? `${Math.min((profile.bmi / 40) * 100, 100)}%` : '0%' }}
                ></div>
              </div>
              <div className="text-end">
                <small className="text-muted" style={{ fontSize: '0.75rem' }}>Normal: 18.5-24.9</small>
              </div>
            </div>

            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-end mb-1">
                <span className="text-muted fw-medium">HbA1c</span>
                <span className="fw-bold fs-5 text-dark">{profile?.HbA1cLevel ? `${profile.HbA1cLevel}%` : 'N/A'}</span>
              </div>
              <div className="progress rounded-pill bg-light mb-1" style={{ height: '6px' }}>
                <div
                  className="progress-bar bg-info rounded-pill"
                  style={{ width: profile?.HbA1cLevel ? `${Math.min((profile.HbA1cLevel / 10) * 100, 100)}%` : '0%' }}
                ></div>
              </div>
              <div className="text-end">
                <small className="text-muted" style={{ fontSize: '0.75rem' }}>Normal: &lt;5.7%</small>
              </div>
            </div>

            <div className="mb-2">
              <div className="d-flex justify-content-between align-items-end mb-1">
                <span className="text-muted fw-medium">Blood Glucose</span>
                <span className="fw-bold fs-5 text-dark">{profile?.bloodGlucoseLevel ? `${profile.bloodGlucoseLevel}` : 'N/A'} <span className="fs-6 text-muted fw-normal">mg/dL</span></span>
              </div>
              <div className="progress rounded-pill bg-light mb-1" style={{ height: '6px' }}>
                <div
                  className="progress-bar bg-success rounded-pill"
                  style={{ width: profile?.bloodGlucoseLevel ? `${Math.min((profile.bloodGlucoseLevel / 200) * 100, 100)}%` : '0%' }}
                ></div>
              </div>
              <div className="text-end">
                <small className="text-muted" style={{ fontSize: '0.75rem' }}>Fasting: 70-99 mg/dL</small>
              </div>
            </div>
          </GlassCard>

          {/* Risk Assessment */}
          <GlassCard className="p-0 border-0 overflow-hidden text-white" style={{
            background: riskInfo.level === 'High' ? 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)' :
              riskInfo.level === 'Medium' ? 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' :
                'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)'
          }}>
            <div className="p-4 text-center position-relative">
              <div className="bg-white bg-opacity-25 rounded-circle p-3 d-inline-flex mb-3 shadow-sm">
                <i className={`fas fa-exclamation-triangle fs-2 ${riskInfo.level === 'High' ? 'text-danger' : riskInfo.level === 'Medium' ? 'text-warning' : 'text-success'}`}></i>
              </div>
              <h6 className="mb-2 fw-bold text-dark opacity-75">Diabetes Risk Level</h6>
              <span className={`badge bg-white bg-opacity-75 text-dark fs-6 px-4 py-2 rounded-pill shadow-sm`}>
                {riskInfo.level} Risk
              </span>
              <p className="text-dark small mt-3 mb-0 opacity-75 fw-semibold">
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
