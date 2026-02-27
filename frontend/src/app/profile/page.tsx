"use client";

import { useState } from "react";
import { useSession } from "@/lib/useSession";
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

export default function ProfilePage() {
  const { session, update, save, savedText } = useSession();
  const profile = session.profile;

  const [state, setState] = useState(profile.state || "");
  const [filingStatus, setFilingStatus] = useState(profile.filingStatus || "single");
  const [age, setAge] = useState(String(profile.age || ""));
  const [dependents, setDependents] = useState(String(profile.dependents || "0"));
  const [income, setIncome] = useState(String(session.incomeAnnual || ""));
  const [savings, setSavings] = useState(String(session.savingsCash || ""));

  const handleSave = () => {
    update({
      profile: {
        age: Number(age),
        state,
        filingStatus,
        dependents: Number(dependents)
      },
      incomeAnnual: Number(income),
      savingsCash: Number(savings)
    });
    save();
  };

  return (
    <div style={pageStyle}>
      {/* Centered Back Button */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
        <BackButton />
      </div>

      <div style={{ width: "100%", maxWidth: 700, margin: "0 auto" }}>
        
        <h1 style={titleStyle}>Profile</h1>

        {/* Intro Card */}
        <div style={introCard}>
          <div style={iconCircle}>ℹ</div>
          <div>
            <h3 style={{ margin: "0 0 8px 0", fontSize: 18, color: "#1e40af" }}>
              Why we need this information
            </h3>
            <p style={{ margin: 0, lineHeight: 1.6, color: "#475569" }}>
              Your profile data helps us provide accurate calculations in the{" "}
              <strong>Tax Intelligence Dashboard</strong> and other financial tools. 
              All information is stored locally in your browser and never sent to external servers.
            </p>
          </div>
        </div>

        {/* Main Form Card */}
        <div style={cardStyle}>
          
          <FormField
            label="State"
            description="Required for state tax calculations and region-specific analysis."
          >
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              style={inputStyle}
            >
              <option value="">Select State</option>
              {STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            label="Filing Status"
            description="Determines your tax brackets and standard deduction amounts."
          >
            <select
              value={filingStatus}
              onChange={(e) => setFilingStatus(e.target.value as any)}
              style={inputStyle}
            >
              {FILING_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            label="Age"
            description="Used for retirement planning and age-specific tax benefits."
          >
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              style={inputStyle}
              placeholder="Enter your age"
            />
          </FormField>

          <FormField
            label="Dependents"
            description="Impacts tax credits and deductions, particularly the Child Tax Credit."
          >
            <input
              type="number"
              value={dependents}
              onChange={(e) => setDependents(e.target.value)}
              style={inputStyle}
              placeholder="Number of dependents"
            />
          </FormField>

          <FormField
            label="Annual Income"
            description="Your gross annual salary before taxes and deductions."
          >
            <input
              type="text"
              value={income}
              onChange={(e) => setIncome(e.target.value.replace(/\D/g, ""))}
              style={inputStyle}
              placeholder="100000"
            />
          </FormField>

          <FormField
            label="Cash Savings"
            description="Current liquid savings for emergency fund analysis and financial planning."
          >
            <input
              type="text"
              value={savings}
              onChange={(e) => setSavings(e.target.value.replace(/\D/g, ""))}
              style={inputStyle}
              placeholder="20000"
            />
          </FormField>

          <button onClick={handleSave} style={buttonStyle}>
            Save Profile
          </button>

          {savedText && (
            <div style={{ marginTop: 15, color: "#16a34a", textAlign: "center" }}>
              {savedText}
            </div>
          )}
        </div>

        {/* Privacy Notice */}
        <div style={privacyNotice}>
           Your data is stored locally and is never shared with third parties.
        </div>
      </div>
    </div>
  );
}

/* ========== COMPONENTS ========== */

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

/* ========== STYLES ========== */

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)",
  paddingTop: 60,
  paddingBottom: 60,
};

const titleStyle: React.CSSProperties = {
  color: "#2563eb",
  borderLeft: "6px solid #2563eb",
  paddingLeft: 16,
  marginBottom: 30,
  fontSize: 36,
  fontWeight: 700,
};

const introCard: React.CSSProperties = {
  background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
  padding: 24,
  borderRadius: 16,
  marginBottom: 30,
  display: "flex",
  gap: 16,
  alignItems: "flex-start",
  border: "1px solid #bfdbfe",
};

const iconCircle: React.CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: "50%",
  background: "#2563eb",
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
  boxShadow: "0 20px 60px rgba(37,99,235,0.15)",
  marginBottom: 20,
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontWeight: 600,
  marginBottom: 6,
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
  transition: "border-color 0.2s",
};

const buttonStyle: React.CSSProperties = {
  width: "100%",
  padding: "16px 24px",
  borderRadius: 12,
  background: "#2563eb",
  color: "white",
  border: "none",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 16,
  marginTop: 10,
  transition: "background 0.2s",
};

const privacyNotice: React.CSSProperties = {
  textAlign: "center",
  fontSize: 13,
  color: "#64748b",
  padding: 16,
};