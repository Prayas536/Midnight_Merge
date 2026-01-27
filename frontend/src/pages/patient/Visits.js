import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/axios";
import PageHeader from "../../components/layout/PageHeader";
import GlassCard from "../../components/ui/GlassCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import HbA1cChart from "../../components/charts/HbA1cChart";

export default function PatientVisits() {
  const [visits, setVisits] = useState(null);
  const [expandedVisit, setExpandedVisit] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVisits();
  }, []);

  const loadVisits = async () => {
    try {
      const res = await api.get("/my/visits");
      setVisits(res.data.data);
    } catch (error) {
      console.error('Error loading visits:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = useMemo(() => {
    if (!visits) return null;
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
        }
      ]
    };
  }, [visits]);

  const toggleExpanded = (visitId) => {
    setExpandedVisit(expandedVisit === visitId ? null : visitId);
  };

  const getRiskBadge = (riskLabel) => {
    const colors = {
      'High': 'danger',
      'Medium': 'warning',
      'Low': 'success'
    };
    return colors[riskLabel] || 'secondary';
  };

  if (loading) return <LoadingSpinner />;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <PageHeader
        title="My Health Journey"
        subtitle="Track your progress through doctor visits and health metrics"
      />

      {/* Health Trends Chart */}
      {visits && visits.length > 0 && (
        <GlassCard className="p-4 mb-4">
          <h5 className="mb-4">
            <i className="fas fa-chart-line me-2"></i>Health Trends Over Time
          </h5>
          <div style={{ height: '300px' }}>
            <HbA1cChart data={chartData} />
          </div>
        </GlassCard>
      )}

      {/* Visit Timeline */}
      <div className="timeline-container">
        {visits && visits.length === 0 ? (
          <GlassCard className="p-5 text-center">
            <div className="mb-4">
              <i className="fas fa-calendar-plus fs-1 text-muted"></i>
            </div>
            <h5 className="text-muted">No Visits Yet</h5>
            <p className="text-muted mb-0">Your health journey starts with your first doctor visit</p>
          </GlassCard>
        ) : (
          <div className="timeline">
            {visits?.sort((a, b) => new Date(b.visitDate) - new Date(a.visitDate)).map((visit, index) => (
              <motion.div
                key={visit._id}
                className="timeline-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="timeline-marker">
                  <i className="fas fa-stethoscope"></i>
                </div>
                <GlassCard className="timeline-content">
                  <div
                    className="d-flex justify-content-between align-items-start cursor-pointer"
                    onClick={() => toggleExpanded(visit._id)}
                  >
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center mb-2">
                        <h6 className="mb-0 me-3">
                          <i className="fas fa-calendar me-2 text-primary"></i>
                          {new Date(visit.visitDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </h6>
                        {visit.prediction?.riskLabel && (
                          <span className={`badge bg-${getRiskBadge(visit.prediction.riskLabel)}`}>
                            {visit.prediction.riskLabel} Risk
                          </span>
                        )}
                      </div>
                      <div className="metrics-summary">
                        {visit.metrics?.HbA1cLevel && (
                          <span className="metric-badge">
                            HbA1c: {visit.metrics.HbA1cLevel}%
                          </span>
                        )}
                        {visit.metrics?.bloodGlucoseLevel && (
                          <span className="metric-badge">
                            Glucose: {visit.metrics.bloodGlucoseLevel} mg/dL
                          </span>
                        )}
                        {visit.metrics?.bmi && (
                          <span className="metric-badge">
                            BMI: {visit.metrics.bmi}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="timeline-toggle">
                      <motion.i
                        className="fas fa-chevron-down"
                        animate={{ rotate: expandedVisit === visit._id ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      ></motion.i>
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedVisit === visit._id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="visit-details mt-3 pt-3 border-top"
                      >
                        <div className="row g-3">
                          <div className="col-md-6">
                            <h6 className="text-muted mb-2">
                              <i className="fas fa-vial me-2"></i>Health Metrics
                            </h6>
                            <div className="metrics-grid">
                              {visit.metrics?.HbA1cLevel && (
                                <div className="metric-item">
                                  <span className="label">HbA1c Level</span>
                                  <span className="value">{visit.metrics.HbA1cLevel}%</span>
                                </div>
                              )}
                              {visit.metrics?.bloodGlucoseLevel && (
                                <div className="metric-item">
                                  <span className="label">Blood Glucose</span>
                                  <span className="value">{visit.metrics.bloodGlucoseLevel} mg/dL</span>
                                </div>
                              )}
                              {visit.metrics?.bmi && (
                                <div className="metric-item">
                                  <span className="label">BMI</span>
                                  <span className="value">{visit.metrics.bmi}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="col-md-6">
                            <h6 className="text-muted mb-2">
                              <i className="fas fa-user-md me-2"></i>Doctor's Assessment
                            </h6>
                            {visit.prediction && (
                              <div className="mb-3">
                                <div className="d-flex align-items-center mb-2">
                                  <span className="text-muted me-2">Risk Assessment:</span>
                                  <span className={`badge bg-${getRiskBadge(visit.prediction.riskLabel)}`}>
                                    {visit.prediction.riskLabel}
                                  </span>
                                </div>
                                {visit.prediction.riskScore && (
                                  <div className="small text-muted">
                                    Risk Score: {visit.prediction.riskScore.toFixed(2)}
                                  </div>
                                )}
                              </div>
                            )}

                            {visit.notes && (
                              <div className="mb-3">
                                <div className="text-muted small mb-1">Notes:</div>
                                <p className="mb-0 small">{visit.notes}</p>
                              </div>
                            )}

                            {visit.recommendations && (
                              <div>
                                <div className="text-muted small mb-1">Recommendations:</div>
                                <p className="mb-0 small">{visit.recommendations}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
