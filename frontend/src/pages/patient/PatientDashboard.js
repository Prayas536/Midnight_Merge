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
    <Link key="predict" to="/patient/predict" className="btn btn-success">
      <i className="fas fa-brain me-2"></i>Check My Risk
    </Link>,
    <Link key="visits" to="/patient/visits" className="btn btn-outline-primary">
      <i className="fas fa-calendar-alt me-2"></i>View Visits
    </Link>,
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <PageHeader
        title={`Welcome back, ${profile?.name || 'Patient'}`}
        subtitle="Here's your diabetes management overview"
        actions={quickActions}
      />

      {/* Current Metrics Cards */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <StatCard
            icon="fas fa-tint"
            title="HbA1c"
            value={`${currentMetrics.hba1c || 'N/A'}%`}
            delta={currentMetrics.hba1c ? -0.3 : null}
          />
        </div>
        <div className="col-md-3">
          <StatCard
            icon="fas fa-weight"
            title="BMI"
            value={currentMetrics.bmi || 'N/A'}
            delta={currentMetrics.bmi ? 0.2 : null}
          />
        </div>
        <div className="col-md-3">
          <StatCard
            icon="fas fa-heartbeat"
            title="Blood Glucose"
            value={`${currentMetrics.bloodGlucose || 'N/A'} mg/dL`}
            delta={currentMetrics.bloodGlucose ? -5 : null}
          />
        </div>
        <div className="col-md-3">
          <StatCard
            icon="fas fa-calendar-check"
            title="Total Visits"
            value={visits.length}
            delta={1}
          />
        </div>
      </div>

      <div className="row g-4">
        {/* Last Visit Summary */}
        <div className="col-lg-4">
          <GlassCard className="p-4">
            <h5 className="mb-3">
              <i className="fas fa-calendar-alt me-2"></i>Last Visit Summary
            </h5>
            {latestVisit ? (
              <div>
                <div className="mb-3">
                  <small className="text-muted">Date</small>
                  <div className="fw-semibold">{new Date(latestVisit.date).toLocaleDateString()}</div>
                </div>
                <div className="mb-3">
                  <small className="text-muted">Doctor's Notes</small>
                  <p className="small mb-0">{latestVisit.notes || 'No notes available'}</p>
                </div>
                <div className="mb-3">
                  <small className="text-muted">Recommendations</small>
                  <p className="small mb-0">{latestVisit.recommendations || 'No recommendations'}</p>
                </div>
                <Link to="/patient/visits" className="btn btn-outline-primary btn-sm">
                  View All Visits
                </Link>
              </div>
            ) : (
              <div className="text-center py-4">
                <i className="fas fa-calendar-times fs-2 text-muted mb-3"></i>
                <p className="text-muted mb-3">No visits recorded yet</p>
                <p className="small text-muted">Schedule your first appointment with your doctor</p>
              </div>
            )}
          </GlassCard>
        </div>

        {/* Personal Trend Chart */}
        <div className="col-lg-8">
          <GlassCard className="p-4">
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
                  labels: visits.slice().reverse().map(v => new Date(v.date).toLocaleDateString()),
                  values: visits.slice().reverse().map(v => v.metrics?.hba1c || 0)
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
