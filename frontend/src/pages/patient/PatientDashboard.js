import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import PageHeader from "../../components/layout/PageHeader";
import GlassCard from "../../components/ui/GlassCard";
import StatCard from "../../components/ui/StatCard";
import HbA1cChart from "../../components/charts/HbA1cChart";

export default function PatientDashboard() {
  const [profile, setProfile] = useState(null);
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [profileRes, visitsRes] = await Promise.all([
        api.get("/my/profile"),
        api.get("/my/visits")
      ]);

      setProfile(profileRes.data.data);
      setVisits(visitsRes.data.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="skeleton" style={{ height: '400px' }}></div>
      </div>
    );
  }

  const latestVisit = visits.length > 0 ? visits[0] : null;
  const currentMetrics = latestVisit?.metrics || {};

  const quickActions = [
    <Link key="predict" to="/patient/predict" className="btn btn-success bg-gradient shadow-sm rounded-pill px-4 me-2">
      <i className="fas fa-brain me-2"></i>Check My Risk
    </Link>,
    <Link key="visits" to="/patient/visits" className="btn btn-white border shadow-sm rounded-pill px-4">
      <i className="fas fa-calendar-alt me-2 text-primary"></i>View Visits
    </Link>,
  ];

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
    >
      <PageHeader
        title={`Welcome back, ${profile?.name || 'Patient'}`}
        subtitle="Here's your diabetes management overview"
        actions={quickActions}
      />

      {/* Current Metrics Cards */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }} whileHover={{ y: -5 }}>
            <StatCard
              icon="fas fa-tint"
              title="HbA1c"
              value={`${currentMetrics.HbA1cLevel || 'N/A'}%`}
              delta={currentMetrics.HbA1cLevel ? -0.3 : null}
            />
          </motion.div>
        </div>
        <div className="col-md-3">
          <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }} whileHover={{ y: -5 }}>
            <StatCard
              icon="fas fa-weight"
              title="BMI"
              value={currentMetrics.bmi || 'N/A'}
              delta={currentMetrics.bmi ? 0.2 : null}
            />
          </motion.div>
        </div>
        <div className="col-md-3">
          <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }} whileHover={{ y: -5 }}>
            <StatCard
              icon="fas fa-heartbeat"
              title="Blood Glucose"
              value={`${currentMetrics.bloodGlucoseLevel || 'N/A'} mg/dL`}
              delta={currentMetrics.bloodGlucoseLevel ? -5 : null}
            />
          </motion.div>
        </div>
        <div className="col-md-3">
          <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }} whileHover={{ y: -5 }}>
            <StatCard
              icon="fas fa-calendar-check"
              title="Total Visits"
              value={visits.length}
              delta={1}
            />
          </motion.div>
        </div>
      </div>

      <div className="row g-4">
        {/* Last Visit Summary */}
        <div className="col-lg-4">
          <motion.div variants={{ hidden: { x: -20, opacity: 0 }, visible: { x: 0, opacity: 1 } }} className="h-100">
            <GlassCard className="p-0 overflow-hidden h-100">
              <div className="p-4 border-bottom bg-light bg-opacity-25">
                <h5 className="mb-0 fw-bold d-flex align-items-center">
                  <i className="fas fa-history me-2 text-primary"></i>Last Visit
                </h5>
              </div>

              <div className="p-4">
                {latestVisit ? (
                  <div>
                    <div className="d-flex align-items-center mb-4">
                      <div className="bg-primary bg-opacity-10 text-primary rounded-circle p-3 me-3">
                        <i className="fas fa-user-md fs-4"></i>
                      </div>
                      <div>
                        <h6 className="fw-bold mb-0">Dr. Sarah Johnson</h6>
                        <small className="text-muted">{new Date(latestVisit.visitDate).toLocaleDateString(undefined, {
                          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                        })}</small>
                      </div>
                    </div>

                    <div className="mb-4">
                      <small className="text-uppercase text-muted fw-bold d-block mb-2" style={{ fontSize: '0.7rem' }}>Doctor's Notes</small>
                      <div className="bg-light bg-opacity-50 p-3 rounded-3 border">
                        <p className="small mb-0 text-dark fst-italic">"{latestVisit.notes || 'No notes available'}"</p>
                      </div>
                    </div>

                    {latestVisit.recommendations && (
                      <div className="mb-4">
                        <small className="text-uppercase text-muted fw-bold d-block mb-2" style={{ fontSize: '0.7rem' }}>Key Recommendation</small>
                        <div className="d-flex align-items-start">
                          <i className="fas fa-check-circle text-success me-2 mt-1"></i>
                          <p className="small mb-0">{latestVisit.recommendations}</p>
                        </div>
                      </div>
                    )}

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Link to="/patient/visits" className="btn btn-primary bg-gradient w-100 rounded-pill shadow-sm">
                        View Full History
                      </Link>
                    </motion.div>
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <div className="mb-3">
                      <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                        <i className="fas fa-calendar-plus fs-3 text-muted opacity-50"></i>
                      </div>
                    </div>
                    <h6 className="text-dark fw-bold">No Visits Yet</h6>
                    <p className="text-muted small mb-0">Schedule your first appointment.</p>
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Personal Trend Chart */}
        <div className="col-lg-8">
          <motion.div variants={{ hidden: { x: 20, opacity: 0 }, visible: { x: 0, opacity: 1 } }} className="h-100">
            <GlassCard className="p-4 h-100">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">
                  <i className="fas fa-chart-line me-2"></i>Your HbA1c Trend
                </h5>
                <Link to="/patient/visits" className="btn btn-outline-primary btn-sm">
                  View Details
                </Link>
              </div>
              {visits.length > 1 ? (
                <HbA1cChart
                  data={{
                    labels: visits.slice().reverse().map(v => new Date(v.visitDate).toLocaleDateString()),
                    values: visits.slice().reverse().map(v => v.metrics?.HbA1cLevel || 0)
                  }}
                />
              ) : (
                <div className="text-center py-5">
                  <i className="fas fa-chart-line fs-2 text-muted mb-3"></i>
                  <p className="text-muted">More data needed for trends</p>
                  <small className="text-muted">Complete additional visits to see your progress</small>
                </div>
              )}
            </GlassCard>
          </motion.div>
        </div>
      </div>

      {/* Recommendations Highlight */}
      {latestVisit?.recommendations && (
        <motion.div
          className="mt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard className="p-4 border-success">
            <div className="d-flex align-items-start">
              <i className="fas fa-lightbulb text-success fs-3 me-3 mt-1"></i>
              <div className="flex-grow-1">
                <h6 className="fw-semibold text-success mb-2">Latest Recommendations</h6>
                <p className="mb-0">{latestVisit.recommendations}</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </motion.div>
  );
}
