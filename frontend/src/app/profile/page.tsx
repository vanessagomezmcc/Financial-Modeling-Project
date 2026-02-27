"use client";

import { useState, useEffect } from "react";
import { useFinancial } from "@/lib/FinancialContext";

const STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY"
];

export default function ProfilePage() {
  const { profile, setProfile } = useFinancial();

  const [submitted, setSubmitted] = useState(false);
  const [saved, setSaved] = useState(false);

  const [stateInput, setStateInput] = useState(profile?.state || "");
  const [filingStatus, setFilingStatus] = useState(profile?.filingStatus || "");
  const [ageInput, setAgeInput] = useState(profile?.age?.toString() || "");
  const [depInput, setDepInput] = useState(profile?.dependents?.toString() || "");
  const [incomeInput, setIncomeInput] = useState(profile?.incomeAnnual?.toString() || "");
  const [cashInput, setCashInput] = useState(profile?.savingsCash?.toString() || "");

  useEffect(() => {
    if (profile) {
      localStorage.setItem("financialProfile", JSON.stringify(profile));
    }
  }, [profile]);

  const inputStyle: React.CSSProperties = {
    padding: 12,
    borderRadius: 12,
    border: "1px solid #ddd",
    width: "100%",
    marginBottom: 8
  };

  const errorStyle: React.CSSProperties = {
    color: "crimson",
    fontSize: 14,
    marginBottom: 18
  };

  const filteredStates = STATES.filter(s =>
    s.includes(stateInput.toUpperCase())
  );

  const validate = () => {
    const errors: Record<string, string> = {};

    if (!STATES.includes(stateInput.toUpperCase()))
      errors.state = "Enter a valid U.S. state abbreviation.";

    if (!filingStatus)
      errors.filingStatus = "Select a filing status.";

    if (!ageInput || Number(ageInput) < 18)
      errors.age = "Age must be at least 18.";

    if (depInput === "" || Number(depInput) < 0)
      errors.dependents = "Dependents must be 0 or greater.";

    if (!incomeInput || Number(incomeInput) <= 0)
      errors.income = "Income must be greater than 0.";

    if (!cashInput || Number(cashInput) < 0)
      errors.cash = "Cash savings cannot be negative.";

    return errors;
  };

  const save = () => {
    setSubmitted(true);
    const errors = validate();
    if (Object.keys(errors).length > 0) return;

    const newProfile = {
      state: stateInput.toUpperCase(),
      filingStatus,
      age: Number(ageInput),
      dependents: Number(depInput),
      incomeAnnual: Number(incomeInput),
      savingsCash: Number(cashInput)
    };
    console.log("Saved profile:", newProfile);
    setProfile(newProfile);

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const errors = submitted ? validate() : {};

  return (
    <div style={{ maxWidth: 500 }}>
      <h1>Profile</h1>

      {/* STATE */}
      <label>State</label>
      <input
        style={inputStyle}
        placeholder="Enter state (e.g. CA)"
        value={stateInput}
        onChange={(e) => setStateInput(e.target.value.toUpperCase())}
      />
      {stateInput.length > 0 &&
        !STATES.includes(stateInput.toUpperCase()) &&
        filteredStates.length > 0 && (
          <select
            size={4}
            style={{ ...inputStyle, marginTop: -4 }}
            onChange={(e) => setStateInput(e.target.value)}
          >
            {filteredStates.map(s => (
              <option key={s}>{s}</option>
            ))}
          </select>
        )}
      {errors.state && <div style={errorStyle}>{errors.state}</div>}

      {/* FILING STATUS */}
      <label>Filing Status</label>
      <select
        style={inputStyle}
        value={filingStatus}
        onChange={(e) => setFilingStatus(e.target.value)}
      >
        <option value="">Select filing status</option>
        <option value="single">Single</option>
        <option value="married">Married</option>
      </select>
      {errors.filingStatus && <div style={errorStyle}>{errors.filingStatus}</div>}

      {/* AGE */}
      <label>Age</label>
      <input
        style={inputStyle}
        type="text"
        inputMode="numeric"
        value={ageInput}
        onChange={(e) =>
          setAgeInput(e.target.value.replace(/\D/g, ""))
        }
      />
      {errors.age && <div style={errorStyle}>{errors.age}</div>}

      {/* DEPENDENTS */}
      <label>Dependents</label>
      <input
        style={inputStyle}
        type="text"
        inputMode="numeric"
        value={depInput}
        onChange={(e) =>
          setDepInput(e.target.value.replace(/\D/g, ""))
        }
      />
      {errors.dependents && <div style={errorStyle}>{errors.dependents}</div>}

      {/* INCOME */}
      <label>Annual Income</label>
      <input
        style={inputStyle}
        type="text"
        inputMode="numeric"
        value={incomeInput}
        onChange={(e) =>
          setIncomeInput(e.target.value.replace(/\D/g, ""))
        }
      />
      {errors.income && <div style={errorStyle}>{errors.income}</div>}

      {/* CASH */}
      <label>Cash Savings</label>
      <input
        style={inputStyle}
        type="text"
        inputMode="numeric"
        value={cashInput}
        onChange={(e) =>
          setCashInput(e.target.value.replace(/\D/g, ""))
        }
      />
      {errors.cash && <div style={errorStyle}>{errors.cash}</div>}

      <button
        onClick={save}
        style={{
          padding: "12px 18px",
          borderRadius: 12,
          border: "1px solid #ccc",
          cursor: "pointer",
          marginTop: 10
        }}
      >
        Save Profile
      </button>

      {saved && (
        <div style={{ marginTop: 12, color: "green" }}>
          ✓ Profile Saved Successfully
        </div>
      )}
    </div>
  );
}
