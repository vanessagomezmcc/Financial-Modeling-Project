"use client";

import BackButton from "@/components/BackButton";
import { useState, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend
} from "recharts";

/* ================= ORANGE THEME ================= */

const ORANGE_PRIMARY = "#f97316";
const ORANGE_DARK = "#ea580c";
const ORANGE_LIGHT = "#fb923c";
const ORANGE_BG = "#fff7ed";

export default function MortgagePage() {

  const [homePrice, setHomePrice] = useState("425000");
  const [downPayment, setDownPayment] = useState("85000");
  const [interestRate, setInterestRate] = useState("5");
  const [loanTerm, setLoanTerm] = useState("30");
  const [propertyTax, setPropertyTax] = useState("280");
  const [insurance, setInsurance] = useState("66");
  const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set());

  const price = Number(homePrice) || 0;
  const down = Number(downPayment) || 0;
  const rate = Number(interestRate) / 100 || 0;
  const years = Number(loanTerm) || 30;

  const loanAmount = price - down;
  const monthlyInterest = rate / 12;
  const totalPayments = years * 12;

  /* ================= MONTHLY PAYMENT ================= */

  const principalInterest = useMemo(() => {
    if (monthlyInterest === 0) return loanAmount / totalPayments;

    return (
      loanAmount *
      (monthlyInterest * Math.pow(1 + monthlyInterest, totalPayments)) /
      (Math.pow(1 + monthlyInterest, totalPayments) - 1)
    );
  }, [loanAmount, monthlyInterest, totalPayments]);

  const totalMonthlyPayment =
    principalInterest +
    Number(propertyTax) +
    Number(insurance);

  const paymentBreakdown = [
    { name: "Principal & Interest", value: principalInterest },
    { name: "Property Tax", value: Number(propertyTax) },
    { name: "Insurance", value: Number(insurance) }
  ];

  const COLORS = [
    ORANGE_PRIMARY,
    ORANGE_LIGHT,
    ORANGE_DARK
  ];

  /* ================= AMORTIZATION ================= */

  const amortizationData = useMemo(() => {
    let balance = loanAmount;
    let cumulativePrincipal = 0;
    let cumulativeInterest = 0;
    let yearlyData: any[] = [];

    const startYear = new Date().getFullYear();

    for (let i = 1; i <= totalPayments; i++) {

      const interestPayment = balance * monthlyInterest;
      const principalPayment = principalInterest - interestPayment;

      balance -= principalPayment;
      if (balance < 0) balance = 0;

      cumulativePrincipal += principalPayment;
      cumulativeInterest += interestPayment;

      const currentYear = startYear + Math.floor((i - 1) / 12);

      const existingYear = yearlyData.find((y) => y.year === currentYear);

      if (!existingYear) {
        yearlyData.push({
          year: currentYear,
          principalPaid: cumulativePrincipal,
          interestPaid: cumulativeInterest,
          remainingBalance: balance
        });
      } else {
        existingYear.principalPaid = cumulativePrincipal;
        existingYear.interestPaid = cumulativeInterest;
        existingYear.remainingBalance = balance;
      }

      if (balance <= 0) break;
    }

    return yearlyData;
  }, [loanAmount, monthlyInterest, totalPayments, principalInterest]);

  /* ================= DETAILED AMORTIZATION TABLE ================= */

  const detailedAmortization = useMemo(() => {
    let balance = loanAmount;
    const yearlyBreakdown: any[] = [];
    const startYear = new Date().getFullYear();

    for (let year = 0; year < years; year++) {
      let yearPrincipal = 0;
      let yearInterest = 0;

      for (let month = 1; month <= 12; month++) {
        const interestPayment = balance * monthlyInterest;
        const principalPayment = principalInterest - interestPayment;
        
        balance -= principalPayment;
        if (balance < 0) balance = 0;

        yearPrincipal += principalPayment;
        yearInterest += interestPayment;

        if (balance <= 0) break;
      }

      yearlyBreakdown.push({
        year: startYear + year,
        principal: yearPrincipal,
        interest: yearInterest,
        balance: balance
      });

      if (balance <= 0) break;
    }

    return yearlyBreakdown;
  }, [loanAmount, monthlyInterest, principalInterest, years]);

  const toggleYear = (year: number) => {
    const newExpanded = new Set(expandedYears);
    if (newExpanded.has(year)) {
      newExpanded.delete(year);
    } else {
      newExpanded.add(year);
    }
    setExpandedYears(newExpanded);
  };

  const downPaymentPercent = price > 0 ? ((down / price) * 100).toFixed(1) : "0";
  const totalInterest = (principalInterest * totalPayments) - loanAmount;

  return (
    <div style={{ minHeight: "100vh", background: ORANGE_BG, paddingBottom: 60 }}>
      {/* Centered BackButton */}
      <div style={{ display: "flex", justifyContent: "center", paddingTop: 60, marginBottom: 20 }}>
        <BackButton />
      </div>

      {/* Main content */}
      <div style={{ width: "100%", maxWidth: 1000, margin: "0 auto", padding: "0 40px" }}>
        
        <h1 style={{
          color: ORANGE_PRIMARY,
          borderLeft: `6px solid ${ORANGE_PRIMARY}`,
          paddingLeft: 16,
          marginBottom: 30,
          fontSize: 36,
          fontWeight: 700
        }}>
          Mortgage Calculator
        </h1>

        {/* Intro Card */}
        <div style={introCard}>
          <div style={iconCircle}>ℹ</div>
          <div>
            <h3 style={{ margin: "0 0 8px 0", fontSize: 18, color: "#c2410c" }}>
              Plan Your Home Purchase
            </h3>
            <p style={{ margin: 0, lineHeight: 1.6, color: "#475569" }}>
              Calculate your monthly mortgage payment including principal, interest, property tax, 
              and insurance. Visualize how your loan balance changes over time and see a detailed 
              amortization schedule to understand how much you'll pay in interest.
            </p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>

          {/* INPUT SIDE */}
          <div style={cardStyle}>
            <h2 style={{ marginTop: 0, marginBottom: 24, color: ORANGE_PRIMARY }}>
              Loan Details
            </h2>

            <FormField
              label="Home Price"
              description="The total purchase price of the property"
            >
              <Input value={homePrice} onChange={setHomePrice} />
            </FormField>

            <FormField
              label="Down Payment"
              description={`${downPaymentPercent}% of home price`}
            >
              <Input value={downPayment} onChange={setDownPayment} />
            </FormField>

            <FormField
              label="Interest Rate (%)"
              description="Annual interest rate on the loan"
            >
              <Input value={interestRate} onChange={setInterestRate} />
            </FormField>

            <FormField
              label="Loan Term (years)"
              description="Length of the mortgage (typically 15 or 30 years)"
            >
              <Input value={loanTerm} onChange={setLoanTerm} />
            </FormField>

            <FormField
              label="Property Tax (monthly)"
              description="Estimated monthly property tax"
            >
              <Input value={propertyTax} onChange={setPropertyTax} />
            </FormField>

            <FormField
              label="Insurance (monthly)"
              description="Homeowner's insurance premium"
            >
              <Input value={insurance} onChange={setInsurance} />
            </FormField>
          </div>

          {/* PAYMENT SIDE */}
          <div style={cardStyle}>
            <h2 style={{ marginTop: 0, marginBottom: 24, color: ORANGE_PRIMARY }}>
              Monthly Payment
            </h2>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>

              <PieChart width={260} height={260}>
                <Pie
                  data={paymentBreakdown}
                  dataKey="value"
                  innerRadius={70}
                  outerRadius={110}
                >
                  {paymentBreakdown.map((_, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>

              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 48, fontWeight: 700, color: ORANGE_PRIMARY }}>
                  ${totalMonthlyPayment.toLocaleString(undefined, {
                    maximumFractionDigits: 0
                  })}
                </div>
                <div style={{ fontSize: 16, color: "#64748b", marginBottom: 20 }}>per month</div>

                <div style={{ textAlign: "left", fontSize: 14, lineHeight: 1.8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 20 }}>
                    <span>Principal & Interest:</span>
                    <strong>${principalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 20 }}>
                    <span>Property Tax:</span>
                    <strong>${Number(propertyTax).toLocaleString()}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 20 }}>
                    <span>Insurance:</span>
                    <strong>${Number(insurance).toLocaleString()}</strong>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Loan Summary */}
        <div style={summaryCard}>
          <h3 style={{ margin: "0 0 20px 0", color: ORANGE_PRIMARY }}>Loan Summary</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 30 }}>
            <div>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>Loan Amount</div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>${loanAmount.toLocaleString()}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>Total Interest</div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>${totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>Total Paid</div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>
                ${((principalInterest * totalPayments) + (Number(propertyTax) + Number(insurance)) * totalPayments).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div style={infoCardSmall}>
          <strong>Understanding amortization:</strong> Early in your loan, most of your payment 
          goes toward interest. Over time, more goes toward principal as your balance decreases.
        </div>

        {/* AMORTIZATION CHART */}
        <h2 style={{ marginTop: 60, marginBottom: 20, color: ORANGE_PRIMARY }}>
          Loan Balance Over Time
        </h2>

        <div style={chartCard}>
          <ResponsiveContainer width="100%" height={450}>
            <LineChart data={amortizationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis tickFormatter={(value) => `$${Number(value).toLocaleString()}`} />
              <Tooltip formatter={(value: any) => `$${Number(value).toLocaleString()}`} />
              <Legend />

              <Line
                type="monotone"
                dataKey="principalPaid"
                stroke={ORANGE_PRIMARY}
                strokeWidth={3}
                name="Principal Paid"
                dot={false}
              />

              <Line
                type="monotone"
                dataKey="interestPaid"
                stroke={ORANGE_LIGHT}
                strokeWidth={3}
                name="Interest Paid"
                dot={false}
              />

              <Line
                type="monotone"
                dataKey="remainingBalance"
                stroke={ORANGE_DARK}
                strokeWidth={3}
                name="Loan Balance"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* AMORTIZATION TABLE */}
        <h2 style={{ marginTop: 60, marginBottom: 20, color: ORANGE_PRIMARY }}>
          Amortization Schedule Breakdown
        </h2>

        <div style={tableCard}>
          <p style={{ margin: "0 0 20px 0", color: "#64748b", fontSize: 14 }}>
            This table shows how much principal and interest are paid each year of your mortgage.
          </p>

          <div style={tableHeader}>
            <div>Year</div>
            <div>Principal</div>
            <div>Interest</div>
            <div>Remaining Balance</div>
          </div>

          {detailedAmortization.slice(0, 10).map((row, index) => (
            <div key={row.year} style={tableRow}>
              <div style={{ fontWeight: 600 }}>{row.year}</div>
              <div>${row.principal.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
              <div>${row.interest.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
              <div>${row.balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
            </div>
          ))}

          {detailedAmortization.length > 10 && (
            <div style={{ marginTop: 16, textAlign: "center", color: "#64748b", fontSize: 14 }}>
              Showing first 10 years of {detailedAmortization.length} year loan
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function FormField({ label, description, children }: any) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={labelStyle}>{label}</label>
      {description && (
        <p style={descriptionStyle}>{description}</p>
      )}
      {children}
    </div>
  );
}

function Input({ value, onChange }: any) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
      style={inputStyle}
    />
  );
}

/* ================= STYLES ================= */

const introCard: React.CSSProperties = {
  background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)",
  padding: 24,
  borderRadius: 16,
  marginBottom: 30,
  display: "flex",
  gap: 16,
  alignItems: "flex-start",
  border: "1px solid #fed7aa",
};

const iconCircle: React.CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: "50%",
  background: ORANGE_PRIMARY,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 20,
  flexShrink: 0,
};

const cardStyle: React.CSSProperties = {
  background: "white",
  padding: 30,
  borderRadius: 20,
  boxShadow: "0 20px 60px rgba(249,115,22,0.15)"
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontWeight: 600,
  marginBottom: 6,
  color: "#1e293b",
  fontSize: 14,
};

const descriptionStyle: React.CSSProperties = {
  margin: "0 0 8px 0",
  fontSize: 12,
  color: "#64748b",
  lineHeight: 1.4,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: 12,
  borderRadius: 12,
  border: "1px solid #cbd5e1",
  fontSize: 15,
  boxSizing: "border-box",
};

const summaryCard: React.CSSProperties = {
  background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)",
  padding: 30,
  borderRadius: 16,
  marginTop: 40,
  border: "1px solid #fed7aa",
};

const infoCardSmall: React.CSSProperties = {
  background: "#fffbeb",
  border: "1px solid #fcd34d",
  padding: 16,
  borderRadius: 12,
  fontSize: 14,
  lineHeight: 1.6,
  marginTop: 20,
  color: "#78350f"
};

const chartCard: React.CSSProperties = {
  background: "white",
  padding: 30,
  borderRadius: 20,
  boxShadow: "0 20px 60px rgba(249,115,22,0.15)"
};

const tableCard: React.CSSProperties = {
  background: "white",
  padding: 30,
  borderRadius: 20,
  boxShadow: "0 20px 60px rgba(249,115,22,0.15)",
  marginBottom: 40,
};

const tableHeader: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1.2fr 1.2fr 1.5fr",
  gap: 20,
  padding: "14px 0",
  fontWeight: 700,
  fontSize: 13,
  color: "#64748b",
  textTransform: "uppercase",
  borderBottom: "2px solid #e5e7eb",
  marginBottom: 8
};

const tableRow: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1.2fr 1.2fr 1.5fr",
  gap: 20,
  padding: "14px 0",
  borderBottom: "1px solid #f1f5f9",
  fontSize: 14,
  alignItems: "center"
};