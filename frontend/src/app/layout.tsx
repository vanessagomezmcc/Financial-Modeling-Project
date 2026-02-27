import { FinancialProvider } from "@/lib/FinancialContext";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const tabs = [
    ["Profile", "/profile"],
    ["Categories", "/categories"],
    ["Taxes", "/taxes"],
    ["Mortgage", "/mortgage"],
    ["Risk", "/risk"],
    ["Monte Carlo", "/simulate"],
    ["Optimization", "/optimize"],
    ["Relocation", "/relocate"],
    ["Life Events", "/life-events"],
  ];

  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui", margin: 0, background: "#fafafa" }}>
        <FinancialProvider>

          <div style={{ padding: 16, borderBottom: "1px solid #eee", background: "white" }}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {tabs.map(([label, href]) => (
                <a key={href} href={href} style={{ textDecoration: "none", color: "#111" }}>
                  <span style={{
                    padding: "8px 12px",
                    border: "1px solid #ddd",
                    borderRadius: 14,
                    background: "white",
                    boxShadow: "0 1px 0 rgba(0,0,0,0.03)"
                  }}>
                    {label}
                  </span>
                </a>
              ))}
            </div>
          </div>

          <main style={{ padding: 20, maxWidth: 900, margin: "0 auto" }}>
            {children}
          </main>

        </FinancialProvider>
      </body>
    </html>
  );
}