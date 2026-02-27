"use client";

import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/")}
      style={{
        marginBottom: 30,
        padding: "10px 18px",
        borderRadius: 10,
        border: "none",
        background: "#111",
        color: "white",
        cursor: "pointer",
      }}
    >
      ← Back to Dashboard
    </button>
  );
}