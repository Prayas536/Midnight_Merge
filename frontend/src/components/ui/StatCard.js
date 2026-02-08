import React from 'react';

export default function StatCard({ icon, title, value, delta, variant = 'default', className = '' }) {
  // Gradient colors for different variants
  const variants = {
    default: { gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', glow: 'rgba(102, 126, 234, 0.3)' },
    success: { gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', glow: 'rgba(17, 153, 142, 0.3)' },
    warning: { gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', glow: 'rgba(245, 87, 108, 0.3)' },
    info: { gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', glow: 'rgba(79, 172, 254, 0.3)' },
  };

  const { gradient, glow } = variants[variant] || variants.default;

  return (
    <div className={`stat-card-premium ${className}`}>
      {/* Background glow effect */}
      <div className="stat-card-glow" style={{ background: glow }}></div>

      <div className="stat-card-content">
        {/* Icon with gradient background */}
        <div className="stat-icon-wrapper" style={{ background: gradient }}>
          <i className={icon}></i>
        </div>

        {/* Stats content */}
        <div className="stat-details">
          <span className="stat-title">{title}</span>
          <div className="stat-value-row">
            <span className="stat-value">{value}</span>
            {delta !== undefined && delta !== null && (
              <span className={`stat-delta ${delta > 0 ? 'positive' : delta < 0 ? 'negative' : 'neutral'}`}>
                <i className={`fas fa-arrow-${delta > 0 ? 'up' : delta < 0 ? 'down' : 'right'} me-1`}></i>
                {Math.abs(delta)}%
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="stat-card-decoration">
        <div className="decoration-circle" style={{ background: gradient }}></div>
      </div>
    </div>
  );
}