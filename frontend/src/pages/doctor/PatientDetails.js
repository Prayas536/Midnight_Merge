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
      className="pb-5 patient-details-page"
    >
      <PageHeader
        title="Patient Details"
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
          className={`alert ${msg.type === 'success' ? 'alert-success' : 'alert-danger'} border-0 shadow-sm rounded-3 mb-4`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="d-flex align-items-center">
            <i className={`fas ${msg.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} fs-4 me-3`}></i>
            <div>{typeof msg === 'string' ? msg : msg.text}</div>
          </div>
        </motion.div>
      )}

      <div className="row g-4">
        {/* Patient Profile Sidebar */}
        <div className="col-lg-4">
          {/* Main Profile Card */}
          <GlassCard className="p-0 mb-4 border-0 shadow-sm text-center overflow-hidden">
            <div className="p-4 pb-0">
              <div
                className="mx-auto rounded-circle d-flex align-items-center justify-content-center mb-3 text-white fw-bold shadow"
                style={{
                  width: '100px',
                  height: '100px',
                  fontSize: '2.5rem',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)'
                }}
              >
                {patient?.name?.charAt(0).toUpperCase()}
              </div>
              <h4 className="fw-bold mb-1">{patient?.name}</h4>
              <p className="text-muted mb-3 d-flex align-items-center justify-content-center gap-2">
                <i className="fas fa-id-card opacity-50"></i> {patient?.patientId}
              </p>

              <div className="d-flex justify-content-center gap-2 mb-4">
                <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill">
                  {patient?.gender || 'Unknown'}
                </span>
                <span className="badge bg-info bg-opacity-10 text-info px-3 py-2 rounded-pill">
                  {patient?.dob ? `${new Date().getFullYear() - new Date(patient.dob).getFullYear()} Years` : 'Age N/A'}
                </span>
              </div>
            </div>

            <div className="bg-light bg-opacity-50 p-3 border-top d-flex justify-content-around">
              <div className="text-center">
                <small className="text-muted d-block text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>Visits</small>
                <span className="fw-bold fs-5">{visits.length}</span>
              </div>
              <div className="vr opacity-25"></div>
              <div className="text-center">
                <small className="text-muted d-block text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>Status</small>
                <span className="fw-bold fs-5 text-success">Active</span>
              </div>
            </div>
          </GlassCard>

          {/* Health Conditions */}
          <GlassCard className="p-4 mb-4 border-0 shadow-sm">
            <h6 className="mb-3 fw-bold border-bottom pb-2">
              <i className="fas fa-notes-medical me-2 text-primary"></i>Medical Profile
            </h6>
            <div className="d-flex flex-column gap-3">
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted"><i className="fas fa-heartbeat me-2 text-danger opacity-50"></i>Hypertension</span>
                <span className={`badge rounded-pill ${patient?.hypertension ? 'bg-danger' : 'bg-success'} bg-opacity-10 text-${patient?.hypertension ? 'danger' : 'success'}`}>
                  {patient?.hypertension ? 'Analyzed' : 'No History'}
                </span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted"><i className="fas fa-heart-broken me-2 text-danger opacity-50"></i>Heart Disease</span>
                <span className={`badge rounded-pill ${patient?.heartDisease ? 'bg-danger' : 'bg-success'} bg-opacity-10 text-${patient?.heartDisease ? 'danger' : 'success'}`}>
                  {patient?.heartDisease ? 'Analyzed' : 'No History'}
                </span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted"><i className="fas fa-smoking me-2 text-secondary opacity-50"></i>Smoking</span>
                <span className="fw-semibold text-dark text-capitalize">{patient?.smokingHistory || 'N/A'}</span>
              </div>
            </div>
          </GlassCard>

          {/* Latest Vitals */}
          <GlassCard className="p-4 border-0 shadow-sm">
            <h6 className="mb-3 fw-bold border-bottom pb-2">
              <i className="fas fa-activity me-2 text-primary"></i>Latest Vitals
            </h6>
            {visits.length > 0 && visits[visits.length - 1].metrics ? (
              <div className="row g-3">
                <div className="col-6">
                  <div className="p-3 bg-light rounded-3 text-center h-100">
                    <small className="text-muted d-block mb-1">HbA1c</small>
                    <div className="fs-4 fw-bold text-primary mb-1">
                      {visits[visits.length - 1].metrics.HbA1cLevel || '-'}%
                    </div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-3 bg-light rounded-3 text-center h-100">
                    <small className="text-muted d-block mb-1">Glucose</small>
                    <div className="fs-4 fw-bold text-success mb-1">
                      {visits[visits.length - 1].metrics.bloodGlucoseLevel || '-'}
                    </div>
                    <small className="text-muted" style={{ fontSize: '0.7rem' }}>mg/dL</small>
                  </div>
                </div>
                <div className="col-12">
                  <div className="d-flex justify-content-between align-items-center p-2 bg-light rounded-3 px-3">
                    <span className="text-muted small">BMI</span>
                    <span className="fw-bold">{visits[visits.length - 1].metrics.bmi || '-'}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-muted">
                <i className="fas fa-chart-bar fs-1 mb-2 opacity-25"></i>
                <p className="small mb-0">No vitals recorded yet</p>
              </div>
            )}
          </GlassCard>
        </div>

        {/* Main Content with Tabs */}
        <div className="col-lg-8">
          <GlassCard className="p-0 border-0 shadow-sm h-100">
            {/* Tab Navigation */}
            <div className="d-flex border-bottom px-4 pt-4 pb-0 bg-light bg-opacity-25">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`btn border-0 rounded-0 pb-3 px-4 position-relative fw-semibold ${activeTab === tab.id ? 'text-primary' : 'text-muted'}`}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    marginBottom: '-1px',
                    borderBottom: activeTab === tab.id ? '2px solid var(--primary-color, #667eea)' : '2px solid transparent'
                  }}
                >
                  <i className={`${tab.icon} me-2 ${activeTab === tab.id ? '' : 'opacity-50'}`}></i>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-4">
              {activeTab === 'visits' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="mb-0 fw-bold">Visit History</h5>
                    <span className="badge bg-light text-dark border">{visits.length} Records</span>
                  </div>

                  {visits.length === 0 ? (
                    <div className="text-center py-5">
                      <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
                        <i className="fas fa-calendar-plus fs-1 text-muted opacity-50"></i>
                      </div>
                      <h6 className="text-dark fw-bold">No Visits Yet</h6>
                      <p className="text-muted small mb-3">Start tracking this patient's health journey.</p>
                      <Link className="btn btn-primary btn-sm" to={`/doctor/patients/${id}/add-visit`}>
                        Schedule First Visit
                      </Link>
                    </div>
                  ) : (
                    <div className="visits-timeline position-relative ps-3">
                      {/* Timeline Line */}
                      <div className="position-absolute top-0 bottom-0 start-0 bg-light" style={{ width: '2px', left: '24px' }}></div>

                      {visits.slice().slice().reverse().map((visit, index) => (
                        <motion.div
                          key={visit._id}
                          className="visit-item mb-4 position-relative ps-5"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          {/* Timeline Dot */}
                          <div
                            className="position-absolute top-0 start-0 bg-white border border-4 border-primary rounded-circle shadow-sm"
                            style={{ width: '16px', height: '16px', left: '17px', marginTop: '6px', zIndex: 2 }}
                          ></div>

                          <div className="card border-0 shadow-sm bg-light hover-shadow transition-all">
                            <div className="card-body p-3">
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                  <h6 className="fw-bold text-primary mb-0">
                                    {new Date(visit.visitDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                  </h6>
                                  <small className="text-muted">{new Date(visit.visitDate).toLocaleDateString('en-US', { weekday: 'long' })}</small>
                                </div>
                                {visit.prediction?.riskLabel && (
                                  <span className={`badge rounded-pill bg-${getRiskBadge(visit.prediction.riskLabel)} bg-opacity-10 text-${getRiskBadge(visit.prediction.riskLabel)} border border-${getRiskBadge(visit.prediction.riskLabel)} border-opacity-25`}>
                                    {visit.prediction.riskLabel} Risk
                                  </span>
                                )}
                              </div>

                              <div className="d-flex text-dark gap-4 text-center my-3 py-2 bg-white rounded-3 border-light border">
                                <div className="flex-fill border-end">
                                  <small className="d-block text-muted" style={{ fontSize: '0.7rem' }}>HbA1c</small>
                                  <span className="fw-bold">{visit.metrics?.HbA1cLevel ? `${visit.metrics.HbA1cLevel}%` : '-'}</span>
                                </div>
                                <div className="flex-fill border-end">
                                  <small className="d-block text-muted" style={{ fontSize: '0.7rem' }}>Glucose</small>
                                  <span className="fw-bold">{visit.metrics?.bloodGlucoseLevel || '-'}</span>
                                </div>
                                <div className="flex-fill">
                                  <small className="d-block text-muted" style={{ fontSize: '0.7rem' }}>BMI</small>
                                  <span className="fw-bold">{visit.metrics?.bmi || '-'}</span>
                                </div>
                              </div>

                              {(visit.notes || visit.recommendations) && (
                                <div className="bg-white p-3 rounded-3 border border-light">
                                  {visit.notes && <p className="mb-1 small"><i className="fas fa-sticky-note me-2 text-warning opacity-75"></i>{visit.notes}</p>}
                                  {visit.recommendations && <p className="mb-0 small"><i className="fas fa-stethoscope me-2 text-info opacity-75"></i>{visit.recommendations}</p>}
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'charts' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="mb-0 fw-bold">Health Trends</h5>
                    <div className="btn-group btn-group-sm">
                      <button className="btn btn-outline-secondary active">6 Months</button>
                      <button className="btn btn-outline-secondary">1 Year</button>
                    </div>
                  </div>
                  {visits.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                      <i className="fas fa-chart-area fs-1 mb-3 opacity-25"></i>
                      <p>Insufficient data to display trends.</p>
                    </div>
                  ) : (
                    <div className="bg-white p-3 rounded-3 border" style={{ height: '400px' }}>
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
                  <h5 className="mb-4 fw-bold">Detailed Profile</h5>
                  <div className="profile-details">
                    <div className="row g-4">
                      {/* Personal Info */}
                      <div className="col-12">
                        <div className="p-3 bg-light rounded-3 bg-opacity-50">
                          <h6 className="text-primary mb-3 text-uppercase small fw-bold"><i className="fas fa-user-circle me-2"></i>Personal Information</h6>
                          <div className="row g-3">
                            <div className="col-md-6">
                              <label className="text-muted small d-block mb-1">Full Name</label>
                              <div className="fw-semibold text-dark">{patient?.name}</div>
                            </div>
                            <div className="col-md-6">
                              <label className="text-muted small d-block mb-1">Date of Birth</label>
                              <div className="fw-semibold text-dark">{patient?.dob ? new Date(patient.dob).toLocaleDateString() : 'N/A'}</div>
                            </div>
                            <div className="col-md-6">
                              <label className="text-muted small d-block mb-1">Gender</label>
                              <div className="fw-semibold text-dark text-capitalize">{patient?.gender}</div>
                            </div>
                            <div className="col-md-6">
                              <label className="text-muted small d-block mb-1">Patient ID</label>
                              <code className="text-primary fw-bold">{patient?.patientId}</code>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Medical History */}
                      <div className="col-12">
                        <div className="p-3 bg-light rounded-3 bg-opacity-50">
                          <h6 className="text-danger mb-3 text-uppercase small fw-bold"><i className="fas fa-file-medical me-2"></i>Medical History</h6>
                          <div className="row g-3">
                            <div className="col-md-6">
                              <label className="text-muted small d-block mb-1">Hypertension</label>
                              <div><span className={`badge ${patient?.hypertension ? 'bg-danger' : 'bg-success'}`}>{patient?.hypertension ? 'Yes' : 'No'}</span></div>
                            </div>
                            <div className="col-md-6">
                              <label className="text-muted small d-block mb-1">Heart Disease</label>
                              <div><span className={`badge ${patient?.heartDisease ? 'bg-danger' : 'bg-success'}`}>{patient?.heartDisease ? 'Yes' : 'No'}</span></div>
                            </div>
                            <div className="col-md-6">
                              <label className="text-muted small d-block mb-1">Smoking History</label>
                              <div className="fw-semibold text-dark text-capitalize">{patient?.smokingHistory || 'None'}</div>
                            </div>
                            <div className="col-md-6">
                              <label className="text-muted small d-block mb-1">Registration Date</label>
                              <div className="fw-semibold text-dark">{patient?.createdAt ? new Date(patient.createdAt).toLocaleDateString() : 'N/A'}</div>
                            </div>
                          </div>
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
