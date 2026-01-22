import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import LoadingSpinner from "./LoadingSpinner";

export default function ProtectedRoute({ children, allow }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;

  if (allow && !allow.includes(user.userType)) {
    return <Navigate to={user.userType === "doctor" ? "/doctor/dashboard" : "/patient/dashboard"} replace />;
  }
  return children;
}
