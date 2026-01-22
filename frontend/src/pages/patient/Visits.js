import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import LoadingSpinner from "../../components/LoadingSpinner";
import LineChart from "../../components/charts/LineChart";

export default function Visits() {
  const [visits, setVisits] = useState(null);

  useEffect(() => {
    (async () => {
      const res = await api.get("/my/visits");
      setVisits(res.data.data);
    })();
  }, []);

  const labels = useMemo(() => (visits || []).slice().reverse().map(v => new Date(v.visitDate).toLocaleDateString()), [visits]);
  const a1c = useMemo(() => (visits || []).slice().reverse().map(v => v.metrics?.HbA1cLevel ?? null), [visits]);
  const glucose = useMemo(() => (visits || []).slice().reverse().map(v => v.metrics?.bloodGlucoseLevel ?? null), [visits]);
  const bmi = useMemo(() => (visits || []).slice().reverse().map(v => v.metrics?.bmi ?? null), [visits]);

  if (!visits) return <LoadingSpinner />;

  return (
    <div>
      <h3 className="mb-3">My Visits</h3>

      <div className="row g-3">
        <div className="col-md-6"><LineChart title="HbA1c over time" labels={labels} values={a1c} /></div>
        <div className="col-md-6"><LineChart title="Glucose over time" labels={labels} values={glucose} /></div>
        <div className="col-md-12"><LineChart title="BMI over time" labels={labels} values={bmi} /></div>
      </div>

      <div className="mt-4">
        {visits.length === 0 ? (
          <div className="text-muted">No visits yet.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>HbA1c</th>
                  <th>Glucose</th>
                  <th>BMI</th>
                  <th>Doctor Notes</th>
                  <th>Recommendations</th>
                  <th>Prediction</th>
                </tr>
              </thead>
              <tbody>
                {visits.map((v) => (
                  <tr key={v._id}>
                    <td>{new Date(v.visitDate).toLocaleDateString()}</td>
                    <td>{v.metrics?.HbA1cLevel ?? "-"}</td>
                    <td>{v.metrics?.bloodGlucoseLevel ?? "-"}</td>
                    <td>{v.metrics?.bmi ?? "-"}</td>
                    <td style={{ maxWidth: 350 }}>{v.notes || "-"}</td>
                    <td style={{ maxWidth: 350 }}>{v.recommendations || "-"}</td>
                    <td>
                      {v.prediction?.riskLabel ? (
                        <span>
                          <span className="badge text-bg-info me-2">{v.prediction.riskLabel}</span>
                          {v.prediction.riskScore ?? ""}
                        </span>
                      ) : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
