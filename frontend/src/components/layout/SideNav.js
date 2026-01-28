import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

export default function SideNav({ collapsed, open, onClose }) {
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
            {!collapsed && !open && <span>Diabetes PMS</span>}
            {open && <span>Diabetes PMS</span>}
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
                >
                  <i className={`${item.icon} ${collapsed && !open ? '' : 'me-3'}`}></i>
                  {(open || !collapsed) && <span>{item.label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
          
          {/* Logout Button */}
          <div className="sidebar-footer mt-auto">
            <button 
              className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center"
              onClick={() => { handleLogout(); onClose(); }}
              title={collapsed && !open ? 'Logout' : ''}
            >
              <i className="fas fa-sign-out-alt"></i>
              {(open || !collapsed) && <span className="ms-2">Logout</span>}
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}