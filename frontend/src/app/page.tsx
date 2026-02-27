"use client";

import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();

  return (
    <div style={pageWrapper}>
      <div style={container}>
        <h1 style={title}>Financial Risk Platform</h1>
        
        {/* Welcome Intro */}
        <div style={introSection}>
          <p style={introText}>
            Welcome to your comprehensive financial planning toolkit. 
            This platform helps you analyze your financial health, plan for the future, 
            and make informed decisions about taxes, spending, and homeownership.
          </p>
        </div>

        {/* Cards Grid */}
        <div style={grid}>
          <Card
            title="Profile"
            description="Enter your personal and financial details."
            color="#2563EB"
            onClick={() => router.push("/profile")}
          />

          <Card
            title="Categories"
            description="Analyze spending and compare to benchmarks."
            color="#16A34A"
            onClick={() => router.push("/categories")}
          />

          <Card
            title="Taxes"
            description="Calculate federal and state tax breakdown."
            color="#DC2626"
            onClick={() => router.push("/taxes")}
          />

          <Card
            title="Mortgage Calculator"
            description="Estimate payments and affordability."
            color="#F97316"
            onClick={() => router.push("/mortgage")}
          />
        </div>

        {/* Footer Credits */}
        <footer style={footer}>
          <div style={footerDivider} />
          <div style={footerContent}>
            <h3 style={footerTitle}>About This Platform</h3>
            <p style={footerDescription}>
              The Financial Risk Platform is a portfolio project designed to help users 
              manage their financial health through interactive tools for budgeting, tax 
              calculation, spending analysis, and mortgage planning. Built with modern 
              web technologies to provide real-time financial insights.
            </p>
            <p style={credits}>
              Created by <strong>Vanessa Gomez</strong> • 2026
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

function Card({
  title,
  description,
  color,
  onClick,
}: {
  title: string;
  description: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        background: color,
        borderRadius: 20,
        padding: 50,
        color: "white",
        cursor: "pointer",
        textAlign: "center",
        boxShadow: "0 15px 30px rgba(0,0,0,0.15)",
        transition: "transform 0.2s, box-shadow 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-5px)";
        e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.2)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 15px 30px rgba(0,0,0,0.15)";
      }}
    >
      <h2 style={{ marginBottom: 15, fontSize: 28 }}>{title}</h2>
      <p style={{ fontSize: 16, lineHeight: 1.5 }}>{description}</p>
    </div>
  );
}

/* ============ STYLES ============ */

const pageWrapper = {
  minHeight: "100vh",
  background: `
    linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%),
    repeating-linear-gradient(
      45deg,
      transparent,
      transparent 10px,
      rgba(255,255,255,.03) 10px,
      rgba(255,255,255,.03) 20px
    )
  `,
  backgroundBlendMode: "overlay",
  position: "relative" as const,
  paddingBottom: 60,
};

const container = {
  maxWidth: 1100,
  margin: "0 auto",
  padding: "80px 40px",
  textAlign: "center" as const,
};

const title = {
  fontSize: 48,
  marginBottom: 20,
  fontWeight: 700,
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};

const introSection = {
  maxWidth: 700,
  margin: "0 auto 60px",
  padding: "0 20px",
};

const introText = {
  fontSize: 18,
  lineHeight: 1.7,
  color: "#4a5568",
  margin: 0,
};

const grid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 40,
  marginBottom: 80,
};

const footer = {
  marginTop: 80,
};

const footerDivider = {
  height: 1,
  background: "linear-gradient(to right, transparent, #cbd5e0, transparent)",
  marginBottom: 40,
};

const footerContent = {
  maxWidth: 700,
  margin: "0 auto",
  padding: "0 20px",
};

const footerTitle = {
  fontSize: 22,
  fontWeight: 600,
  color: "#2d3748",
  marginBottom: 15,
};

const footerDescription = {
  fontSize: 15,
  lineHeight: 1.7,
  color: "#4a5568",
  marginBottom: 20,
};

const credits = {
  fontSize: 14,
  color: "#718096",
  margin: 0,
};