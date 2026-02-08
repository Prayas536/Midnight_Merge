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
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1
          }
        }
      }}
      className="dashboard-container"
    >
      {/* Welcome Section */}
      <motion.div
        className="dashboard-welcome"
        variants={{
          hidden: { y: -20, opacity: 0 },
          visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
        }}
      >
        <div className="row align-items-center">
          <div className="col-md-8">
            <h1 className="welcome-title">Welcome back, {user?.name || "Doctor"}</h1>
            <p className="welcome-subtitle mb-0">
              Here's what's happening with your patients today. You have {recentPatients.length} new updates.
            </p>
          </div>
          <div className="col-md-4 text-md-end mt-3 mt-md-0">
            <div className="d-flex gap-2 justify-content-md-end">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/doctor/patients" className="btn action-btn action-btn-primary">
                  <i className="fas fa-user-plus"></i> Add Patient
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/doctor/predict" className="btn action-btn action-btn-success">
                  <i className="fas fa-brain"></i> Prediction
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <motion.div
            variants={{
              hidden: { y: 20, opacity: 0 },
              visible: { y: 0, opacity: 1 }
            }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <StatCard
              icon="fas fa-users"
              title="Total Patients"
              value={stats.totalPatients}
              delta={stats.deltas.patients}
              variant="default"
            />
          </motion.div>
        </div>
        <div className="col-md-3">
          <motion.div
            variants={{
              hidden: { y: 20, opacity: 0 },
              visible: { y: 0, opacity: 1 }
            }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <StatCard
              icon="fas fa-calendar-check"
              title="Visits This Month"
              value={stats.visitsThisMonth}
              delta={stats.deltas.visits}
              variant="success"
            />
          </motion.div>
        </div>
        <div className="col-md-3">
          <motion.div
            variants={{
              hidden: { y: 20, opacity: 0 },
              visible: { y: 0, opacity: 1 }
            }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <StatCard
              icon="fas fa-chart-line"
              title="Avg HbA1c"
              value={`${stats.avgHbA1c}%`}
              delta={stats.deltas.hba1c}
              variant="warning"
            />
          </motion.div>
        </div>
        <div className="col-md-3">
          <motion.div
            variants={{
              hidden: { y: 20, opacity: 0 },
              visible: { y: 0, opacity: 1 }
            }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <StatCard
              icon="fas fa-brain"
              title="Predictions Run"
              value={stats.predictionsRun}
              delta={stats.deltas.predictions}
              variant="info"
            />
          </motion.div>
        </div>
      </div>

      <div className="row g-4">
        {/* Recent Patients List */}
        <div className="col-lg-4">
          <motion.div
            variants={{
              hidden: { opacity: 0, x: -20 },
              visible: { opacity: 1, x: 0, transition: { delay: 0.4 } }
            }}
            className="h-100"
          >
            <GlassCard className="h-100 p-0 overflow-hidden">
              <div className="p-4 border-bottom border-light">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 fw-bold">Recent Patients</h5>
                  <Link to="/doctor/patients" className="btn btn-sm btn-link text-decoration-none">
                    View All
                  </Link>
                </div>
              </div>

              <div className="p-3">
                {recentPatients.length > 0 ? (
                  <div className="d-flex flex-column gap-2">
                    {recentPatients.map((patient, index) => (
                      <motion.div
                        key={patient._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        whileHover={{ x: 5, backgroundColor: "rgba(0,0,0,0.02)" }}
                        className="rounded-3 transition-colors"
                      >
                        <Link to={`/doctor/patients/${patient._id}`} className="text-decoration-none">
                          <div className="patient-list-item">
                            <div className="patient-avatar">
                              {patient.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="patient-info">
                              <h6>{patient.name}</h6>
                              <small>ID: {patient.patientId}</small>
                            </div>
                            <div className="patient-arrow">
                              <i className="fas fa-chevron-right"></i>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <p className="text-muted">No recent patients</p>
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Trends Chart */}
        <div className="col-lg-8">
          <motion.div
            variants={{
              hidden: { opacity: 0, x: 20 },
              visible: { opacity: 1, x: 0, transition: { delay: 0.5 } }
            }}
            className="h-100"
          >
            <GlassCard className="h-100 p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h5 className="mb-1 fw-bold">Health Trends</h5>
                  <p className="text-muted small mb-0">Overview of patient health metrics</p>
                </div>

                <div className="chart-header-controls">
                  {['HbA1c', 'Glucose', 'BMI'].map(type => (
                    <button
                      key={type}
                      className={`chart-control-btn ${chartType === type ? 'active' : ''}`}
                      onClick={() => setChartType(type)}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ minHeight: '300px' }}>
                {chartData && getCurrentChartData() ? (
                  <HbA1cChart data={getCurrentChartData()} />
                ) : (
                  <div className="d-flex flex-column align-items-center justify-content-center h-100 py-5 text-muted">
                    <i className="fas fa-chart-area fs-1 mb-3 opacity-25"></i>
                    <p>No enough data to display trends</p>
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
