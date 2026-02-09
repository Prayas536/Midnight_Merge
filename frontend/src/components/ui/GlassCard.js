import React from 'react';

export default function GlassCard({ children, className = '', variant = 'default', hover = true, ...props }) {
  const cardClasses = [
    'glass-card',
    variant !== 'default' && `glass-card-${variant}`,
    hover && 'glass-card-hover',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClasses} {...props}>
      <div className="glass-card-shine"></div>
      {children}
    </div>
  );
}