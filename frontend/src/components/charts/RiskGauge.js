import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function RiskGauge({ riskScore, riskLabel }) {
  const score = riskScore || 0;
  const percentage = Math.min(Math.max(score * 100, 0), 100);

  const data = {
    datasets: [{
      data: [percentage, 100 - percentage],
      backgroundColor: [
        percentage > 70 ? '#EF4444' : percentage > 40 ? '#F59E0B' : '#10B981',
        'rgba(148, 163, 184, 0.2)'
      ],
      borderWidth: 0,
      cutout: '70%',
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
  };

  return (
    <div className="text-center">
      <div style={{ width: '100%', maxWidth: '200px', margin: '0 auto', paddingBottom: '100%', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Doughnut data={data} options={options} />
        </div>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', zIndex: 10 }}>
          <div className="fs-2 fw-bold">{percentage.toFixed(0)}%</div>
          <div className="text-muted small">Risk Score</div>
        </div>
      </div>
      <div className="mt-3">
        <span className={`badge fs-6 px-3 py-2 ${
          riskLabel === 'High' ? 'bg-danger' :
          riskLabel === 'Medium' ? 'bg-warning text-dark' : 'bg-success'
        }`}>
          {riskLabel || 'Unknown'} Risk
        </span>
      </div>
    </div>
  );
}