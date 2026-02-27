"use client";

import { useState } from "react";
import { useSession } from "@/lib/useSession";
import { postJSON } from "@/lib/api";

export default function LifeEventsPage() {
  const { session, hydrated } = useSession();
  const [eventType, setEventType] = useState<"job_loss" | "baby" | "move" | "medical">("job_loss");
  const [result, setResult] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  if (!hydrated) return <div>Loading…</div>;

  async function run() {
    setErr(null);
    setResult(null);
    try {
      const out = await postJSON("/api/life-events", { session, event_type: eventType });
      setResult(out);
    } catch (e: any) {
      setErr(String(e.message ?? e));
    }
  }

  return (
    <div style={{ background: "white", border: "1px solid #eee", borderRadius: 18, padding: 18 }}>
      <h1 style={{ marginTop: 0 }}>Life Events</h1>
      <p style={{ marginTop: -6, opacity: 0.7 }}>Apply a scenario and see how cashflow + risk changes.</p>

      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <select value={eventType} onChange={(e) => setEventType(e.target.value as any)}>
          <option value="job_loss">Job loss (income drop)</option>
          <option value="baby">Baby (expense increase)</option>
          <option value="move">Move (one-time cost)</option>
          <option value="medical">Medical shock</option>
        </select>

        <button onClick={run} style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid #ddd", background: "#111", color: "white" }}>
          Apply Event
        </button>
      </div>

      {err && <p style={{ color: "crimson" }}>{err}</p>}
      {result && <pre style={{ marginTop: 12, background: "#fafafa", padding: 12, borderRadius: 12 }}>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}