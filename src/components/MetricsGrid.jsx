import React from "react";

export default function MetricsGrid({ metrics }) {
  if (!metrics) return null;

  const entries = [
    ["totalClicks", metrics.totalClicks],
    ["errorCount", metrics.errorCount],
    ["retryCount", metrics.retryCount],
    ["rageClickRate", metrics.rageClickRate],
    ["navLoopCount", metrics.navLoopCount],
    ["avgDwellTime (s)", Number(metrics.avgDwellTime || 0).toFixed(2)],
    ["formAbandonment", String(metrics.formAbandonment)],
    ["backtrackRate", metrics.backtrackRate],
    ["idleTimeoutCount", metrics.idleTimeoutCount],
    ["refocusCount", metrics.refocusCount],
  ];

  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16, marginTop: 16 }}>
      <h3 style={{ marginTop: 0 }}>Aggregated Metrics</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 12 }}>
        {entries.map(([label, value]) => (
          <div key={label} style={{ background: "#fafafa", border: "1px solid #eee", borderRadius: 8, padding: 10 }}>
            <div style={{ fontSize: 12, opacity: 0.7 }}>{label}</div>
            <div style={{ fontWeight: 700 }}>{value ?? "-"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

