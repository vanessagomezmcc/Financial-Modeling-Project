"use client";

import { useState, useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import BackButton from "@/components/BackButton";

/* ================= CONFIG ================= */

const STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","DC","FL","GA","HI","ID","IL","IN",
  "IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH",
  "NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT",
  "VT","VA","WA","WV","WI","WY"
];

const CATEGORIES = [
  "rent",
  "mortgage",
  "debts",
  "car",
  "childcare",
  "insurance"
];

const CATEGORY_COLORS: Record<string,string> = {
  rent:"#2563EB",
  mortgage:"#1D4ED8",
  debts:"#DC2626",
  car:"#F59E0B",
  childcare:"#10B981",
  insurance:"#8B5CF6"
};

const CATEGORY_INFO: Record<string, string> = {
  rent: "Monthly rent or lease payment for housing",
  mortgage: "Monthly mortgage payment including principal and interest",
  debts: "Credit card, student loan, and other debt payments",
  car: "Car payment, gas, insurance, and maintenance",
  childcare: "Daycare, babysitting, or afterschool care expenses",
  insurance: "Health, life, disability, and other insurance premiums"
};

/* ================= PAGE ================= */

export default function CategoriesPage() {

  const [state,setState] = useState("");
  const [income,setIncome] = useState("");
  const [expenses,setExpenses] = useState<Record<string,string>>({});
  const [analysis,setAnalysis] = useState<any>(null);
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState("");

  const incomeNum = Number(income) || 0;

  const totalExpenses = Object.values(expenses)
    .map(v=>Number(v)||0)
    .reduce((a,b)=>a+b,0);

  const percentUsed = incomeNum>0
    ? (totalExpenses/incomeNum)*100
    : 0;

  const remaining = incomeNum-totalExpenses;

  const toggleCategory = (cat:string)=>{
    setExpenses(prev=>{
      const copy={...prev};
      if(copy[cat]!==undefined) delete copy[cat];
      else copy[cat]="";
      return copy;
    });
  };

  const handleChange = (cat:string,val:string)=>{
    setExpenses(prev=>({
      ...prev,
      [cat]: val.replace(/\D/g,"")
    }));
  };

  const runModel = async ()=>{
    if(!state || !incomeNum){
      setError("State and income required.");
      return;
    }

    try{
      setLoading(true);
      setError("");
      setAnalysis(null);

      const res = await fetch(
        "http://127.0.0.1:8000/api/budget-analysis",
        {
          method:"POST",
          headers:{ "Content-Type":"application/json" },
          body: JSON.stringify({
            state,
            monthly_income: incomeNum,
            expenses: Object.fromEntries(
              Object.entries(expenses).map(
                ([k,v])=>[k,Number(v)||0]
              )
            )
          })
        }
      );

      const data = await res.json();

      if(!res.ok){
        throw new Error(data.error || "Model failed");
      }

      setAnalysis(data);

    }catch(err:any){
      setError(err.message || "Server error");
    }finally{
      setLoading(false);
    }
  };

  /* ================= ACTIVE CATEGORIES ================= */

  const activeCategories = useMemo(()=>{
    return CATEGORIES.filter(cat=>expenses[cat]!==undefined);
  },[expenses]);

  /* ================= RENORMALIZED RECOMMENDED ================= */

  const renormalizedRecommended = useMemo(()=>{
    if(!analysis) return {};

    const total = activeCategories.reduce((sum,cat)=>{
      return sum + (analysis.recommended?.[cat] || 0);
    },0);

    if(total===0) return {};

    const result:Record<string,number>={};

    activeCategories.forEach(cat=>{
      result[cat]=(analysis.recommended?.[cat]||0)/total;
    });

    return result;

  },[analysis,activeCategories]);

  /* ================= DYNAMIC SCORE ================= */

  const dynamicScore = useMemo(()=>{
    if(!analysis || activeCategories.length===0) return 0;

    let totalDeviation = 0;

    activeCategories.forEach(cat=>{
      const userVal = analysis.ratios?.[cat] || 0;
      const recVal = renormalizedRecommended[cat] || 0;
      totalDeviation += Math.abs(userVal-recVal);
    });

    const avgDeviation = totalDeviation/activeCategories.length;

    const score = Math.max(0,100-avgDeviation*200);

    return Math.round(score);

  },[analysis,activeCategories,renormalizedRecommended]);

  /* ================= RENDER ================= */

  return (
    <div style={pageStyle}>
      {/* Centered Back Button */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
        <BackButton />
      </div>

      <div style={{width:"100%",maxWidth:1100, margin: "0 auto"}}>

        <h1 style={titleStyle}>
          Budget Intelligence Planner
        </h1>

        {/* Intro Card */}
        <div style={introCard}>
          <div style={iconCircle}>ℹ</div>
          <div>
            <h3 style={{ margin: "0 0 8px 0", fontSize: 18, color: "#15803d" }}>
              Compare Your Spending to National Benchmarks
            </h3>
            <p style={{ margin: 0, lineHeight: 1.6, color: "#475569" }}>
              Select your expense categories and enter your monthly spending to see how 
              you compare against recommended budget allocations based on national data. 
              Get personalized insights and a financial health score to help optimize your budget.
            </p>
          </div>
        </div>

        {/* Input Card */}
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0, marginBottom: 24, color: "#15803d" }}>
            Your Budget Details
          </h2>

          <div style={grid2}>
            <div>
              <label style={labelStyle}>State</label>
              <select
                value={state}
                onChange={e=>setState(e.target.value)}
                style={inputStyle}
              >
                <option value="">Select State</option>
                {STATES.map(s=>
                  <option key={s}>{s}</option>
                )}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Monthly Income</label>
              <input
                value={income}
                onChange={e=>
                  setIncome(e.target.value.replace(/\D/g,""))
                }
                style={inputStyle}
                placeholder="e.g., 5000"
              />
            </div>
          </div>

          <div style={sectionHeader}>
            <h3 style={{ margin: 0, fontSize: 16, color: "#15803d" }}>
              Select Your Expense Categories
            </h3>
            <p style={{ margin: "4px 0 0 0", fontSize: 13, color: "#64748b" }}>
              Choose which categories apply to you and enter your monthly spending
            </p>
          </div>

          {CATEGORIES.map(cat=>(
            <div key={cat} style={categoryBox}>
              <div style={{ display: "flex", alignItems: "center", marginBottom: cat in expenses ? 12 : 0 }}>
                <input
                  type="checkbox"
                  checked={cat in expenses}
                  onChange={()=>toggleCategory(cat)}
                  style={{ marginRight: 10, cursor: "pointer" }}
                />
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: 15, textTransform: "capitalize" }}>
                    {cat}
                  </strong>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                    {CATEGORY_INFO[cat]}
                  </div>
                </div>
              </div>

              {cat in expenses && (
                <input
                  value={expenses[cat]}
                  onChange={e=>handleChange(cat,e.target.value)}
                  style={inputStyleInline}
                  placeholder={`Monthly ${cat} amount`}
                />
              )}
            </div>
          ))}

          {incomeNum>0 && activeCategories.length > 0 && (
            <div style={summaryBox}>
              <h3 style={{ marginTop: 0, fontSize: 18 }}>Budget Summary</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginTop: 16 }}>
                <div>
                  <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Total Expenses</div>
                  <div style={{ fontSize: 24, fontWeight: 700 }}>${totalExpenses.toLocaleString()}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>% of Income Used</div>
                  <div style={{ fontSize: 24, fontWeight: 700 }}>{percentUsed.toFixed(1)}%</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Remaining</div>
                  <div style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: remaining<0?"#dc2626":"#15803d"
                  }}>
                    ${remaining.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          )}

          <button onClick={runModel} style={buttonStyle} disabled={loading}>
            {loading?"Running Analysis...":"Run Financial Model"}
          </button>

          {error && (
            <div style={errorBox}>
              ⚠️ {error}
            </div>
          )}

        </div>

        {analysis && activeCategories.length>0 && (
          <>
            {/* Info Card for Results */}
            <div style={infoCardSmall}>
              <strong>How to interpret your results:</strong> The comparison shows your 
              spending allocation vs. national recommendations. Categories marked "below" 
              suggest you're spending less than average, while "above" indicates higher spending.
            </div>

            <div style={resultCard}>

              <h2 style={{ marginTop: 0, color: "#15803d" }}>
                National Benchmark Comparison
              </h2>

              <div style={{display:"flex",gap:60, justifyContent: "center", marginTop: 40}}>

                <div style={{ textAlign: "center" }}>
                  <h3 style={{ fontSize: 18, marginBottom: 20 }}>Your Allocation</h3>
                  <PieChart width={350} height={300}>
                    <Pie
                      data={activeCategories.map(cat=>({
                        name:cat,
                        value:(analysis.ratios?.[cat]||0)*100
                      }))}
                      dataKey="value"
                      outerRadius={110}
                      label={({value})=>
                        `${Number(value).toFixed(0)}%`
                      }
                    >
                      {activeCategories.map(cat=>(
                        <Cell
                          key={cat}
                          fill={CATEGORY_COLORS[cat]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </div>

                <div style={{ textAlign: "center" }}>
                  <h3 style={{ fontSize: 18, marginBottom: 20 }}>Recommended</h3>
                  <PieChart width={350} height={300}>
                    <Pie
                      data={activeCategories.map(cat=>({
                        name:cat,
                        value:(renormalizedRecommended[cat]||0)*100
                      }))}
                      dataKey="value"
                      outerRadius={110}
                      label={({value})=>
                        `${Number(value).toFixed(0)}%`
                      }
                    >
                      {activeCategories.map(cat=>(
                        <Cell
                          key={cat}
                          fill={CATEGORY_COLORS[cat]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </div>

              </div>

              <hr style={{margin:"40px 0", border: "none", borderTop: "1px solid #e5e7eb"}}/>

              <h3 style={{ color: "#15803d", fontSize: 18 }}>Category Breakdown</h3>

              <div style={comparisonTable}>
                <div style={tableHeader}>
                  <div>Category</div>
                  <div>Your %</div>
                  <div>Recommended %</div>
                  <div>Status</div>
                </div>

                {activeCategories.map(cat=>{
                  const userVal=(analysis.ratios?.[cat]||0)*100;
                  const recVal=(renormalizedRecommended[cat]||0)*100;
                  const diff=userVal-recVal;

                  return(
                    <div key={cat} style={tableRow}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          background: CATEGORY_COLORS[cat]
                        }} />
                        <span style={{ textTransform: "capitalize", fontWeight: 500 }}>
                          {cat}
                        </span>
                      </div>
                      <div style={{ fontWeight: 600 }}>{userVal.toFixed(1)}%</div>
                      <div style={{ color: "#64748b" }}>{recVal.toFixed(1)}%</div>
                      <div style={{
                        fontWeight:600,
                        color:
                          diff>0?"#dc2626":
                          diff<0?"#15803d":"#64748b"
                      }}>
                        {diff>0
                          ?`Above by ${Math.abs(diff).toFixed(1)}%`
                          :diff<0
                          ?`Below by ${Math.abs(diff).toFixed(1)}%`
                          :"On Target"}
                      </div>
                    </div>
                  );
                })}
              </div>

              <hr style={{margin:"40px 0", border: "none", borderTop: "1px solid #e5e7eb"}}/>

              <div style={scoreSection}>
                <div>
                  <h3 style={{ margin: "0 0 8px 0", color: "#15803d" }}>Financial Health Score</h3>
                  <p style={{ margin: 0, fontSize: 14, color: "#64748b" }}>
                    Based on alignment with national budget recommendations
                  </p>
                </div>
                <div style={scoreCircle}>
                  <div style={{ fontSize: 48, fontWeight: 700, color: "#15803d" }}>
                    {dynamicScore}
                  </div>
                  <div style={{ fontSize: 16, color: "#64748b" }}>/ 100</div>
                </div>
              </div>

              {dynamicScore >= 80 && (
                <div style={feedbackBoxGood}>
                  <strong>Excellent!</strong> Your spending is well-aligned with recommended budgets.
                </div>
              )}
              {dynamicScore >= 60 && dynamicScore < 80 && (
                <div style={feedbackBoxOk}>
                  <strong>Good job!</strong> Your budget is mostly on track with minor adjustments needed.
                </div>
              )}
              {dynamicScore < 60 && (
                <div style={feedbackBoxWarning}>
                  <strong>Room for improvement.</strong> Consider adjusting your spending in categories 
                  where you're significantly above recommendations.
                </div>
              )}

            </div>
          </>
        )}

      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const pageStyle:React.CSSProperties={
  minHeight:"100vh",
  background: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
  paddingTop:60,
  paddingBottom: 60,
};

const titleStyle:React.CSSProperties={
  color:"#15803d",
  borderLeft:"6px solid #15803d",
  paddingLeft:16,
  marginBottom:30,
  fontSize: 36,
  fontWeight: 700
};

const introCard: React.CSSProperties = {
  background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
  padding: 24,
  borderRadius: 16,
  marginBottom: 30,
  display: "flex",
  gap: 16,
  alignItems: "flex-start",
  border: "1px solid #bbf7d0",
};

const iconCircle: React.CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: "50%",
  background: "#15803d",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 20,
  flexShrink: 0,
};

const cardStyle:React.CSSProperties={
  background:"white",
  padding:40,
  borderRadius:20,
  boxShadow:"0 20px 60px rgba(21,128,61,0.15)",
  marginBottom:40
};

const resultCard:React.CSSProperties={
  background:"white",
  padding:40,
  borderRadius:20,
  boxShadow:"0 20px 60px rgba(21,128,61,0.15)"
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontWeight: 600,
  marginBottom: 8,
  color: "#1e293b",
  fontSize: 14,
};

const inputStyle:React.CSSProperties={
  width:"100%",
  padding:14,
  borderRadius:12,
  border:"1px solid #cbd5e1",
  fontSize: 15,
  boxSizing: "border-box"
};

const inputStyleInline:React.CSSProperties={
  width:"100%",
  padding:12,
  borderRadius:10,
  border:"1px solid #cbd5e1",
  fontSize: 15,
  boxSizing: "border-box"
};

const buttonStyle:React.CSSProperties={
  width: "100%",
  padding:"16px 24px",
  borderRadius:12,
  background:"#15803d",
  color:"white",
  border:"none",
  cursor:"pointer",
  fontWeight:600,
  fontSize: 16,
  marginTop: 10,
  transition: "background 0.2s"
};

const summaryBox:React.CSSProperties={
  background:"linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
  padding:25,
  borderRadius:16,
  marginBottom:25,
  border: "1px solid #bbf7d0"
};

const categoryBox:React.CSSProperties={
  border:"1px solid #e5e7eb",
  padding:18,
  borderRadius:12,
  marginBottom:12,
  background: "#fafafa"
};

const grid2:React.CSSProperties={
  display:"grid",
  gridTemplateColumns:"1fr 1fr",
  gap:20,
  marginBottom: 30
};

const sectionHeader: React.CSSProperties = {
  marginTop: 10,
  marginBottom: 20,
  paddingBottom: 12,
  borderBottom: "2px solid #e5e7eb"
};

const comparisonTable: React.CSSProperties = {
  marginTop: 20
};

const tableHeader: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.5fr 1fr 1fr 1.5fr",
  gap: 20,
  padding: "12px 0",
  fontWeight: 700,
  fontSize: 13,
  color: "#64748b",
  textTransform: "uppercase",
  borderBottom: "2px solid #e5e7eb",
  marginBottom: 8
};

const tableRow: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.5fr 1fr 1fr 1.5fr",
  gap: 20,
  padding: "14px 0",
  alignItems: "center",
  borderBottom: "1px solid #f1f5f9"
};

const scoreSection: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
};

const scoreCircle: React.CSSProperties = {
  width: 140,
  height: 140,
  borderRadius: "50%",
  background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
  border: "4px solid #15803d",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center"
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

const feedbackBoxGood: React.CSSProperties = {
  background: "#f0fdf4",
  border: "1px solid #86efac",
  padding: 16,
  borderRadius: 12,
  fontSize: 14,
  marginTop: 24,
  color: "#15803d"
};

const feedbackBoxOk: React.CSSProperties = {
  background: "#eff6ff",
  border: "1px solid #93c5fd",
  padding: 16,
  borderRadius: 12,
  fontSize: 14,
  marginTop: 24,
  color: "#1e40af"
};

const feedbackBoxWarning: React.CSSProperties = {
  background: "#fef2f2",
  border: "1px solid #fca5a5",
  padding: 16,
  borderRadius: 12,
  fontSize: 14,
  marginTop: 24,
  color: "#991b1b"
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