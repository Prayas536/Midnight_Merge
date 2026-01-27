import React from 'react';
import GlassCard from './GlassCard';

export default function EmptyState({ icon, title, description, action }) {
  return (
    <GlassCard className="p-5 text-center">
      <div className="mb-4">
        <i className={`${icon} fs-1 text-muted`}></i>
      </div>
      <h5 className="mb-3">{title}</h5>
      <p className="text-muted mb-4">{description}</p>
      {action}
    </GlassCard>
  );
}