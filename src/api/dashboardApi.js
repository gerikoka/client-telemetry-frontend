// src/api/dashboardApi.js

// ---------------------------
// Backend API base
// ---------------------------
const API_BASE =
  import.meta.env.VITE_DASHBOARD_API_BASE ||
  "http://127.0.0.1:4000";

// ---------------------------
// Demo events (still used for event timeline only)
// ---------------------------
import events5230 from "../mock/events_S1770848729214-5230.json";

// ---------------------------
// Overrides (localStorage)
// ---------------------------
const OVERRIDES_KEY = "dashboard.overrides.v1";

/*
overrides shape:
{
  [sessionId]: {
    severity: "LOW"|"MEDIUM"|"HIGH",
    comment: string,
    updatedAt: string
  }
}
*/

function readOverrides() {
  try {
    const raw = localStorage.getItem(OVERRIDES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeOverrides(obj) {
  localStorage.setItem(OVERRIDES_KEY, JSON.stringify(obj));
}

function applyOverridesToSessions(sessions) {
  const overrides = readOverrides();

  return sessions.map((s) => {
    const o = overrides[s.sessionId];
    if (!o) return s;

    return {
      ...s,
      severity: o.severity,
      override: {
        severity: o.severity,
        comment: o.comment || "",
        updatedAt: o.updatedAt,
      },
    };
  });
}

function severityRank(sev) {
  switch (sev) {
    case "HIGH":
      return 0;
    case "MEDIUM":
      return 1;
    case "LOW":
    default:
      return 2;
  }
}

// ---------------------------
// Fetch helper
// ---------------------------
async function fetchJson(url) {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Request failed (${res.status})`);
  }

  return res.json();
}

// ---------------------------
// Sessions
// ---------------------------
async function fetchSessionsFromBackend() {
  return fetchJson(`${API_BASE}/api/sessions`);
}

export async function getSessions() {
  const sessions = await fetchSessionsFromBackend();
  return applyOverridesToSessions(sessions);
}

export async function getSessionById(sessionId) {
  return fetchJson(`${API_BASE}/api/sessions/${encodeURIComponent(sessionId)}`);
}

// ---------------------------
// Alerts
// ---------------------------
export async function getAlerts() {
  const sessions = await getSessions();
  return sessions.filter(
    (s) => s.severity === "MEDIUM" || s.severity === "HIGH"
  );
}

// ---------------------------
// Queue (priority sorted)
// ---------------------------
export async function getQueue() {
  const sessions = await getSessions();

  const sorted = [...sessions].sort((a, b) => {
    const sr = severityRank(a.severity) - severityRank(b.severity);
    if (sr !== 0) return sr;

    const ta = a.timestamp
      ? new Date(a.timestamp).getTime()
      : Number.MAX_SAFE_INTEGER;

    const tb = b.timestamp
      ? new Date(b.timestamp).getTime()
      : Number.MAX_SAFE_INTEGER;

    return ta - tb;
  });

  return sorted.map((s, idx) => ({
    ...s,
    queuePosition: idx + 1,
  }));
}

// ---------------------------
// Session Detail Metrics
// (now coming from backend)
// ---------------------------
export async function getSessionAggregates(sessionId) {
  return fetchJson(
    `${API_BASE}/api/sessions/${encodeURIComponent(sessionId)}/metrics`
  );
}

// ---------------------------
// Event timeline
// (still demo data)
// ---------------------------
export async function getSessionEvents(sessionId) {
  if (sessionId === "S1770848729214-5230") return events5230;
  return [];
}

// ---------------------------
// Admin Overrides
// ---------------------------
export async function getOverrides() {
  return readOverrides();
}

export async function saveOverride({ sessionId, severity, comment }) {
  const overrides = readOverrides();

  overrides[sessionId] = {
    severity,
    comment: comment || "",
    updatedAt: new Date().toISOString(),
  };

  writeOverrides(overrides);

  return getSessionById(sessionId);
}

export async function clearOverride(sessionId) {
  const overrides = readOverrides();
  delete overrides[sessionId];
  writeOverrides(overrides);
  return true;
}
