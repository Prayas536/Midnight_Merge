import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function Profile() {
  const [p, setP] = useState(null);

  useEffect(() => {
    (async () => {
      const res = await api.get("/my/profile");
      setP(res.data.data);
    })();
  }, []);

  if (!p) return <LoadingSpinner />;

  return (
    <div>
      <h3 className="mb-3">My Profile</h3>
      <div className="card card-body">
        <div className="row g-3">
          <div className="col-md-6">
            <div className="text-muted">Patient ID</div>
            <div><code>{p.patientId}</code></div>
          </div>
          <div className="col-md-6">
            <div className="text-muted">Name</div>
            <div>{p.name}</div>
          </div>
          <div className="col-md-6">
            <div className="text-muted">DOB</div>
            <div>{new Date(p.dob).toLocaleDateString()}</div>
          </div>
          <div className="col-md-6">
            <div className="text-muted">Gender</div>
            <div className="text-capitalize">{p.gender}</div>
          </div>
          <div className="col-md-4">
            <div className="text-muted">Hypertension</div>
            <div>{p.hypertension ? "Yes" : "No"}</div>
          </div>
          <div className="col-md-4">
            <div className="text-muted">Heart Disease</div>
            <div>{p.heartDisease ? "Yes" : "No"}</div>
          </div>
          <div className="col-md-4">
            <div className="text-muted">Smoking</div>
            <div className="text-capitalize">{p.smokingHistory}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
