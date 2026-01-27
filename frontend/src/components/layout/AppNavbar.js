import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';

export default function AppNavbar({ onMenuClick, sidebarCollapsed }) {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isPublic = !user;

  return (
    <nav className="navbar navbar-expand-lg fixed-top">
      <div className="container-fluid">
        {/* Brand */}
        <Link className="navbar-brand d-flex align-items-center" to={user ? (user.userType === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard') : '/login'}>
          <i className="fas fa-stethoscope me-2 dog"></i>
          <span className="fw-bold dog">Diabetes PMS</span>
        </Link>

        {/* Mobile Menu Toggle */}
        {!isPublic && (
          <button className="btn btn-link d-md-none me-2" onClick={onMenuClick}>
            <i className="fas fa-bars"></i>
          </button>
        )}

        {/* Desktop Sidebar Toggle */}
        {!isPublic && (
          <button className="btn btn-link d-none d-md-block me-2" onClick={onMenuClick}>
            <i className={`fas ${sidebarCollapsed ? 'fa-angle-right' : 'fa-angle-left'}`}></i>
          </button>
        )}

        {/* Right Side */}
        <div className="d-flex align-items-center">
          {/* Theme Toggle */}
          <button className="btn btn-link me-2" onClick={toggleTheme} title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}>
            <i className={`fas ${theme === 'light' ? 'fa-moon' : 'fa-sun'}`}></i>
          </button>

          {/* User Menu */}
          {user && (
            <div className="dropdown">
              <button className="btn btn-link dropdown-toggle d-flex align-items-center" type="button" data-bs-toggle="dropdown">
                <i className="fas fa-user-circle me-2"></i>
                <span className="d-none d-sm-inline">{user.name || user.email}</span>
                <span className="badge bg-primary ms-2">{user.userType}</span>
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li><Link className="dropdown-item" to={user.userType === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard'}><i className="fas fa-tachometer-alt me-2"></i>Dashboard</Link></li>
                <li><Link className="dropdown-item" to={user.userType === 'doctor' ? '/doctor/patients' : '/patient/profile'}><i className="fas fa-user me-2"></i>{user.userType === 'doctor' ? 'Patients' : 'Profile'}</Link></li>
                <li><hr className="dropdown-divider" /></li>
                <li><button className="dropdown-item" onClick={handleLogout}><i className="fas fa-sign-out-alt me-2"></i>Logout</button></li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}