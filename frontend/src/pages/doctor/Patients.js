import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../api/axios";
import PageHeader from "../../components/layout/PageHeader";
import GlassCard from "../../components/ui/GlassCard";
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
    risk: "all",
    gender: "all",
    ageGroup: "all",
  });

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [patientLogin, setPatientLogin] = useState(null);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    patient: null,
  });
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

  useEffect(() => {
    load();
  }, []);

  async function createPatient(e) {
    e.preventDefault();
    setMsg(null);
    try {
      const payload = {
        ...form,
        bmi: form.bmi === "" ? null : Number(form.bmi),
        HbA1cLevel: form.HbA1cLevel === "" ? null : Number(form.HbA1cLevel),
        bloodGlucoseLevel:
          form.bloodGlucoseLevel === "" ? null : Number(form.bloodGlucoseLevel),
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
            riskData[patient._id] =
              visits[0].prediction.riskLabel.toLowerCase();
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
      return patientsWithRisk[patient._id];
    }
    // Fallback to HbA1c-based calculation
    const hba1c = patient.HbA1cLevel;
    if (!hba1c) return "unknown";
    if (hba1c >= 9) return "high";
    if (hba1c >= 7) return "medium";
    return "low";
  };

  const handleDeleteClick = (patient) => {
    setDeleteModal({ isOpen: true, patient });
  };

  const handleDeleteConfirm = async () => {
    const patient = deleteModal.patient;
    if (!patient) return;
    try {
      await api.delete(`/patients/${patient._id}`);
      setMsg({ type: "success", text: "Patient deleted successfully" });
      setDeleteModal({ isOpen: false, patient: null });
      load();
    } catch (err) {
      setMsg({
        type: "error",
        text: err?.response?.data?.message || "Delete failed",
      });
      setDeleteModal({ isOpen: false, patient: null });
    }
  };

  const getAgeGroup = (dob) => {
    if (!dob) return "unknown";
    const age = new Date().getFullYear() - new Date(dob).getFullYear();
    if (age < 30) return "young";
    if (age < 60) return "middle";
    return "senior";
  };

  const filtered = useMemo(() => {
    return patients.filter((patient) => {
      const matchesSearch =
        !q ||
        patient.name.toLowerCase().includes(q.toLowerCase()) ||
        patient.patientId.toLowerCase().includes(q.toLowerCase());

      const matchesRisk =
        filters.risk === "all" || getRiskLevel(patient) === filters.risk;
      const matchesGender =
        filters.gender === "all" || patient.gender === filters.gender;
      const matchesAge =
        filters.ageGroup === "all" ||
        getAgeGroup(patient.dob) === filters.ageGroup;

      return matchesSearch && matchesRisk && matchesGender && matchesAge;
    });
  }, [patients, q, filters]);

  const actions = [
    <button
      key="add-patient"
      className="btn btn-primary"
      onClick={() => setShowModal(true)}
    >
      <i className="fas fa-user-plus me-2"></i>Add Patient
    </button>,
  ];

  const filterChips = [
    {
      key: "risk",
      label: "Risk Level",
      options: [
        { value: "all", label: "All Risks" },
        { value: "low", label: "Low" },
        { value: "medium", label: "Medium" },
        { value: "high", label: "High" },
      ],
    },
    {
      key: "gender",
      label: "Gender",
      options: [
        { value: "all", label: "All Genders" },
        { value: "male", label: "Male" },
        { value: "female", label: "Female" },
      ],
    },
    {
      key: "ageGroup",
      label: "Age Group",
      options: [
        { value: "all", label: "All Ages" },
        { value: "young", label: "Under 30" },
        { value: "middle", label: "30-60" },
        { value: "senior", label: "60+" },
      ],
    },
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

      {/* Search and Filters */}
      <GlassCard className="p-4 mb-4">
        <div className="row g-3 align-items-end">
          <div className="col-md-6">
            <label className="form-label fw-semibold">Search Patients</label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="fas fa-search"></i>
              </span>
              <input
                className="form-control"
                placeholder="Search by name or patient ID..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <button className="btn btn-outline-primary" onClick={load}>
                Search
              </button>
            </div>
          </div>
          {filterChips.map((chip) => (
            <div key={chip.key} className="col-md-2">
              <label className="form-label fw-semibold">{chip.label}</label>
              <select
                className="form-select"
                value={filters[chip.key]}
                onChange={(e) =>
                  setFilters({ ...filters, [chip.key]: e.target.value })
                }
              >
                {chip.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Messages */}
      {msg && (
        <motion.div
          className={`alert alert-${msg.type === "success" ? "success" : "danger"}`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {typeof msg === "object" ? msg.text : msg}
        </motion.div>
      )}

      {patientLogin && (
        <motion.div
          className="alert alert-success"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="fw-semibold mb-2">Patient Created Successfully</div>
          <div>
            Patient ID: <code>{patientLogin.patientId}</code>
          </div>
          <div>
            Password: <code>{patientLogin.password}</code>
          </div>
          <small className="text-muted">
            Please share these credentials with the patient securely.
          </small>
        </motion.div>
      )}

      {/* Patients List */}
      {loading ? (
        <div className="row g-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="col-md-6 col-lg-4">
              <GlassCard className="p-4">
                <div className="skeleton" style={{ height: "200px" }}></div>
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
            <button
              className="btn btn-primary"
              onClick={() => setShowModal(true)}
            >
              <i className="fas fa-user-plus me-2"></i>Add First Patient
            </button>
          }
        />
      ) : (
        <>
          {/* Desktop Table */}
          <div className="d-none d-md-block">
            <GlassCard className="p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Patient ID</th>
                      <th>Name</th>
                      <th>Gender</th>
                      <th>Age</th>
                      <th>Risk Level</th>
                      <th>HbA1c</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((patient) => {
                      const riskLevel = getRiskLevel(patient);
                      const age = patient.dob
                        ? new Date().getFullYear() -
                          new Date(patient.dob).getFullYear()
                        : "N/A";

                      return (
                        <tr key={patient._id}>
                          <td>
                            <code className="text-primary">
                              {patient.patientId}
                            </code>
                          </td>
                          <td className="fw-semibold">{patient.name}</td>
                          <td className="text-capitalize">{patient.gender}</td>
                          <td>{age}</td>
                          <td>
                            <span
                              className={`badge bg-${riskLevel === "high" ? "danger" : riskLevel === "medium" ? "warning" : "success"}`}
                            >
                              {riskLevel.toUpperCase()}
                            </span>
                          </td>
                          <td>
                            {patient.HbA1cLevel
                              ? `${patient.HbA1cLevel}%`
                              : "-"}
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <Link
                                className="btn btn-outline-primary"
                                to={`/doctor/patients/${patient._id}`}
                              >
                                <i className="fas fa-eye"></i>
                              </Link>
                              <Link
                                className="btn btn-outline-secondary"
                                to={`/doctor/patients/${patient._id}/add-visit`}
                              >
                                <i className="fas fa-edit"></i>
                              </Link>
                              <button
                                className="btn btn-outline-danger"
                                onClick={() => handleDeleteClick(patient)}
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </div>

          {/* Mobile Cards */}
          <div className="d-md-none row g-3">
            {filtered.map((patient) => {
              const riskLevel = getRiskLevel(patient);
              const age = patient.dob
                ? new Date().getFullYear() - new Date(patient.dob).getFullYear()
                : "N/A";

              return (
                <div key={patient._id} className="col-12">
                  <GlassCard className="p-3">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <h6 className="mb-1">{patient.name}</h6>
                        <small className="text-muted">
                          ID: {patient.patientId}
                        </small>
                      </div>
                      <span
                        className={`badge bg-${riskLevel === "high" ? "danger" : riskLevel === "medium" ? "warning" : "success"}`}
                      >
                        {riskLevel.toUpperCase()}
                      </span>
                    </div>
                    <div className="row g-2 text-center">
                      <div className="col-4">
                        <small className="text-muted d-block">Gender</small>
                        <span className="text-capitalize">
                          {patient.gender}
                        </span>
                      </div>
                      <div className="col-4">
                        <small className="text-muted d-block">Age</small>
                        <span>{age}</span>
                      </div>
                      <div className="col-4">
                        <small className="text-muted d-block">HbA1c</small>
                        <span>
                          {patient.HbA1cLevel ? `${patient.HbA1cLevel}%` : "-"}
                        </span>
                      </div>
                    </div>
                    <div className="d-flex gap-2 mt-3">
                      <Link
                        className="btn btn-primary btn-sm flex-fill"
                        to={`/doctor/patients/${patient._id}`}
                      >
                        View Details
                      </Link>
                      <Link
                        className="btn btn-outline-primary btn-sm"
                        to={`/doctor/patients/${patient._id}/add-visit`}
                      >
                        Add Visit
                      </Link>
                    </div>
                  </GlassCard>
                </div>
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
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Patient</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                />
              </div>
              <form onSubmit={createPatient}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Full Name
                      </label>
                      <input
                        className="form-control"
                        value={form.name}
                        onChange={(e) =>
                          setForm({ ...form, name: e.target.value })
                        }
                        required
                        placeholder="Enter patient's full name"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        value={form.dob}
                        onChange={(e) =>
                          setForm({ ...form, dob: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Gender</label>
                      <select
                        className="form-select"
                        value={form.gender}
                        onChange={(e) =>
                          setForm({ ...form, gender: e.target.value })
                        }
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">
                        Smoking History
                      </label>
                      <select
                        className="form-select"
                        value={form.smokingHistory}
                        onChange={(e) =>
                          setForm({ ...form, smokingHistory: e.target.value })
                        }
                      >
                        <option value="no info">No Info</option>
                        <option value="never">Never</option>
                        <option value="former">Former</option>
                        <option value="current">Current</option>
                        <option value="not current">Not Current</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">
                        Conditions
                      </label>
                      <div className="d-flex gap-3">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={form.hypertension}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                hypertension: e.target.checked,
                              })
                            }
                          />
                          <label className="form-check-label">
                            Hypertension
                          </label>
                        </div>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={form.heartDisease}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                heartDisease: e.target.checked,
                              })
                            }
                          />
                          <label className="form-check-label">
                            Heart Disease
                          </label>
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
                        onChange={(e) =>
                          setForm({ ...form, bmi: e.target.value })
                        }
                        placeholder="e.g., 24.5"
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">
                        HbA1c Level (%)
                      </label>
                      <input
                        className="form-control"
                        type="number"
                        step="0.1"
                        value={form.HbA1cLevel}
                        onChange={(e) =>
                          setForm({ ...form, HbA1cLevel: e.target.value })
                        }
                        placeholder="e.g., 7.2"
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">
                        Blood Glucose (mg/dL)
                      </label>
                      <input
                        className="form-control"
                        type="number"
                        step="1"
                        value={form.bloodGlucoseLevel}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            bloodGlucoseLevel: e.target.value,
                          })
                        }
                        placeholder="e.g., 140"
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowModal(false)}
                  >
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
