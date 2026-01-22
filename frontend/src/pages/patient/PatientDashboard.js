import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function PatientDashboard() {
  const [profile, setProfile] = useState(null);
  const [visits, setVisits] = useState([]);

  useEffect(() => {
    (async () => {
      const p = await api.get("/my/profile");
      const v = await api.get("/my/visits");
      setProfile(p.data.data);
      setVisits(v.data.data);
    })();
  }, []);

  if (!profile) return <LoadingSpinner />;

  return (
    <div>
      <h3 className="mb-3">Patient Dashboard</h3>
      <div className="row g-3">
        <div className="col-md-4">
          <div className="card card-body">
            <div className="text-muted">Name</div>
            <div className="fw-semibold">{profile.name}</div>
            <div className="text-muted mt-2">Patient ID</div>
            <div><code>{profile.patientId}</code></div>
          </div>
        </div>
        <div className="col-md-8">
          <div className="card card-body">
            <div className="fw-semibold">Recent visits</div>
            <div className="text-muted">{visits.length} total visits</div>
          </div>
        </div>
      </div>
    </div>
  );
}
