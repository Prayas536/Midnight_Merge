import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function DoctorDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    (async () => {
      const patients = await api.get("/patients");
      setStats({ patientCount: patients.data.data.length });
    })();
  }, []);

  if (!stats) return <LoadingSpinner />;

  return (
    <div>
      <h3 className="mb-3">Doctor Dashboard</h3>
      <div className="row g-3">
        <div className="col-md-4">
          <div className="card card-body">
            <div className="text-muted">Patients</div>
            <div className="display-6">{stats.patientCount}</div>
          </div>
        </div>
        <div className="col-md-8">
          <div className="card card-body">
            <div className="fw-semibold mb-2">Workflow</div>
            <ol className="mb-0">
              <li>Create a patient</li>
              <li>Copy the generated Patient ID + password (shown once)</li>
              <li>Add visits & view trends</li>
              <li>Use Predict page for ML risk score</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
