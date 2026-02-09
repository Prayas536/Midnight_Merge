import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function AppNavbar({ onMenuClick, sidebarCollapsed }) {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isPublic = !user;

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <nav className="navbar fixed-top px-4 py-2" style={{
      zIndex: 1000,
      background: theme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(26, 32, 44, 0.9)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid ' + (theme === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)')
    }}>
      <div className="container-fluid p-0 d-flex justify-content-between align-items-center">

        {/* Left Side: Brand & Mobile Toggle */}
        <div className="d-flex align-items-center gap-3">
          {!isPublic && (
            <button
              className="btn btn-link text-body p-0 d-md-none"
              onClick={onMenuClick}
            >
              <i className="fas fa-bars fs-5"></i>
            </button>
          )}

          <Link
            className="navbar-brand d-flex align-items-center gap-2 text-decoration-none"
            to={user ? (user.userType === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard') : '/login'}
          >
            <i className="fas fa-heartbeat fa-lg text-primary"></i>
            <span className={`fw-bold h5 mb-0 ${theme === 'light' ? 'text-dark' : 'text-light'}`}>DiabetesPMS</span>
          </Link>
        </div>

        {/* Right Side: Theme & User */}
        <div className="d-flex align-items-center gap-4">
          {/* Theme Toggle */}
          <motion.button
            onClick={toggleTheme}
            whileHover={{ scale: 1.1, rotate: 15 }}
            whileTap={{ scale: 0.9, rotate: -15 }}
            className="btn btn-link nav-link p-0 text-body transition-transform"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            style={{ fontSize: '1.2rem' }}
          >
            {theme === 'light' ? (
              <i className="fas fa-moon"></i>
            ) : (
              <i className="fas fa-sun text-warning"></i>
            )}
          </motion.button>

          {/* User User Profile */}
          {user ? (
            <div className="position-relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                onBlur={() => setTimeout(() => setDropdownOpen(false), 200)}
                className="btn btn-link text-decoration-none p-0 d-flex align-items-center gap-2 border-0"
              >
                <div className="d-none d-sm-block text-end">
                  <div className={`fw-semibold small ${theme === 'light' ? 'text-dark' : 'text-light'}`}>{user.name}</div>
                </div>
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"
                  style={{
                    width: '38px',
                    height: '38px',
                    fontSize: '1.1rem',
                    background: user.userType === 'doctor'
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
                  }}
                >
                  <i className="fas fa-user"></i>
                </div>
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="position-absolute end-0 mt-2 rounded-3 shadow-sm border overflow-hidden"
                    style={{
                      width: '200px',
                      background: theme === 'light' ? '#fff' : '#2d3748',
                      borderColor: theme === 'light' ? '#e2e8f0' : '#4a5568',
                      zIndex: 1050
                    }}
                  >
                    <div className="py-1">
                      <Link
                        to={user.userType === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard'}
                        className={`d-block px-4 py-2 text-decoration-none small ${theme === 'light' ? 'text-dark hover-bg-light' : 'text-light hover-bg-dark-light'}`}
                      >
                        Dashboard
                      </Link>
                      <Link
                        to={user.userType === 'doctor' ? '/doctor/patients' : '/patient/profile'}
                        className={`d-block px-4 py-2 text-decoration-none small ${theme === 'light' ? 'text-dark hover-bg-light' : 'text-light hover-bg-dark-light'}`}
                      >
                        {user.userType === 'doctor' ? 'My Patients' : 'My Profile'}
                      </Link>
                      <div className="border-top my-1 opacity-25"></div>
                      <button
                        onClick={handleLogout}
                        className="d-block w-100 text-start px-4 py-2 border-0 bg-transparent text-danger small"
                      >
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm px-4 rounded-pill">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}