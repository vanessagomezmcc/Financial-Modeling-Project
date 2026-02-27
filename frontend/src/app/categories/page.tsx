"use client";

import { useState } from "react";
import { useFinancial } from "@/lib/FinancialContext";
import { PieChart, Pie, Cell, Tooltip } from "recharts";

const CATEGORY_COLORS: Record<string, string> = {
  rent: "#2563EB",
  mortgage: "#1D4ED8",
  debts: "#DC2626",
  car: "#F59E0B",
  childcare: "#10B981",
  insurance: "#8B5CF6",
};

export default function CategoriesPage() {
  const { profile } = useFinancial();
  console.log("Profile in Categories:", profile); 

  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [expenses, setExpenses] = useState<Record<string, string>>({});
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const incomeNum = Number(monthlyIncome) || 0;
  const orderedCategories = Object.keys(CATEGORY_COLORS);

  const handleExpenseChange = (key: string, value: string) => {
    const cleaned = value.replace(/\D/g, "");
    setExpenses((prev) => ({ ...prev, [key]: cleaned }));
  };

  const toggle = (k: string) => {
    setExpenses((prev) => {
      const copy = { ...prev };
      if (copy[k] !== undefined) delete copy[k];
      else copy[k] = "";
      return copy;
    });
  };

  const totalExpenses = Object.values(expenses)
    .map((v) => Number(v) || 0)
    .reduce((a, b) => a + b, 0);

  const percentUsed = incomeNum > 0 ? (totalExpenses / incomeNum) * 100 : 0;
  const remaining = incomeNum - totalExpenses;

  const runModel = async () => {
    try {
      setLoading(true);
      setError("");
      setAnalysis(null);

      // require profile first so the correct state is always used
      if (!profile?.state) {
  return (
    <div style={{ color: "crimson", marginTop: 20 }}>
      Please complete and save your Profile first (State is required).
    </div>
  );
}

      const res = await fetch("http://127.0.0.1:8000/api/budget-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          state: profile.state, // ✅ comes from saved Profile
          monthly_income: incomeNum,
          expenses: Object.fromEntries(
            Object.entries(expenses).map(([k, v]) => [k, Number(v) || 0])
          ),
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || "Model failed to run.");
      }

      const data = await res.json();
      setAnalysis(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const userPieData = analysis
    ? orderedCategories.map((cat) => ({
        name: cat,
        value: (analysis.ratios?.[cat] || 0) * 100,
      }))
    : [];

  const recommendedPieData = analysis
    ? orderedCategories.map((cat) => ({
        name: cat,
        value: (analysis.recommended?.[cat] || 0) * 100,
      }))
    : [];

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 32 }}>
      <h1>Budget Configuration</h1>

      {/* show the state being used */}
      <div style={{ marginBottom: 12, opacity: 0.75 }}>
        Using state from Profile: <strong>{profile?.state || "Not set"}</strong>
      </div>

      {/* Monthly Income */}
      <label>Monthly Income</label>
      <input
        value={monthlyIncome}
        onChange={(e) =>
          setMonthlyIncome(
            e.target.value.replace(/\D/g, "").replace(/^0+(?=\d)/, "")
          )
        }
        placeholder="Enter monthly income"
        style={{
          width: "100%",
          padding: 14,
          borderRadius: 14,
          border: "1px solid #ddd",
          marginBottom: 28,
        }}
      />

      {/* Categories */}
      {orderedCategories.map((m) => (
        <div
          key={m}
          style={{
            border: "1px solid #eee",
            borderRadius: 16,
            padding: 18,
            marginBottom: 18,
          }}
        >
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input type="checkbox" checked={m in expenses} onChange={() => toggle(m)} />
            <strong style={{ textTransform: "capitalize" }}>{m}</strong>
          </label>

          {m in expenses && (
            <input
              value={expenses[m] || ""}
              onChange={(e) => handleExpenseChange(m, e.target.value)}
              placeholder={`Monthly ${m} cost`}
              style={{
                width: "100%",
                marginTop: 14,
                padding: 12,
                borderRadius: 12,
                border: "1px solid #ddd",
              }}
            />
          )}
        </div>
      ))}

      {/* Budget Summary */}
      {incomeNum > 0 && (
        <div
          style={{
            background: "#f8f9fa",
            padding: 24,
            borderRadius: 18,
            marginBottom: 28,
          }}
        >
          <h3>Budget Summary</h3>
          <p>Total Expenses: ${totalExpenses.toLocaleString()}</p>
          <p>% Income Used: {percentUsed.toFixed(1)}%</p>
          <p style={{ color: remaining < 0 ? "crimson" : "green", fontWeight: 600 }}>
            Remaining: ${remaining.toLocaleString()}
          </p>
        </div>
      )}

      {/* Run Button */}
      <button
        onClick={runModel}
        disabled={!incomeNum || totalExpenses === 0 || loading}
        style={{
          padding: "14px 22px",
          borderRadius: 16,
          background: loading ? "#999" : "#111",
          color: "white",
          border: "none",
          cursor: loading ? "not-allowed" : "pointer",
          fontSize: 16,
        }}
      >
        {loading ? "Running Model..." : "Run Financial Model"}
      </button>

      {error && <div style={{ color: "crimson", marginTop: 16 }}>{error}</div>}

      {/* RESULTS */}
      {analysis && (
        <div style={{ marginTop: 60 }}>
          <h2>Financial Benchmarking</h2>

          <p>
            You spend{" "}
            <strong>{(analysis.housing_ratio * 100).toFixed(1)}%</strong> of income on housing.
          </p>

          <p>
            {profile?.state} adjusted average:{" "}
            <strong>{(analysis.recommended.housing * 100).toFixed(1)}%</strong>
          </p>

          <p>
            You are in the <strong>{analysis.percentile}th percentile</strong>.
          </p>

          <p>
            You are allocating{" "}
            <strong>{(analysis.fixed_ratio * 100).toFixed(1)}%</strong> to fixed costs.
          </p>

          <p>
            Recommended range: <strong>40–50%</strong>
          </p>

          <p>
            Status: <strong>{analysis.status}</strong>
          </p>

          <hr style={{ margin: "50px 0", borderColor: "#eee" }} />

          {/* PIE CHARTS */}
          <div
            style={{
              display: "flex",
              gap: 80,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h3>User Allocation</h3>
              <PieChart width={350} height={300}>
                <Pie
                  data={userPieData}
                  dataKey="value"
                  outerRadius={110}
                  label={({ value }) => `${Number(value).toFixed(0)}%`}
                >
                  {userPieData.map((entry) => (
                    <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || "#999"} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any) => `${Number(v).toFixed(1)}%`} />
              </PieChart>
            </div>

            <div>
              <h3>Recommended Allocation</h3>
              <PieChart width={350} height={300}>
                <Pie
                  data={recommendedPieData}
                  dataKey="value"
                  outerRadius={110}
                  label={({ value }) => `${Number(value).toFixed(0)}%`}
                >
                  {recommendedPieData.map((entry) => (
                    <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || "#999"} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any) => `${Number(v).toFixed(1)}%`} />
              </PieChart>
            </div>
          </div>

          {/* COMPARISON TABLE */}
          <div style={{ marginTop: 60 }}>
            <h3>Category Comparison</h3>

            {orderedCategories.map((cat) => {
              const userVal = (analysis.ratios?.[cat] || 0) * 100;
              const recVal = (analysis.recommended?.[cat] || 0) * 100;
              const diff = userVal - recVal;

              return (
                <div
                  key={cat}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr 1fr",
                    gap: 16,
                    marginBottom: 12,
                    alignItems: "center",
                  }}
                >
                  <div style={{ color: CATEGORY_COLORS[cat], fontWeight: 600 }}>
                    {cat}
                  </div>

                  <div>{userVal.toFixed(1)}%</div>
                  <div>{recVal.toFixed(1)}%</div>

                  <div
                    style={{
                      fontWeight: 700,
                      padding: "6px 10px",
                      borderRadius: 10,
                      background: diff > 5 ? "#ffe5e5" : diff < -5 ? "#e6f7ec" : "#f4f4f4",
                      color: diff > 5 ? "#c0392b" : diff < -5 ? "#1e8449" : "#444",
                    }}
                  >
                    {diff > 0 ? "+" : ""}
                    {diff.toFixed(1)}%
                  </div>
                </div>
              );
            })}
          </div>

          {/* SCORE */}
          <div style={{ marginTop: 60 }}>
            <h3>Financial Health Score</h3>
            <div style={{ fontSize: 40, fontWeight: 700 }}>
              {analysis.score} / 100
            </div>
          </div>
        </div>
      )}
    </div>
  );
}