import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

export default function SideNav({ collapsed, open, onClose, onToggle }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = user?.userType === 'doctor' ? [
    { to: '/doctor/dashboard', icon: 'fas fa-tachometer-alt', label: 'Dashboard' },
    { to: '/doctor/patients', icon: 'fas fa-users', label: 'Patients' },
    { to: '/doctor/predict', icon: 'fas fa-brain', label: 'Predict' },
  ] : [
    { to: '/patient/dashboard', icon: 'fas fa-tachometer-alt', label: 'Dashboard' },
    { to: '/patient/profile', icon: 'fas fa-user', label: 'Profile' },
    { to: '/patient/visits', icon: 'fas fa-calendar-alt', label: 'Visits' },
    { to: '/patient/predict', icon: 'fas fa-brain', label: 'Predict' },
    { to: '/patient/ai-chat', icon: 'fas fa-comments', label: 'AI Assistant' }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {open && <div className="sidebar-overlay d-md-none" onClick={onClose}></div>}

      <nav className={`sidebar ${collapsed ? 'collapsed' : 'expanded'} ${open ? 'expanded' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <i className="fas fa-stethoscope"></i>
            {(!collapsed || open) && <span className="ms-2">Diabetes PMS</span>}
          </div>
        </div>
        <div className="sidebar-content">
          <ul className="nav flex-column">
            {navItems.map((item) => (
              <li key={item.to} className="nav-item">
                <NavLink
                  to={item.to}
                  className={({ isActive }) => `nav-link d-flex align-items-center ${isActive ? 'active' : ''}`}
                  onClick={onClose}
                  data-tooltip={item.label}
                  title={collapsed && !open ? item.label : ''}
                >
                  <i className={`${item.icon} ${collapsed && !open ? '' : 'me-3'}`}></i>
                  {(open || !collapsed) && <span>{item.label}</span>}
                </NavLink>
              </li>
            ))}

            {/* Logout button */}
            <li className="nav-item mt-auto">
              <button
                className="nav-link d-flex align-items-center text-danger border-0 bg-transparent w-100"
                onClick={() => { handleLogout(); onClose(); }}
                title={collapsed && !open ? 'Logout' : ''}
                data-tooltip="Logout"
              >
                <i className={`fas fa-sign-out-alt ${collapsed && !open ? '' : 'me-3'}`}></i>
                {(open || !collapsed) && <span>Logout</span>}
              </button>
            </li>
          </ul>
        </div>

        {/* Toggle Button - only show on desktop */}
        <button
          className="sidebar-toggle-btn d-none d-md-flex"
          onClick={onToggle}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <i className={`fas fa-chevron-${collapsed ? 'right' : 'left'}`}></i>
        </button>
      </nav>
    </>
  );
}