"use client";

import { useState } from "react";
import { useSession } from "@/lib/useSession";
import { postJSON } from "@/lib/api";

export default function TaxesPage() {
  const { session, hydrated } = useSession();
  const [result, setResult] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  if (!hydrated) return <div>Loading…</div>;

  async function run() {
    setErr(null);
    setResult(null);
    try {
      const out = await postJSON("/api/taxes", {
        state: session.profile.state,
        filing_status: session.profile.filingStatus,
        income_annual: session.incomeAnnual,
        dependents: session.profile.dependents,
      });
      setResult(out);
    } catch (e: any) {
      setErr(String(e.message ?? e));
    }
  }

  return (
    <div style={{ background: "white", border: "1px solid #eee", borderRadius: 18, padding: 18 }}>
      <h1 style={{ marginTop: 0 }}>Taxes</h1>
      <p style={{ marginTop: -6, opacity: 0.7 }}>Computes net income baseline (we’ll upgrade to brackets next).</p>

      <button onClick={run} style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid #ddd", background: "#111", color: "white" }}>
        Calculate Taxes
      </button>

      {err && <p style={{ color: "crimson" }}>{err}</p>}
      {result && <pre style={{ marginTop: 12, background: "#fafafa", padding: 12, borderRadius: 12 }}>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}