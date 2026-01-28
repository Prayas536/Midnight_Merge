import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import PageHeader from "../../components/layout/PageHeader";
import StatCard from "../../components/ui/StatCard";
import GlassCard from "../../components/ui/GlassCard";
import HbA1cChart from "../../components/charts/HbA1cChart";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

export default function DoctorDashboard() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalPatients: 0,
    visitsThisMonth: 0,
    avgHbA1c: 0,
    predictionsRun: 0,
  });
  const [recentPatients, setRecentPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      loadDashboardData();
    }
  }, [authLoading]);

  const loadDashboardData = async () => {
    try {
      const [patientsRes, visitsRes] = await Promise.all([
        api.get("/patients"),
        api.get("/my/visits"), // Assuming this endpoint exists
      ]);

      const patients = patientsRes.data.data || [];
      const visits = visitsRes.data.data || [];

      // Calculate stats
      const thisMonth = new Date();
      thisMonth.setDate(1);
      const visitsThisMonth = visits.filter(v => new Date(v.date) >= thisMonth).length;

      const avgHbA1c = patients.length > 0
        ? patients.reduce((sum, p) => sum + (p.baselineMetrics?.hba1c || 0), 0) / patients.length
        : 0;

      setStats({
        totalPatients: patients.length,
        visitsThisMonth,
        avgHbA1c: avgHbA1c.toFixed(1),
        predictionsRun: visits.filter(v => v.prediction).length,
      });

      setRecentPatients(patients.slice(0, 5));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    <Link key="add-patient" to="/doctor/patients" className="btn btn-primary">
      <i className="fas fa-user-plus me-2"></i>Add Patient
    </Link>,
    <Link key="predict" to="/doctor/predict" className="btn btn-success">
      <i className="fas fa-brain me-2"></i>Run Prediction
    </Link>,
    <Link key="view-patients" to="/doctor/patients" className="btn btn-outline-primary">
      <i className="fas fa-users me-2"></i>View Patients
    </Link>,
  ];

  if (loading || authLoading) {
    return (
      <div className="container">
        <div className="skeleton" style={{ height: '400px' }}></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <PageHeader
        title={`Welcome back, ${user?.name || "Doctor"}`}
        subtitle="Monitor your patients' diabetes management"
        actions={quickActions}
      />

      {/* Stats Cards */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <StatCard
            icon="fas fa-users"
            title="Total Patients"
            value={stats.totalPatients}
            delta={12} // Mock delta
          />
        </div>
        <div className="col-md-3">
          <StatCard
            icon="fas fa-calendar-check"
            title="Visits This Month"
            value={stats.visitsThisMonth}
            delta={8}
          />
        </div>
        <div className="col-md-3">
          <StatCard
            icon="fas fa-chart-line"
            title="Avg HbA1c"
            value={`${stats.avgHbA1c}%`}
            delta={-5}
          />
        </div>
        <div className="col-md-3">
          <StatCard
            icon="fas fa-brain"
            title="Predictions Run"
            value={stats.predictionsRun}
            delta={15}
          />
        </div>
      </div>

      <div className="row g-4">
        {/* Recent Patients */}
        <div className="col-lg-4">
          <GlassCard className="p-4">
            <h5 className="mb-3">
              <i className="fas fa-users me-2"></i>Recent Patients
            </h5>
            {recentPatients.length > 0 ? (
              <div className="list-group list-group-flush">
                {recentPatients.map((patient) => (
                  <Link
                    key={patient._id}
                    to={`/doctor/patients/${patient._id}`}
                    className="list-group-item list-group-item-action d-flex justify-content-between align-items-center px-0"
                  >
                    <div>
                      <div className="fw-semibold">{patient.name}</div>
                      <small className="text-muted">ID: {patient.patientId}</small>
                    </div>
                    <i className="fas fa-chevron-right text-muted"></i>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-muted small">No patients yet</p>
            )}
            <Link to="/doctor/patients" className="btn btn-outline-primary btn-sm mt-3">
              View All Patients
            </Link>
          </GlassCard>
        </div>

        {/* Trends Chart */}
        <div className="col-lg-8">
          <GlassCard className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">
                <i className="fas fa-chart-line me-2"></i>HbA1c Trends
              </h5>
              <div className="btn-group btn-group-sm">
                <button className="btn btn-outline-primary active">HbA1c</button>
                <button className="btn btn-outline-primary">Glucose</button>
                <button className="btn btn-outline-primary">BMI</button>
              </div>
            </div>
            <HbA1cChart />
          </GlassCard>
        </div>
      </div>
    </motion.div>
  );
}
