import React, { useContext, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import AppNavbar from './AppNavbar';
import SideNav from './SideNav';
import ProtectedRoute from '../ProtectedRoute';

import LandingPage from '../../pages/public/LandingPage';
import LoginDoctor from '../../pages/public/LoginDoctor';
import LoginPatient from '../../pages/public/LoginPatient';
import RegisterDoctor from '../../pages/public/RegisterDoctor';

import DoctorDashboard from '../../pages/doctor/DoctorDashboard';
import Patients from '../../pages/doctor/Patients';
import PatientDetails from '../../pages/doctor/PatientDetails';
import AddVisit from '../../pages/doctor/AddVisit';
import Predict from '../../pages/doctor/Predict';

import PatientDashboard from '../../pages/patient/PatientDashboard';
import Profile from '../../pages/patient/Profile';
import Visits from '../../pages/patient/Visits';
import PatientPredict from '../../pages/patient/Predict';
import AIChat from '../../pages/patient/AIChat';

export default function AppShell() {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isPublicRoute = ['/', '/login', '/patient-login', '/register-doctor'].includes(location.pathname);

  const toggleSidebar = () => {
    if (window.innerWidth < 768) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="app-container">
      {!isPublicRoute && <AppNavbar onMenuClick={toggleSidebar} sidebarCollapsed={sidebarCollapsed} />}
      <div className="app-body">
        {!isPublicRoute && <SideNav collapsed={sidebarCollapsed} open={sidebarOpen} onClose={closeSidebar} />}
        <main className={`main-content ${!isPublicRoute && !sidebarOpen ? (sidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded') : ''}`}>
          <Routes>
            <Route path="/" element={user ? <Navigate to={user.userType === "doctor" ? "/doctor/dashboard" : "/patient/dashboard"} replace /> : <LandingPage />} />

            {/* Public */}
            <Route path="/login" element={<LoginDoctor />} />
            <Route path="/patient-login" element={<LoginPatient />} />
            <Route path="/register-doctor" element={<RegisterDoctor />} />

            {/* Doctor */}
            <Route path="/doctor/dashboard" element={<ProtectedRoute allow={["doctor"]}><DoctorDashboard /></ProtectedRoute>} />
            <Route path="/doctor/patients" element={<ProtectedRoute allow={["doctor"]}><Patients /></ProtectedRoute>} />
            <Route path="/doctor/patients/:id" element={<ProtectedRoute allow={["doctor"]}><PatientDetails /></ProtectedRoute>} />
            <Route path="/doctor/patients/:id/add-visit" element={<ProtectedRoute allow={["doctor"]}><AddVisit /></ProtectedRoute>} />
            <Route path="/doctor/predict" element={<ProtectedRoute allow={["doctor"]}><Predict /></ProtectedRoute>} />

            {/* Patient */}
            <Route path="/patient/dashboard" element={<ProtectedRoute allow={["patient"]}><PatientDashboard /></ProtectedRoute>} />
            <Route path="/patient/profile" element={<ProtectedRoute allow={["patient"]}><Profile /></ProtectedRoute>} />
            <Route path="/patient/visits" element={<ProtectedRoute allow={["patient"]}><Visits /></ProtectedRoute>} />
            <Route path="/patient/predict" element={<ProtectedRoute allow={["patient"]}><PatientPredict /></ProtectedRoute>} />
            <Route path="/patient/ai-chat" element={<ProtectedRoute allow={["patient"]}><AIChat /></ProtectedRoute>} />

            <Route path="*" element={<div className="text-center py-5">Page Not Found</div>} />
          </Routes>
        </main>
      </div>
    </div>
  );
}