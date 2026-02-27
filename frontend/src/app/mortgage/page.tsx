"use client";

import { useState } from "react";
import { useSession } from "@/lib/useSession";
import { postJSON } from "@/lib/api";

export default function MortgagePage() {
  const { session, update, hydrated } = useSession();
  const [result, setResult] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  if (!hydrated) return <div>Loading…</div>;

  const m = session.mortgage!;
  const input: React.CSSProperties = { padding: 10, borderRadius: 10, border: "1px solid #ddd", width: "100%" };
  const label: React.CSSProperties = { fontSize: 12, opacity: 0.7, marginTop: 10 };

  async function run() {
    setErr(null);
    setResult(null);
    try {
      const out = await postJSON("/api/mortgage", {
        principal: m.principal,
        rate_pct: m.ratePct,
        years: m.years,
        home_value: m.homeValue,
        property_tax_pct: m.propertyTaxPct,
        hoa_monthly: m.hoaMonthly ?? 0,
        home_insurance_monthly: m.homeInsuranceMonthly ?? 0,
      });
      setResult(out);
    } catch (e: any) {
      setErr(String(e.message ?? e));
    }
  }

  return (
    <div style={{ background: "white", border: "1px solid #eee", borderRadius: 18, padding: 18 }}>
      <h1 style={{ marginTop: 0 }}>Mortgage</h1>
      <p style={{ marginTop: -6, opacity: 0.7 }}>Monthly payment + breakdown + first-year snapshot.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div>
          <div style={label}>Home Value</div>
          <input style={input} type="number" value={m.homeValue}
            onChange={(e) => update({ mortgage: { ...m, homeValue: Number(e.target.value) } })} />
        </div>
        <div>
          <div style={label}>Principal (Loan Amount)</div>
          <input style={input} type="number" value={m.principal}
            onChange={(e) => update({ mortgage: { ...m, principal: Number(e.target.value) } })} />
        </div>
        <div>
          <div style={label}>Rate %</div>
          <input style={input} type="number" step="0.01" value={m.ratePct}
            onChange={(e) => update({ mortgage: { ...m, ratePct: Number(e.target.value) } })} />
        </div>
        <div>
          <div style={label}>Term (years)</div>
          <input style={input} type="number" value={m.years}
            onChange={(e) => update({ mortgage: { ...m, years: Number(e.target.value) } })} />
        </div>
        <div>
          <div style={label}>Property Tax %</div>
          <input style={input} type="number" step="0.01" value={m.propertyTaxPct}
            onChange={(e) => update({ mortgage: { ...m, propertyTaxPct: Number(e.target.value) } })} />
        </div>
        <div>
          <div style={label}>HOA Monthly</div>
          <input style={input} type="number" value={m.hoaMonthly ?? 0}
            onChange={(e) => update({ mortgage: { ...m, hoaMonthly: Number(e.target.value) } })} />
        </div>
        <div>
          <div style={label}>Home Insurance Monthly</div>
          <input style={input} type="number" value={m.homeInsuranceMonthly ?? 0}
            onChange={(e) => update({ mortgage: { ...m, homeInsuranceMonthly: Number(e.target.value) } })} />
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        <button onClick={run} style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid #ddd", background: "#111", color: "white" }}>
          Compute Mortgage
        </button>
      </div>

      {err && <p style={{ color: "crimson" }}>{err}</p>}
      {result && <pre style={{ marginTop: 12, background: "#fafafa", padding: 12, borderRadius: 12 }}>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}