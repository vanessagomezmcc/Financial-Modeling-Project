"use client";

import { useState, useEffect } from "react";
import { useFinancial } from "@/lib/FinancialContext";
import BackButton from "@/components/BackButton";

const STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","DC","FL","GA","HI","ID","IL","IN",
  "IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH",
  "NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT",
  "VT","VA","WA","WV","WI","WY"
];

const FILING_STATUSES = [
  { label: "Single", value: "single" },
  { label: "Married Filing Jointly", value: "married_joint" },
  { label: "Married Filing Separately", value: "married_separate" },
  { label: "Head of Household", value: "head_of_household" }
];

type FilingStatus = "single" | "married_joint" | "married_separate" | "head_of_household";

export default function TaxesPage() {
  const { profile, setTaxData } = useFinancial();

  const [state, setState] = useState("");
  const [income, setIncome] = useState("");
  const [filingStatus, setFilingStatus] = useState<FilingStatus>("single");
  const [dependents, setDependents] = useState("0");

  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setState(profile.state || "");
      setIncome(profile.incomeAnnual?.toString() || "");
      setFilingStatus((profile.filingStatus?.toLowerCase() as FilingStatus) || "single");
      setDependents(profile.dependents?.toString() || "0");
    }
  }, []);

  const runTaxModel = async () => {
    if (!state) {
      setError("State is required.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setAnalysis(null);

      const res = await fetch("http://127.0.0.1:8000/api/tax-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          state,
          annual_income: Number(income),
          filing_status: filingStatus.toLowerCase(),
          dependents: Number(dependents)
        })
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Backend error:", text);
        setError(text || "Tax calculation failed.");
        return;
      }

      const data = await res.json();
      setAnalysis(data);
      setTaxData(data);

    } catch {
      setError("Server not responding.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageStyle}>
      {/* Centered Back Button */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
        <BackButton />
      </div>

      <div style={{ width: "100%", maxWidth: 1000, margin: "0 auto" }}>

        <h1 style={titleStyle}>
          Tax Intelligence Dashboard
        </h1>

        {/* Intro Card */}
        <div style={introCard}>
          <div style={iconCircle}>ℹ</div>
          <div>
            <h3 style={{ margin: "0 0 8px 0", fontSize: 18, color: "#991b1b" }}>
              Estimate Your Tax Burden
            </h3>
            <p style={{ margin: 0, lineHeight: 1.6, color: "#475569" }}>
              Calculate your federal and state tax obligations based on your income, 
              filing status, and location. Get a detailed breakdown of your tax liability 
              and take-home pay to help with financial planning.
            </p>
          </div>
        </div>

        {/* INPUT CARD */}
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0, marginBottom: 24, color: "#991b1b" }}>
            Income & Filing Details
          </h2>

          <FormField
            label="State"
            description="Your state of residence determines state income tax rates and rules."
          >
            <select 
              value={state} 
              onChange={e => setState(e.target.value)} 
              style={inputStyle}
            >
              <option value="">Select State</option>
              {STATES.map(s => <option key={s}>{s}</option>)}
            </select>
          </FormField>

          <FormField
            label="Annual Income"
            description="Your total gross income before any deductions or taxes."
          >
            <input
              value={income}
              onChange={e => setIncome(e.target.value.replace(/\D/g, ""))}
              style={inputStyle}
              placeholder="e.g., 100000"
            />
          </FormField>

          <FormField
            label="Filing Status"
            description="Your tax filing status affects your tax brackets and standard deduction."
          >
            <select
              value={filingStatus}
              onChange={e => setFilingStatus(e.target.value as FilingStatus)}
              style={inputStyle}
            >
              {FILING_STATUSES.map(s => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            label="Dependents"
            description="Number of qualifying children or relatives that may provide tax credits."
          >
            <input
              value={dependents}
              onChange={e => setDependents(e.target.value.replace(/\D/g, ""))}
              style={inputStyle}
              placeholder="0"
            />
          </FormField>

          <button 
            onClick={runTaxModel} 
            style={buttonStyle}
            disabled={loading}
          >
            {loading ? "Calculating..." : "Generate Tax Report"}
          </button>

          {error && (
            <div style={errorBox}>
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* RESULTS */}
        {analysis && (
          <>
            {/* Info Card for Results */}
            <div style={infoCardSmall}>
              <strong>Understanding your results:</strong> The effective tax rate shows 
              what percentage of your income goes to taxes. FICA includes Social Security 
              (6.2%) and Medicare (1.45%) taxes.
            </div>

            {/* EXECUTIVE SUMMARY */}
            <div style={summaryRow}>
              <SummaryBox
                label="Total Taxes (Annual)"
                value={analysis.total_tax_annual}
        
              />
              <SummaryBox
                label="Net Income"
                value={analysis.net_income_annual}
              
              />
              <SummaryBox
                label="Effective Rate"
                value={`${analysis.effective_rate}%`}
                
              />
              <SummaryBox
                label="State Type"
                value={analysis.state_type}
               
              />
            </div>

            {/* BREAKDOWN CARD */}
            <div style={reportCard}>
              <h2 style={{ marginTop: 0, color: "#991b1b" }}>Annual Breakdown</h2>
              <div style={breakdownTable}>
                <ReportRow label="Federal Tax" value={analysis.federal_tax_annual} />
                <ReportRow label="State Tax" value={analysis.state_tax_annual} />
                <ReportRow label="FICA" value={analysis.fica_annual} />
                <div style={totalDivider} />
                <ReportRow label="Total Taxes" value={analysis.total_tax_annual} bold />
                <ReportRow label="Net Income" value={analysis.net_income_annual} bold highlight />
              </div>

              <hr style={{ margin: "40px 0", border: "none", borderTop: "1px solid #e5e7eb" }} />

              <h2 style={{ color: "#991b1b" }}>Monthly Breakdown</h2>
              <div style={breakdownTable}>
                <ReportRow label="Federal Tax" value={analysis.federal_tax_monthly} />
                <ReportRow label="State Tax" value={analysis.state_tax_monthly} />
                <ReportRow label="FICA" value={analysis.fica_monthly} />
                <div style={totalDivider} />
                <ReportRow label="Total Taxes" value={analysis.total_tax_monthly} bold />
                <ReportRow label="Net Income" value={analysis.net_income_monthly} bold highlight />
              </div>
            </div>

            {/* Tax Savings Tips */}
            <div style={tipsCard}>
              <h3 style={{ margin: "0 0 16px 0", color: "#991b1b" }}>
                💡 Tax Planning Tips
              </h3>
              <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.8 }}>
                <li>Contribute to 401(k) or IRA to reduce taxable income</li>
                <li>Consider HSA contributions if you have a high-deductible health plan</li>
                <li>Track deductible expenses throughout the year</li>
                <li>Review filing status options if married (joint vs. separate)</li>
                <li>Claim all eligible tax credits for dependents</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------- UI COMPONENTS ---------- */

function FormField({ label, description, children }: any) {
  return (
    <div style={{ marginBottom: 24 }}>
      <label style={labelStyle}>{label}</label>
      {description && (
        <p style={descriptionStyle}>{description}</p>
      )}
      {children}
    </div>
  );
}

function SummaryBox({ label, value, icon }: any) {
  return (
    <div style={summaryBox}>
      <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: "#1e293b" }}>
        {typeof value === "number"
          ? `$${value.toLocaleString()}`
          : value}
      </div>
    </div>
  );
}

function ReportRow({ label, value, bold, highlight }: any) {
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      padding: "14px 0",
      fontWeight: bold ? 600 : 400,
      fontSize: bold ? 16 : 15,
      background: highlight ? "#fef2f2" : "transparent",
      marginLeft: highlight ? -20 : 0,
      marginRight: highlight ? -20 : 0,
      paddingLeft: highlight ? 20 : 0,
      paddingRight: highlight ? 20 : 0,
      borderRadius: highlight ? 8 : 0,
    }}>
      <div>{label}</div>
      <div>${value?.toLocaleString()}</div>
    </div>
  );
}

