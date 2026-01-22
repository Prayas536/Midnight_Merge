import React, { useContext } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function NavBar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to={user?.userType === "doctor" ? "/doctor/dashboard" : "/patient/dashboard"}>
          DPMS
        </Link>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#dpmsNav">
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="dpmsNav">
          <ul className="navbar-nav me-auto">
            {user?.userType === "doctor" && (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/doctor/dashboard">Dashboard</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/doctor/patients">Patients</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/doctor/predict">Predict</NavLink>
                </li>
              </>
            )}
            {user?.userType === "patient" && (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/patient/dashboard">Dashboard</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/patient/profile">Profile</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/patient/visits">Visits</NavLink>
                </li>
              </>
            )}
          </ul>

          <ul className="navbar-nav ms-auto">
            {user ? (
              <>
                <li className="nav-item">
                  <span className="navbar-text text-light me-3">
                    <i className="fa-solid fa-user-doctor me-2" />
                    {user.userType}
                  </span>
                </li>
                <li className="nav-item">
                  <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item"><NavLink className="nav-link" to="/login">Doctor Login</NavLink></li>
                <li className="nav-item"><NavLink className="nav-link" to="/patient-login">Patient Login</NavLink></li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
