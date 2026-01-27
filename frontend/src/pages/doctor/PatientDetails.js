import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../api/axios";
import PageHeader from "../../components/layout/PageHeader";
import GlassCard from "../../components/ui/GlassCard";
import HbA1cChart from "../../components/charts/HbA1cChart";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function PatientDetails() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [visits, setVisits] = useState([]);
  const [activeTab, setActiveTab] = useState('visits');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);

  async function load() {
    try {
      const [p, v] = await Promise.all([
        api.get(`/patients/${id}`),
        api.get(`/patients/${id}/visits`)
      ]);
      setPatient(p.data.data);
      setVisits(v.data.data);
    } catch (error) {
      console.error('Error loading patient details:', error);
      setMsg('Failed to load patient details');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [id]);

  const chartData = useMemo(() => {
    if (!visits.length) return null;
    const sortedVisits = visits.slice().sort((a, b) => new Date(a.visitDate) - new Date(b.visitDate));
    return {
      labels: sortedVisits.map(v => new Date(v.visitDate).toLocaleDateString()),
      datasets: [
        {
          label: 'HbA1c (%)',
          data: sortedVisits.map(v => v.metrics?.HbA1cLevel ?? null),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Blood Glucose (mg/dL)',
          data: sortedVisits.map(v => v.metrics?.bloodGlucoseLevel ?? null),
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          yAxisID: 'y1'
        },
        {
          label: 'BMI',
          data: sortedVisits.map(v => v.metrics?.bmi ?? null),
          borderColor: 'rgb(245, 101, 101)',
          backgroundColor: 'rgba(245, 101, 101, 0.1)',
          tension: 0.4,
          yAxisID: 'y1'
        }
      ]
    };
  }, [visits]);

  const getRiskBadge = (riskLabel) => {
    const colors = {
      'High': 'danger',
      'Medium': 'warning',
      'Low': 'success'
    };
    return colors[riskLabel] || 'secondary';
  };

  async function deletePatient() {
    if (!window.confirm("Are you sure you want to delete this patient? This action cannot be undone.")) return;
    try {
      setMsg(null);
      const response = await api.delete(`/patients/${id}`);
      if (response.data.success) {
        setMsg({ type: 'success', text: 'Patient deleted successfully' });
        setTimeout(() => {
          window.location.href = "/doctor/patients";
        }, 1000);
      }
    } catch (e) {
      console.error('Delete error:', e);
      const errorMsg = e?.response?.data?.message || e?.message || "Delete failed";
      setMsg({ type: 'error', text: errorMsg });
    }
  }

  if (loading) return <LoadingSpinner />;

  const tabs = [
    { id: 'visits', label: 'Visit History', icon: 'fas fa-calendar-check' },
    { id: 'charts', label: 'Health Trends', icon: 'fas fa-chart-line' },
    { id: 'profile', label: 'Patient Profile', icon: 'fas fa-user' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <PageHeader
        title={patient?.name || 'Patient Details'}
        subtitle={`Patient ID: ${patient?.patientId}`}
        showBack={true}
        backTo="/doctor/patients"
      >
        <div className="d-flex gap-2">
          <Link className="btn btn-primary" to={`/doctor/patients/${id}/add-visit`}>
            <i className="fas fa-plus me-2"></i>Add Visit
          </Link>
          <button className="btn btn-outline-danger" onClick={deletePatient}>
            <i className="fas fa-trash me-2"></i>Delete Patient
          </button>
        </div>
      </PageHeader>

      {msg && (
        <motion.div
          className={`alert ${msg.type === 'success' ? 'alert-success' : 'alert-danger'}`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {typeof msg === 'string' ? msg : msg.text}
        </motion.div>
      )}

      <div className="row g-4">
        {/* Patient Profile Sidebar */}
        <div className="col-lg-4">
          <GlassCard className="p-4 mb-4">
            <div className="text-center mb-4">
              <div className="avatar-circle mb-3">
                <i className="fas fa-user fs-2 text-primary"></i>
              </div>
              <h5 className="mb-1">{patient?.name}</h5>
              <p className="text-muted mb-0">ID: {patient?.patientId}</p>
            </div>

            <div className="profile-info">
              <div className="info-item">
                <span className="label">Date of Birth</span>
                <span className="value">
                  {patient?.dob ? new Date(patient.dob).toLocaleDateString() : 'Not provided'}
                </span>
              </div>
              <div className="info-item">
                <span className="label">Gender</span>
                <span className="value text-capitalize">{patient?.gender || 'Not specified'}</span>
              </div>
              <div className="info-item">
                <span className="label">Age</span>
                <span className="value">
                  {patient?.dob ? new Date().getFullYear() - new Date(patient.dob).getFullYear() : 'Unknown'} years
                </span>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-4 mb-4">
            <h6 className="mb-3">
              <i className="fas fa-heartbeat me-2 text-danger"></i>Health Conditions
            </h6>
            <div className="health-conditions">
              <div className="condition-item">
                <span className="label">Hypertension</span>
                <span className={`badge ${patient?.hypertension ? 'bg-danger' : 'bg-success'}`}>
                  {patient?.hypertension ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="condition-item">
                <span className="label">Heart Disease</span>
                <span className={`badge ${patient?.heartDisease ? 'bg-danger' : 'bg-success'}`}>
                  {patient?.heartDisease ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="condition-item">
                <span className="label">Smoking History</span>
                <span className="value text-capitalize">{patient?.smokingHistory || 'Not specified'}</span>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <h6 className="mb-3">
              <i className="fas fa-chart-pie me-2 text-info"></i>Latest Metrics
            </h6>
            {visits.length > 0 ? (
              <div className="latest-metrics">
                {visits[visits.length - 1].metrics?.HbA1cLevel && (
                  <div className="metric-item">
                    <span className="label">HbA1c</span>
                    <span className="value">{visits[visits.length - 1].metrics.HbA1cLevel}%</span>
                  </div>
                )}
                {visits[visits.length - 1].metrics?.bloodGlucoseLevel && (
                  <div className="metric-item">
                    <span className="label">Blood Glucose</span>
                    <span className="value">{visits[visits.length - 1].metrics.bloodGlucoseLevel} mg/dL</span>
                  </div>
                )}
                {visits[visits.length - 1].metrics?.bmi && (
                  <div className="metric-item">
                    <span className="label">BMI</span>
                    <span className="value">{visits[visits.length - 1].metrics.bmi}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted small mb-0">No metrics available</p>
            )}
          </GlassCard>
        </div>

        {/* Main Content with Tabs */}
        <div className="col-lg-8">
          <GlassCard className="p-0">
            {/* Tab Navigation */}
            <div className="tab-navigation">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <i className={`${tab.icon} me-2`}></i>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="tab-content p-4">
              {activeTab === 'visits' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <h5 className="mb-4">Visit History</h5>
                  {visits.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="fas fa-calendar-plus fs-1 text-muted mb-3"></i>
                      <h6 className="text-muted">No Visits Yet</h6>
                      <p className="text-muted small">Schedule the patient's first visit to start tracking their health journey</p>
                    </div>
                  ) : (
                    <div className="visits-timeline">
                      {visits.slice().reverse().map((visit, index) => (
                        <motion.div
                          key={visit._id}
                          className="visit-item"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="visit-header">
                            <div className="visit-date">
                              <i className="fas fa-calendar me-2"></i>
                              {new Date(visit.visitDate).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </div>
                            {visit.prediction?.riskLabel && (
                              <span className={`badge bg-${getRiskBadge(visit.prediction.riskLabel)}`}>
                                {visit.prediction.riskLabel} Risk
                              </span>
                            )}
                          </div>
                          <div className="visit-metrics">
                            {visit.metrics?.HbA1cLevel && (
                              <span className="metric">HbA1c: {visit.metrics.HbA1cLevel}%</span>
                            )}
                            {visit.metrics?.bloodGlucoseLevel && (
                              <span className="metric">Glucose: {visit.metrics.bloodGlucoseLevel} mg/dL</span>
                            )}
                            {visit.metrics?.bmi && (
                              <span className="metric">BMI: {visit.metrics.bmi}</span>
                            )}
                          </div>
                          {visit.notes && (
                            <div className="visit-notes">
                              <strong>Notes:</strong> {visit.notes}
                            </div>
                          )}
                          {visit.recommendations && (
                            <div className="visit-recommendations">
                              <strong>Recommendations:</strong> {visit.recommendations}
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'charts' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <h5 className="mb-4">Health Trends</h5>
                  {visits.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="fas fa-chart-line fs-1 text-muted mb-3"></i>
                      <h6 className="text-muted">No Data Available</h6>
                      <p className="text-muted small">Charts will appear once visits with metrics are recorded</p>
                    </div>
                  ) : (
                    <div style={{ height: '400px' }}>
                      <HbA1cChart data={chartData} />
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'profile' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <h5 className="mb-4">Patient Profile</h5>
                  <div className="profile-details">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <div className="detail-item">
                          <label>Patient ID</label>
                          <div className="value">
                            <code>{patient?.patientId}</code>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="detail-item">
                          <label>Full Name</label>
                          <div className="value">{patient?.name}</div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="detail-item">
                          <label>Date of Birth</label>
                          <div className="value">
                            {patient?.dob ? new Date(patient.dob).toLocaleDateString() : 'Not provided'}
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="detail-item">
                          <label>Gender</label>
                          <div className="value text-capitalize">{patient?.gender || 'Not specified'}</div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="detail-item">
                          <label>Hypertension</label>
                          <div className="value">
                            <span className={`badge ${patient?.hypertension ? 'bg-danger' : 'bg-success'}`}>
                              {patient?.hypertension ? 'Present' : 'Not Present'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="detail-item">
                          <label>Heart Disease</label>
                          <div className="value">
                            <span className={`badge ${patient?.heartDisease ? 'bg-danger' : 'bg-success'}`}>
                              {patient?.heartDisease ? 'Present' : 'Not Present'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="detail-item">
                          <label>Smoking History</label>
                          <div className="value text-capitalize">{patient?.smokingHistory || 'Not specified'}</div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="detail-item">
                          <label>Total Visits</label>
                          <div className="value">{visits.length}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </motion.div>
  );
}
