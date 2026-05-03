import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SeverityBadge from "../components/SeverityBadge";
import { getSessions } from "../api/dashboardApi";

export default function Sessions() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const data = await getSessions();
        if (!mounted) return;
        setRows(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!mounted) return;
        setErr(e?.message || "Failed to load sessions");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <div>Loading sessions…</div>;
  if (err) return <div style={{ color: "crimson" }}>{err}</div>;

  if (rows.length === 0) {
    return (
      <div>
        <h2>Session Overview</h2>
        <div style={{ opacity: 0.7 }}>No sessions available.</div>
      </div>
    );
  }

  const labelCounts = rows.reduce(
    (acc, s) => {
      const sev = String(s.severity || "").toUpperCase();

      if (sev === "HIGH") acc.HIGH += 1;
      else if (sev === "MEDIUM") acc.MEDIUM += 1;
      else acc.LOW += 1;

      acc.TOTAL += 1;
      return acc;
    },
    { LOW: 0, MEDIUM: 0, HIGH: 0, TOTAL: 0 }
  );

  return (
    <div>
      <h2>Session Overview</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 12,
          marginBottom: 18,
        }}
      >
        <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
          <div style={{ opacity: 0.7 }}>Total Sessions</div>
          <b style={{ fontSize: 22 }}>{labelCounts.TOTAL}</b>
        </div>

        <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
          <div style={{ opacity: 0.7 }}>Low Severity</div>
          <b style={{ fontSize: 22 }}>{labelCounts.LOW}</b>
        </div>

        <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
          <div style={{ opacity: 0.7 }}>Medium Severity</div>
          <b style={{ fontSize: 22 }}>{labelCounts.MEDIUM}</b>
        </div>

        <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
          <div style={{ opacity: 0.7 }}>High Severity</div>
          <b style={{ fontSize: 22 }}>{labelCounts.HIGH}</b>
        </div>
      </div>

      <table width="100%" cellPadding="10" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>
            <th>Session ID</th>
            <th>Scenario</th>
            <th>Score</th>
            <th>Severity</th>
            <th>Status</th>
            <th>Events</th>
            <th>Timestamp</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((s) => (
            <tr
              key={s.sessionId}
              style={{ borderBottom: "1px solid #eee", cursor: "pointer" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fafafa")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              onClick={() => navigate(`/sessions/${s.sessionId}`)}
            >
              <td>
                <b>{s.sessionId}</b>
              </td>

              <td>{s.scenario || "—"}</td>

              <td>
                {typeof s.score === "number"
                  ? s.score
                  : typeof s.frustrationScore === "number"
                    ? s.frustrationScore
                    : "—"}
              </td>

              <td>
                <SeverityBadge severity={s.severity} />
              </td>

              <td>{s.status || "—"}</td>

              <td>
                {typeof s.events === "number"
                  ? s.events
                  : typeof s.totalEventCount === "number"
                    ? s.totalEventCount
                    : "—"}
              </td>

              <td>{s.timestamp ? new Date(s.timestamp).toLocaleString() : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
