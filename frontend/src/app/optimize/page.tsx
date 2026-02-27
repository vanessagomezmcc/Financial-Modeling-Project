"use client";

import { useState } from "react";
import { useSession } from "@/lib/useSession";
import { postJSON } from "@/lib/api";

export default function OptimizePage() {
  const { session, hydrated } = useSession();
  const [result, setResult] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  if (!hydrated) return <div>Loading…</div>;

  async function run() {
    setErr(null);
    setResult(null);
    try {
      const out = await postJSON("/api/optimize", { session });
      setResult(out);
    } catch (e: any) {
      setErr(String(e.message ?? e));
    }
  }

  return (
    <div style={{ background: "white", border: "1px solid #eee", borderRadius: 18, padding: 18 }}>
      <h1 style={{ marginTop: 0 }}>Optimization</h1>
      <p style={{ marginTop: -6, opacity: 0.7 }}>Suggests budget moves to reduce risk while keeping essentials intact.</p>

      <button onClick={run} style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid #ddd", background: "#111", color: "white" }}>
        Get Recommendations
      </button>

      {err && <p style={{ color: "crimson" }}>{err}</p>}
      {result && <pre style={{ marginTop: 12, background: "#fafafa", padding: 12, borderRadius: 12 }}>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}