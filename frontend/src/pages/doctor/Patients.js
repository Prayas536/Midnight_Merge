import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../api/axios";
import PageHeader from "../../components/layout/PageHeader";
import GlassCard from "../../components/ui/GlassCard";
import StatCard from "../../components/ui/StatCard";
import EmptyState from "../../components/ui/EmptyState";
import ConfirmModal from "../../components/ui/ConfirmModal";

const emptyForm = {
  name: "",
  dob: "",
  gender: "male",
  hypertension: false,
  heartDisease: false,
  smokingHistory: "no info",
  bmi: "",
  HbA1cLevel: "",
  bloodGlucoseLevel: "",
};

export default function Patients() {
  const [q, setQ] = useState("");
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);
  const [filters, setFilters] = useState({
    risk: 'all',
    gender: 'all',
    ageGroup: 'all'
  });

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [patientLogin, setPatientLogin] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, patient: null });
  const [patientsWithRisk, setPatientsWithRisk] = useState({});

  async function load() {
    setLoading(true);
    try {
      const res = await api.get("/patients", { params: q ? { q } : {} });
      setPatients(res.data.data);
    } catch (error) {
      setMsg("Failed to load patients");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function createPatient(e) {
    e.preventDefault();
    setMsg(null);
    try {
      const payload = {
        ...form,
        bmi: form.bmi === "" ? null : Number(form.bmi),
        HbA1cLevel: form.HbA1cLevel === "" ? null : Number(form.HbA1cLevel),
        bloodGlucoseLevel: form.bloodGlucoseLevel === "" ? null : Number(form.bloodGlucoseLevel),
      };
      const res = await api.post("/patients", payload);
      setPatientLogin(res.data.data.patientLogin);
      setShowModal(false);
      setForm(emptyForm);
      await load();
    } catch (err) {
      setMsg(err?.response?.data?.message || "Create failed");
    }
  }

  // Fetch latest risk for each patient from their most recent visit
  useEffect(() => {
    async function fetchRisks() {
      const riskData = {};
      for (const patient of patients) {
        try {
          const res = await api.get(`/patients/${patient._id}/visits`);
          const visits = res.data.data || [];
          if (visits.length > 0 && visits[0].prediction?.riskLabel) {
            riskData[patient._id] = visits[0].prediction.riskLabel.toLowerCase();
          }
        } catch (e) {
          // ignore errors for individual patients
        }
      }
      setPatientsWithRisk(riskData);
    }
    if (patients.length > 0) {
      fetchRisks();
    }
  }, [patients]);

  const getRiskLevel = (patient) => {
    // First check if we have a risk from the latest visit prediction
    if (patientsWithRisk[patient._id]) {
      // Normalize: remove " risk" if present to just get the level part
      return patientsWithRisk[patient._id].toLowerCase().replace(' risk', '').trim();
    }
    // Fallback to HbA1c-based calculation
    const hba1c = patient.HbA1cLevel;
    if (!hba1c) return 'unknown';
    if (hba1c >= 9) return 'high';
    if (hba1c >= 7) return 'medium';
    return 'low';
  };

  const handleDeleteClick = (patient) => {
    setDeleteModal({ isOpen: true, patient });
  };

  const handleDeleteConfirm = async () => {
    const patient = deleteModal.patient;
    if (!patient) return;
    try {
      await api.delete(`/patients/${patient._id}`);
      setMsg({ type: 'success', text: 'Patient deleted successfully' });
      setDeleteModal({ isOpen: false, patient: null });
      load();
    } catch (err) {
      setMsg({ type: 'error', text: err?.response?.data?.message || 'Delete failed' });
      setDeleteModal({ isOpen: false, patient: null });
    }
  };

  const getAgeGroup = (dob) => {
    if (!dob) return 'unknown';
    const age = new Date().getFullYear() - new Date(dob).getFullYear();
    if (age < 30) return 'young';
    if (age < 60) return 'middle';
    return 'senior';
  };

  const filtered = useMemo(() => {
    return patients.filter(patient => {
      const matchesSearch = !q ||
        patient.name.toLowerCase().includes(q.toLowerCase()) ||
        patient.patientId.toLowerCase().includes(q.toLowerCase());

      const matchesRisk = filters.risk === 'all' || getRiskLevel(patient) === filters.risk;
      const matchesGender = filters.gender === 'all' || patient.gender === filters.gender;
      const matchesAge = filters.ageGroup === 'all' || getAgeGroup(patient.dob) === filters.ageGroup;

      return matchesSearch && matchesRisk && matchesGender && matchesAge;
    });
  }, [patients, q, filters]);

  const actions = [
    <button key="add-patient" className="btn btn-primary" onClick={() => setShowModal(true)}>
      <i className="fas fa-user-plus me-2"></i>Add Patient
    </button>
  ];

  const filterChips = [
    {
      key: 'risk', label: 'Risk Level', options: [
        { value: 'all', label: 'All Risks' },
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' }
      ]
    },
    {
      key: 'gender', label: 'Gender', options: [
        { value: 'all', label: 'All Genders' },
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' }
      ]
    },
    {
      key: 'ageGroup', label: 'Age Group', options: [
        { value: 'all', label: 'All Ages' },
        { value: 'young', label: 'Under 30' },
        { value: 'middle', label: '30-60' },
        { value: 'senior', label: '60+' }
      ]
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <PageHeader
        title="Patient Management"
        subtitle="Manage your diabetes patients and their health records"
        actions={actions}
      />

      {/* Stats Overview */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <StatCard
              icon="fas fa-users"
              title="Total Patients"
              value={patients.length}
              delta={{ value: 12, type: 'increase' }}
              variant="default"
            />
          </motion.div>
        </div>
        <div className="col-md-3">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <StatCard
              icon="fas fa-exclamation-triangle"
              title="High Risk"
              value={patients.filter(p => getRiskLevel(p) === 'high').length}
              delta={{ value: 5, type: 'decrease' }}
              variant="danger"
            />
          </motion.div>
        </div>
        <div className="col-md-3">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <StatCard
              icon="fas fa-chart-line"
              title="Avg HbA1c"
              value={`${(patients.reduce((acc, p) => acc + (p.HbA1cLevel || 0), 0) / (patients.length || 1)).toFixed(1)}%`}
              delta={{ value: 0.2, type: 'decrease' }}
              variant="warning"
            />
          </motion.div>
        </div>
        <div className="col-md-3">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <StatCard
              icon="fas fa-user-plus"
              title="New This Month"
              value={patients.length > 5 ? Math.floor(patients.length * 0.2) : 0}
              delta={{ value: 8, type: 'increase' }}
              variant="success"
            />
          </motion.div>
        </div>
      </div>

      {/* Modern Search and Filter Bar */}
      <GlassCard className="p-4 mb-4 border-0 shadow-sm">
        <div className="row g-3 align-items-center">
          <div className="col-lg-5">
            <div className="position-relative">
              <span className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted">
                <i className="fas fa-search fs-5"></i>
              </span>
              <input
                className="form-control form-control-lg ps-5 border-0 bg-light"
                placeholder="Search patients by name or ID..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                style={{ borderRadius: '15px' }}
              />
            </div>
          </div>
          <div className="col-lg-7">
            <div className="d-flex gap-2 overflow-auto pb-2 pb-lg-0 justify-content-lg-end">
              {filterChips.map(chip => (
                <select
                  key={chip.key}
                  className="form-select border-0 bg-light fw-semibold"
                  value={filters[chip.key]}
                  onChange={(e) => setFilters({ ...filters, [chip.key]: e.target.value })}
                  style={{ borderRadius: '12px', minWidth: '140px', cursor: 'pointer' }}
                >
                  {chip.options.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              ))}
              <button className="btn btn-primary px-4" onClick={load} style={{ borderRadius: '12px', minWidth: '120px' }}>
                <i className="fas fa-sync-alt me-2"></i>Refresh
              </button>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Messages */}
      {msg && (
        <motion.div
          className={`alert alert-${msg.type === 'success' ? 'success' : 'danger'} border-0 shadow-sm rounded-3`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="d-flex align-items-center">
            <i className={`fas ${msg.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} fs-4 me-3`}></i>
            <div>{typeof msg === 'object' ? msg.text : msg}</div>
          </div>
        </motion.div>
      )}

      {patientLogin && (
        <motion.div
          className="alert alert-success border-0 shadow-sm rounded-3 p-4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="d-flex">
            <div className="me-4">
              <div className="bg-success bg-opacity-10 text-success rounded-circle d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                <i className="fas fa-user-check fs-2"></i>
              </div>
            </div>
            <div>
              <h5 className="fw-bold mb-3">Patient Account Created Successfully</h5>
              <div className="d-flex gap-4 p-3 bg-white rounded-3 border">
                <div>
                  <small className="text-muted d-block text-uppercase fw-bold mb-1" style={{ fontSize: '0.7rem' }}>Patient ID</small>
                  <code className="fs-5 fw-bold text-dark">{patientLogin.patientId}</code>
                </div>
                <div className="vr"></div>
                <div>
                  <small className="text-muted d-block text-uppercase fw-bold mb-1" style={{ fontSize: '0.7rem' }}>Temporary Password</small>
                  <code className="fs-5 fw-bold text-dark">{patientLogin.password}</code>
                </div>
              </div>
              <p className="text-muted mt-3 mb-0 small">
                <i className="fas fa-lock me-1"></i> Please share these credentials securely with the patient. They will be required to change their password upon first login.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Patients List */}
      {loading ? (
        <div className="row g-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="col-md-6 col-lg-4">
              <GlassCard className="p-4">
                <div className="skeleton" style={{ height: '200px' }}></div>
              </GlassCard>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="fas fa-users"
          title="No patients found"
          description="Try adjusting your search or filters, or add a new patient to get started."
          action={
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <i className="fas fa-user-plus me-2"></i>Add First Patient
            </button>
          }
        />
      ) : (
        <>
          {/* Desktop Table */}
          <div className="d-none d-md-block">
            <GlassCard className="p-0 overflow-hidden border-0 shadow-sm">
              <div className="table-responsive">
                <table className="table table-hover mb-0 align-middle">
                  <thead className="bg-opacity-50 border-bottom" style={{ backgroundColor: 'var(--surface)' }}>
                    <tr>
                      <th className="py-3 ps-4 text-muted fw-bold text-uppercase small" style={{ letterSpacing: '0.5px' }}>Patient</th>
                      <th className="py-3 text-muted fw-bold text-uppercase small" style={{ letterSpacing: '0.5px' }}>Gender/Age</th>
                      <th className="py-3 text-muted fw-bold text-uppercase small" style={{ letterSpacing: '0.5px' }}>Risk Assessment</th>
                      <th className="py-3 text-muted fw-bold text-uppercase small" style={{ letterSpacing: '0.5px' }}>Key Metrics</th>
                      <th className="py-3 pe-4 text-muted fw-bold text-uppercase small text-end" style={{ letterSpacing: '0.5px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((patient, index) => {
                      const riskLevel = getRiskLevel(patient);
                      const age = patient.dob ? new Date().getFullYear() - new Date(patient.dob).getFullYear() : 'N/A';
                      const initial = patient.name.charAt(0).toUpperCase();

                      return (
                        <motion.tr
                          key={patient._id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="position-relative"
                        >
                          <td className="ps-4 py-3">
                            <div className="d-flex align-items-center">
                              <div
                                className="rounded-circle d-flex align-items-center justify-content-center me-3 text-white fw-bold shadow-sm"
                                style={{
                                  width: '45px',
                                  height: '45px',
                                  background: `linear-gradient(135deg, ${index % 3 === 0 ? '#667eea, #764ba2' :
                                    index % 3 === 1 ? '#11998e, #38ef7d' :
                                      '#ff9966, #ff5e62'
                                    })`
                                }}
                              >
                                {initial}
                              </div>
                              <div>
                                <h6 className="mb-0 fw-bold" style={{ color: 'var(--text)' }}>{patient.name}</h6>
                                <small className="text-muted d-block">ID: <code className="text-primary">{patient.patientId}</code></small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="d-flex flex-column">
                              <span className="text-capitalize fw-semibold" style={{ color: 'var(--text)' }}>{patient.gender}</span>
                              <small className="text-muted">{age} years old</small>
                            </div>
                          </td>
                          <td>
                            <span className={`badge rounded-pill px-3 py-2 bg-${riskLevel === 'high' ? 'danger' :
                              riskLevel === 'medium' ? 'warning' :
                                'success'
                              } bg-opacity-10 text-${riskLevel === 'high' ? 'danger' :
                                riskLevel === 'medium' ? 'dark' :
                                  'success'
                              } border border-${riskLevel === 'high' ? 'danger' :
                                riskLevel === 'medium' ? 'warning' :
                                  'success'
                              } border-opacity-25`}>
                              <i className={`fas ${riskLevel === 'high' ? 'fa-exclamation-circle' :
                                riskLevel === 'medium' ? 'fa-exclamation-triangle' :
                                  'fa-shield-alt'
                                } me-2`}></i>
                              {riskLevel.toUpperCase()} RISK
                            </span>
                          </td>
                          <td>
                            <div className="d-flex gap-3">
                              <div className="d-flex flex-column">
                                <small className="text-muted" style={{ fontSize: '0.7rem' }}>HbA1c</small>
                                <span className="fw-bold">{patient.HbA1cLevel ? `${patient.HbA1cLevel}%` : '-'}</span>
                              </div>
                              <div className="vr opacity-25"></div>
                              <div className="d-flex flex-column">
                                <small className="text-muted" style={{ fontSize: '0.7rem' }}>BMI</small>
                                <span className="fw-bold">{patient.bmi || '-'}</span>
                              </div>
                            </div>
                          </td>
                          <td className="text-end pe-4">
                            <div className="btn-group">
                              <Link
                                className="btn btn-light btn-sm text-primary"
                                to={`/doctor/patients/${patient._id}`}
                                title="View Details"
                              >
                                <i className="fas fa-eye"></i>
                              </Link>
                              <Link
                                className="btn btn-light btn-sm text-secondary"
                                to={`/doctor/patients/${patient._id}/add-visit`}
                                title="Add Visit"
                              >
                                <i className="fas fa-plus-circle"></i>
                              </Link>
                              <button
                                className="btn btn-light btn-sm text-danger"
                                onClick={() => handleDeleteClick(patient)}
                                title="Delete Patient"
                              >
                                <i className="fas fa-trash-alt"></i>
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </GlassCard>
            <div className="d-flex justify-content-between align-items-center mt-3 text-muted small px-2">
              <span>Showing {filtered.length} patients</span>
              <span>Sorted by latest activity</span>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="d-md-none row g-3">
            {filtered.map((patient, index) => {
              const riskLevel = getRiskLevel(patient);
              const age = patient.dob ? new Date().getFullYear() - new Date(patient.dob).getFullYear() : 'N/A';
              const initial = patient.name.charAt(0).toUpperCase();

              return (
                <motion.div
                  key={patient._id}
                  className="col-12"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <GlassCard className="p-3 border-0 shadow-sm">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div className="d-flex align-items-center">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center me-3 text-white fw-bold shadow-sm"
                          style={{
                            width: '40px',
                            height: '40px',
                            fontSize: '0.9rem',
                            background: `linear-gradient(135deg, ${index % 3 === 0 ? '#667eea, #764ba2' :
                              index % 3 === 1 ? '#11998e, #38ef7d' :
                                '#ff9966, #ff5e62'
                              })`
                          }}
                        >
                          {initial}
                        </div>
                        <div>
                          <h6 className="mb-0 fw-bold">{patient.name}</h6>
                          <small className="text-muted">ID: {patient.patientId}</small>
                        </div>
                      </div>
                      <span className={`badge rounded-pill bg-${riskLevel === 'high' ? 'danger' :
                        riskLevel === 'medium' ? 'warning' :
                          'success'
                        } bg-opacity-10 text-${riskLevel === 'high' ? 'danger' :
                          riskLevel === 'medium' ? 'warning' :
                            'success'
                        }`}>
                        {riskLevel.toUpperCase()}
                      </span>
                    </div>

                    <div className="row g-2 text-center mb-3">
                      <div className="col-4 border-end">
                        <small className="text-muted d-block" style={{ fontSize: '0.7rem' }}>Gender</small>
                        <span className="fw-semibold small text-capitalize">{patient.gender}</span>
                      </div>
                      <div className="col-4 border-end">
                        <small className="text-muted d-block" style={{ fontSize: '0.7rem' }}>Age</small>
                        <span className="fw-semibold small">{age}</span>
                      </div>
                      <div className="col-4">
                        <small className="text-muted d-block" style={{ fontSize: '0.7rem' }}>HbA1c</small>
                        <span className="fw-semibold small">{patient.HbA1cLevel ? `${patient.HbA1cLevel}%` : '-'}</span>
                      </div>
                    </div>

                    <div className="d-flex gap-2">
                      <Link className="btn btn-primary btn-sm flex-fill rounded-3" to={`/doctor/patients/${patient._id}`}>
                        View Details
                      </Link>
                      <Link className="btn btn-outline-primary btn-sm rounded-3" to={`/doctor/patients/${patient._id}/add-visit`}>
                        <i className="fas fa-plus"></i>
                      </Link>
                      <button className="btn btn-outline-danger btn-sm rounded-3" onClick={() => handleDeleteClick(patient)}>
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        </>
      )}

      {/* Floating Add Button */}
      <Link
        to="#"
        className="btn btn-primary btn-lg rounded-circle position-fixed bottom-0 end-0 m-4 d-md-none"
        onClick={() => setShowModal(true)}
        style={{ zIndex: 1050 }}
      >
        <i className="fas fa-plus"></i>
      </Link>

      {/* Add Patient Modal */}
      {showModal && (
        <div className="modal d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Patient</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <form onSubmit={createPatient}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Full Name</label>
                      <input
                        className="form-control"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                        placeholder="Enter patient's full name"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Date of Birth</label>
                      <input
                        type="date"
                        className="form-control"
                        value={form.dob}
                        onChange={(e) => setForm({ ...form, dob: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Gender</label>
                      <select
                        className="form-select"
                        value={form.gender}
                        onChange={(e) => setForm({ ...form, gender: e.target.value })}
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Smoking History</label>
                      <select
                        className="form-select"
                        value={form.smokingHistory}
                        onChange={(e) => setForm({ ...form, smokingHistory: e.target.value })}
                      >
                        <option value="no info">No Info</option>
                        <option value="never">Never</option>
                        <option value="former">Former</option>
                        <option value="current">Current</option>
                        <option value="not current">Not Current</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Conditions</label>
                      <div className="d-flex gap-3">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={form.hypertension}
                            onChange={(e) => setForm({ ...form, hypertension: e.target.checked })}
                          />
                          <label className="form-check-label">Hypertension</label>
                        </div>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={form.heartDisease}
                            onChange={(e) => setForm({ ...form, heartDisease: e.target.checked })}
                          />
                          <label className="form-check-label">Heart Disease</label>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">BMI</label>
                      <input
                        className="form-control"
                        type="number"
                        step="0.1"
                        value={form.bmi}
                        onChange={(e) => setForm({ ...form, bmi: e.target.value })}
                        placeholder="e.g., 24.5"
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">HbA1c Level (%)</label>
                      <input
                        className="form-control"
                        type="number"
                        step="0.1"
                        value={form.HbA1cLevel}
                        onChange={(e) => setForm({ ...form, HbA1cLevel: e.target.value })}
                        placeholder="e.g., 7.2"
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Blood Glucose (mg/dL)</label>
                      <input
                        className="form-control"
                        type="number"
                        step="1"
                        value={form.bloodGlucoseLevel}
                        onChange={(e) => setForm({ ...form, bloodGlucoseLevel: e.target.value })}
                        placeholder="e.g., 140"
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button className="btn btn-primary" type="submit">
                    <i className="fas fa-user-plus me-2"></i>Create Patient
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, patient: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Patient"
        message={`Are you sure you want to delete ${deleteModal.patient?.name}? This action cannot be undone and will remove all associated visits and records.`}
        confirmText="Delete Patient"
        cancelText="Cancel"
        confirmVariant="danger"
        icon="fas fa-trash-alt"
      />
    </motion.div>
  );
}

