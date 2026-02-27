import { FinancialProvider } from "@/lib/FinancialContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, -apple-system, sans-serif",
          background: "#f9fafb",
        }}
      >
        <FinancialProvider>
          {children}
        </FinancialProvider>
      </body>
    </html>
  );
}