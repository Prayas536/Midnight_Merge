import React, { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';

export default function HealthJourneyAI({ patient, visits }) {
    const [loading, setLoading] = useState(false);
    const [analysisData, setAnalysisData] = useState(null);
    const [error, setError] = useState(null);

    const analyzeJourney = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.post('/ai/health-journey-analysis', {
                patient_data: {
                    name: patient?.name || 'Patient',
                    gender: patient?.gender,
                    hypertension: patient?.hypertension,
                    heartDisease: patient?.heartDisease,
                    smokingHistory: patient?.smokingHistory
                },
                all_visits: visits || []
            });

            if (res.data.success) {
                setAnalysisData(res.data.data);
            }
        } catch (e) {
            setError(e?.response?.data?.message || 'Analysis failed. Make sure the AI service is running.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const s = status?.toLowerCase() || '';
        if (s.includes('critical') || s.includes('poor') || s.includes('high')) return 'text-danger bg-danger bg-opacity-10';
        if (s.includes('warning') || s.includes('fair') || s.includes('moderate')) return 'text-warning bg-warning bg-opacity-10';
        return 'text-success bg-success bg-opacity-10';
    };

    const getStatusIcon = (status) => {
        const s = status?.toLowerCase() || '';
        if (s.includes('critical') || s.includes('poor')) return 'fas fa-exclamation-circle';
        if (s.includes('warning')) return 'fas fa-exclamation-triangle';
        return 'fas fa-check-circle';
    };

    if (!visits || visits.length === 0) {
        return (
            <div className="health-journey-card">
                <div className="health-journey-content">
                    <h5><i className="fas fa-brain me-2"></i>AI Health Journey Analysis</h5>
                    <p className="mb-0 opacity-75">
                        Add some visits with predictions to get personalized AI advice on reducing your diabetes risk.
                    </p>
                </div>
            </div>
        );
    }

    // Safely access the nested analysis object. 
    // The structure is analysisData = { analysis: { ...JSON fields... }, visits_analyzed: 5 }
    const aiContent = analysisData?.analysis;

    return (
        <motion.div
            className="health-journey-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="health-journey-content">
                <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                        <h5 className="mb-1">
                            <i className="fas fa-brain me-2"></i>AI Health Journey Analysis
                        </h5>
                        <small className="opacity-75">
                            Analyzing {visits.length} visit{visits.length !== 1 ? 's' : ''} to provide personalized advice
                        </small>
                    </div>
                    {!analysisData && (
                        <button
                            className="btn btn-light btn-sm"
                            onClick={analyzeJourney}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <i className="fas fa-spinner fa-spin me-2"></i>Analyzing...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-magic me-2"></i>Analyze My Journey
                                </>
                            )}
                        </button>
                    )}
                </div>

                {error && (
                    <div className="alert alert-danger py-2 mb-3">
                        <i className="fas fa-exclamation-circle me-2"></i>{error}
                    </div>
                )}

                {aiContent && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        {/* Handle Legacy/String Response */}
                        {typeof aiContent === 'string' ? (
                            <div className="health-journey-advice mb-3">
                                {aiContent.split('\n').map((line, i) => {
                                    // Handle headers/bold lines (surrounded by **)
                                    if (line.trim().startsWith('**') && line.trim().endsWith('**')) {
                                        return (
                                            <h6 key={i} className="mt-3 mb-2 text-warning">
                                                {line.replace(/\*\*/g, '')}
                                            </h6>
                                        );
                                    }

                                    // Handle list items
                                    if (line.trim().match(/^\d+\./)) {
                                        // Numbered list
                                        const parts = line.split('**');
                                        return (
                                            <div key={i} className="d-flex align-items-start mb-2 small">
                                                <span className="me-2 mt-1">•</span>
                                                <span>
                                                    {parts.map((part, idx) =>
                                                        idx % 2 === 1 ? <strong key={idx}>{part}</strong> : part
                                                    )}
                                                </span>
                                            </div>
                                        );
                                    }

                                    // Handle regular lines with potential bold text within
                                    if (line.trim()) {
                                        const parts = line.split('**');
                                        return (
                                            <p key={i} className="mb-2 opacity-90 small">
                                                {parts.map((part, idx) =>
                                                    idx % 2 === 1 ? <strong key={idx}>{part}</strong> : part
                                                )}
                                            </p>
                                        );
                                    }
                                    return null;
                                })}
                            </div>
                        ) : (
                            <>
                                {/* Summary Section */}
                                <div className="mb-4">
                                    <p className="lead fs-6 mb-1">"{aiContent.greeting}"</p>
                                    <p className="opacity-90">{aiContent.summary}</p>
                                </div>

                                {/* Key Takeaways Grid */}
                                {aiContent.key_takeaways && (
                                    <div className="row g-3 mb-4">
                                        {aiContent.key_takeaways.map((item, idx) => (
                                            <div key={idx} className="col-md-6 col-lg-4">
                                                <div className={`p-3 rounded-3 h-100 ${getStatusColor(item.status)} border border-0`}>
                                                    <div className="d-flex align-items-center mb-2">
                                                        <i className={`${getStatusIcon(item.status)} me-2`}></i>
                                                        <strong className="text-uppercase small">{item.title}</strong>
                                                    </div>
                                                    <p className="mb-0 small opacity-90">{item.content}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="row g-4">
                                    {/* Personalized Advice */}
                                    <div className="col-md-7">
                                        <h6 className="mb-3 border-bottom pb-2 border-white border-opacity-25">
                                            <i className="fas fa-user-md me-2"></i>Personalized Advice
                                        </h6>
                                        <div className="d-flex flex-column gap-3">
                                            {aiContent.personalized_advice?.map((advice, idx) => (
                                                <div key={idx} className="d-flex align-items-start bg-black bg-opacity-25 p-3 rounded-2">
                                                    <div className="me-3 mt-1">
                                                        <i className="fas fa-lightbulb text-warning"></i>
                                                    </div>
                                                    <div>
                                                        <div className="fw-bold small text-uppercase opacity-75 mb-1">{advice.category}</div>
                                                        <p className="mb-1 fw-semibold">{advice.action}</p>
                                                        <small className="opacity-75"><i className="fas fa-arrow-right me-1 small"></i>{advice.impact}</small>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Next Steps */}
                                    <div className="col-md-5">
                                        <h6 className="mb-3 border-bottom pb-2 border-white border-opacity-25">
                                            <i className="fas fa-list-check me-2"></i>Next Steps
                                        </h6>
                                        <ul className="list-group list-group-flush bg-transparent">
                                            {aiContent.next_steps?.map((step, idx) => (
                                                <li key={idx} className="list-group-item bg-transparent text-white px-0 d-flex">
                                                    <i className="fas fa-check text-success me-2 mt-1"></i>
                                                    <span>{step}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </>
                        )}

                        <button
                            className="btn btn-outline-light btn-sm mt-4 opacity-75"
                            onClick={() => setAnalysisData(null)}
                        >
                            <i className="fas fa-redo me-2"></i>Re-analyze
                        </button>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