/* ---------- STYLES ---------- */

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)",
  paddingTop: 60,
  paddingBottom: 60,
};

const titleStyle: React.CSSProperties = {
  color: "#991b1b",
  borderLeft: "6px solid #dc2626",
  paddingLeft: 16,
  marginBottom: 30,
  fontSize: 36,
  fontWeight: 700,
};

const introCard: React.CSSProperties = {
  background: "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)",
  padding: 24,
  borderRadius: 16,
  marginBottom: 30,
  display: "flex",
  gap: 16,
  alignItems: "flex-start",
  border: "1px solid #fecaca",
};

const iconCircle: React.CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: "50%",
  background: "#dc2626",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 20,
  flexShrink: 0,
};

const cardStyle: React.CSSProperties = {
  background: "white",
  padding: 40,
  borderRadius: 20,
  marginBottom: 40,
  boxShadow: "0 20px 60px rgba(220,38,38,0.15)"
};

const reportCard: React.CSSProperties = {
  background: "white",
  padding: 40,
  borderRadius: 20,
  boxShadow: "0 20px 60px rgba(220,38,38,0.15)",
  marginBottom: 30,
};

const summaryRow: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4,1fr)",
  gap: 20,
  marginBottom: 40
};

const summaryBox: React.CSSProperties = {
  background: "white",
  padding: 25,
  borderRadius: 16,
  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  textAlign: "center",
  border: "1px solid #fee2e2",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontWeight: 600,
  marginBottom: 8,
  color: "#1e293b",
  fontSize: 15,
};

const descriptionStyle: React.CSSProperties = {
  margin: "0 0 10px 0",
  fontSize: 13,
  color: "#64748b",
  lineHeight: 1.5,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: 14,
  borderRadius: 12,
  border: "1px solid #cbd5e1",
  fontSize: 15,
  boxSizing: "border-box",
};

const buttonStyle: React.CSSProperties = {
  width: "100%",
  padding: "16px 24px",
  borderRadius: 12,
  background: "#dc2626",
  color: "white",
  border: "none",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 16,
  marginTop: 10,
  transition: "background 0.2s",
};

const breakdownTable: React.CSSProperties = {
  marginTop: 20,
};

const totalDivider: React.CSSProperties = {
  height: 2,
  background: "#e5e7eb",
  margin: "8px 0",
};

const infoCardSmall: React.CSSProperties = {
  background: "#fffbeb",
  border: "1px solid #fcd34d",
  padding: 16,
  borderRadius: 12,
  fontSize: 14,
  lineHeight: 1.6,
  marginBottom: 20,
  color: "#78350f"
};

const tipsCard: React.CSSProperties = {
  background: "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)",
  padding: 28,
  borderRadius: 16,
  border: "1px solid #fecaca",
  color: "#475569",
};

const errorBox: React.CSSProperties = {
  marginTop: 15,
  padding: 14,
  background: "#fee2e2",
  color: "#991b1b",
  borderRadius: 10,
  fontSize: 14,
  border: "1px solid #fca5a5"
};