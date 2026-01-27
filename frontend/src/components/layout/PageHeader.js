import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function PageHeader({ title, subtitle, actions, breadcrumbs, showBack = false, backTo }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="page-header mb-4 mt-5" style={{ marginTop: '300px' }}>
      {showBack && (
        <button 
          className="btn btn-outline-secondary mb-3 d-flex align-items-center"
          onClick={handleBack}
        >
          <i className="fas fa-arrow-left me-2"></i>
          Back
        </button>
      )}
      
      {breadcrumbs && (
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            {breadcrumbs.map((crumb, index) => (
              <li key={index} className={`breadcrumb-item ${crumb.active ? 'active' : ''}`}>
                {crumb.active ? crumb.label : <a href={crumb.href}>{crumb.label}</a>}
              </li>
            ))}
          </ol>
        </nav>
      )}
      <div className="d-flex justify-content-between align-items-start " >
        <div>
          <h1 className="h2 mb-1">{title}</h1>
          {subtitle && <p className="text-muted mb-0">{subtitle}</p>}
        </div>
        {actions && (
          <div className="d-flex gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}