import React from 'react';
import GlassCard from './GlassCard';

export default function StatCard({ icon, title, value, delta, className = '' }) {
  return (
    <GlassCard className={`p-4 ${className}`}>
      <div className="d-flex align-items-center justify-content-between">
        <div>
          <div className="text-muted small">{title}</div>
          <div className="h4 mb-0 fw-bold">{value}</div>
          {delta && (
            <div className={`small ${delta > 0 ? 'text-success' : delta < 0 ? 'text-danger' : 'text-muted'}`}>
              <i className={`fas fa-arrow-${delta > 0 ? 'up' : delta < 0 ? 'down' : 'right'}`}></i>
              {Math.abs(delta)}%
            </div>
          )}
        </div>
        <div className="text-primary fs-2">
          <i className={icon}></i>
        </div>
      </div>
    </GlassCard>
  );
}