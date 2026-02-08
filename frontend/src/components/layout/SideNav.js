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
    { to: '/doctor/dashboard', icon: 'fas fa-th-large', label: 'Dashboard' },
    { to: '/doctor/patients', icon: 'fas fa-user-friends', label: 'Patients' },
    { to: '/doctor/predict', icon: 'fas fa-magic', label: 'AI Predict' },
  ] : [
    { to: '/patient/dashboard', icon: 'fas fa-th-large', label: 'Dashboard' },
    { to: '/patient/profile', icon: 'fas fa-user-circle', label: 'Profile' },
    { to: '/patient/visits', icon: 'fas fa-calendar-alt', label: 'Visits' },
    { to: '/patient/predict', icon: 'fas fa-magic', label: 'AI Predict' },
    { to: '/patient/ai-chat', icon: 'fas fa-robot', label: 'AI Assistant' }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {open && <div className="sidebar-overlay d-md-none" onClick={onClose}></div>}

      <nav className={`sidebar ${collapsed ? 'collapsed' : 'expanded'} ${open ? 'open' : ''}`}>
        {/* Logo Section - Acts as Toggle */}
        <div
          className="sidebar-logo clickable"
          onClick={onToggle}
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          <div className="logo-icon">
            <i className={`fas ${collapsed ? 'fa-heartbeat' : 'fa-heartbeat'}`}></i>
          </div>
          {(!collapsed || open) && <span className="logo-text">Diabetes PMS</span>}
        </div>

        {/* Navigation */}
        <div className="sidebar-nav">
          <ul className="nav flex-column">
            {navItems.map((item) => (
              <li key={item.to} className="nav-item">
                <NavLink
                  to={item.to}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={onClose}
                  title={collapsed && !open ? item.label : ''}
                >
                  <i className={item.icon}></i>
                  {(open || !collapsed) && <span>{item.label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom Section */}
        <div className="sidebar-footer">
          <button
            className="nav-link logout-btn"
            onClick={() => { handleLogout(); onClose(); }}
            title={collapsed && !open ? 'Logout' : ''}
          >
            <i className="fas fa-sign-out-alt"></i>
            {(open || !collapsed) && <span>Logout</span>}
          </button>
        </div>
      </nav>
    </>
  );
}