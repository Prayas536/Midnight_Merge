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
    deltas: {
      patients: 0,
      visits: 0,
      hba1c: 0,
      predictions: 0
    }
  });
  const [recentPatients, setRecentPatients] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [chartType, setChartType] = useState('HbA1c');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      loadDashboardData();
    }
  }, [authLoading]);

  const loadDashboardData = async () => {
    try {
      const [statsRes, patientsRes, trendsRes] = await Promise.all([
        api.get("/dashboard/stats"),
        api.get("/patients"),
        api.get("/dashboard/trends?months=6")
      ]);

      const dashboardStats = statsRes.data.data;
      const patients = patientsRes.data.data || [];
      const trends = trendsRes.data.data || [];

      setStats({
        totalPatients: dashboardStats.totalPatients,
        visitsThisMonth: dashboardStats.visitsThisMonth,
        avgHbA1c: dashboardStats.avgHbA1c,
        predictionsRun: dashboardStats.predictionsRun,
        deltas: dashboardStats.deltas
      });

      setRecentPatients(patients.slice(0, 5));

      // Prepare chart data
      if (trends.length > 0) {
        setChartData({
          labels: trends.map(t => t.month),
          datasets: {
            HbA1c: trends.map(t => t.avgHbA1c),
            Glucose: trends.map(t => t.avgGlucose),
            BMI: trends.map(t => t.avgBmi)
          }
        });
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Fallback to empty data
      setStats({
        totalPatients: 0,
        visitsThisMonth: 0,
        avgHbA1c: 0,
        predictionsRun: 0,
        deltas: { patients: 0, visits: 0, hba1c: 0, predictions: 0 }
      });
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

  const getCurrentChartData = () => {
    if (!chartData) return null;
    return {
      labels: chartData.labels,
      values: chartData.datasets[chartType]
    };
  };

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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <StatCard
              icon="fas fa-users"
              title="Total Patients"
              value={stats.totalPatients}
              delta={stats.deltas.patients}
            />
          </motion.div>
        </div>
        <div className="col-md-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <StatCard
              icon="fas fa-calendar-check"
              title="Visits This Month"
              value={stats.visitsThisMonth}
              delta={stats.deltas.visits}
            />
          </motion.div>
        </div>
        <div className="col-md-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <StatCard
              icon="fas fa-chart-line"
              title="Avg HbA1c"
              value={`${stats.avgHbA1c}%`}
              delta={stats.deltas.hba1c}
            />
          </motion.div>
        </div>
        <div className="col-md-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <StatCard
              icon="fas fa-brain"
              title="Predictions Run"
              value={stats.predictionsRun}
              delta={stats.deltas.predictions}
            />
          </motion.div>
        </div>
      </div>

      <div className="row g-4">
        {/* Recent Patients */}
        <div className="col-lg-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <GlassCard className="p-4">
              <h5 className="mb-3">
                <i className="fas fa-users me-2"></i>Recent Patients
              </h5>
              {recentPatients.length > 0 ? (
                <div className="list-group list-group-flush">
                  {recentPatients.map((patient, index) => (
                    <motion.div
                      key={patient._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                    >
                      <Link
                        to={`/doctor/patients/${patient._id}`}
                        className="list-group-item list-group-item-action d-flex justify-content-between align-items-center px-0"
                      >
                        <div>
                          <div className="fw-semibold">{patient.name}</div>
                          <small className="text-muted">ID: {patient.patientId}</small>
                        </div>
                        <i className="fas fa-chevron-right text-muted"></i>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-muted small">No patients yet</p>
              )}
              <Link to="/doctor/patients" className="btn btn-outline-primary btn-sm mt-3">
                View All Patients
              </Link>
            </GlassCard>
          </motion.div>
        </div>

        {/* Trends Chart */}
        <div className="col-lg-8">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <GlassCard className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">
                  <i className="fas fa-chart-line me-2"></i>{chartType} Trends
                </h5>
                <div className="btn-group btn-group-sm">
                  {['HbA1c', 'Glucose', 'BMI'].map(type => (
                    <button
                      key={type}
                      className={`btn btn-outline-primary ${chartType === type ? 'active' : ''}`}
                      onClick={() => setChartType(type)}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              {chartData && getCurrentChartData() ? (
                <HbA1cChart data={getCurrentChartData()} />
              ) : (
                <div className="text-center py-5">
                  <i className="fas fa-chart-line fs-1 text-muted mb-3"></i>
                  <p className="text-muted">Add visits with metrics to see trends</p>
                </div>
              )}
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
