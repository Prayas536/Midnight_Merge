import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import NavBar from "./components/NavBar";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthContext } from "./context/AuthContext";

import LoginDoctor from "./pages/public/LoginDoctor";
import LoginPatient from "./pages/public/LoginPatient";
import RegisterDoctor from "./pages/public/RegisterDoctor";

import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import Patients from "./pages/doctor/Patients";
import PatientDetails from "./pages/doctor/PatientDetails";
import AddVisit from "./pages/doctor/AddVisit";
import Predict from "./pages/doctor/Predict";

import PatientDashboard from "./pages/patient/PatientDashboard";
import Profile from "./pages/patient/Profile";
import Visits from "./pages/patient/Visits";

export default function App() {
  const { user } = useContext(AuthContext);

  return (
    <>
      <NavBar />
      <div className="container my-4">
        <Routes>
          <Route path="/" element={<Navigate to={user ? (user.userType === "doctor" ? "/doctor/dashboard" : "/patient/dashboard") : "/login"} replace />} />

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

          <Route path="*" element={<div>Not Found</div>} />
        </Routes>
      </div>
    </>
  );
}
