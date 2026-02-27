"use client";

import { useEffect, useMemo, useState } from "react";
import { loadSession, saveSession, Session } from "./session";

const defaultSession: Session = {
  profile: { age: 25, state: "CA", filingStatus: "single", dependents: 0 },
  modules: {},
  incomeAnnual: 80000,
  expensesMonthly: { groceries: 500, utilities: 200, dining: 250 },
  savingsCash: 3000,
  rentMonthly: 1800,
  debts: {
    creditCard: { balance: 1200, apr: 24, minPayment: 45 },
  },
  mortgage: {
    homeValue: 450000,
    principal: 360000,
    ratePct: 6.5,
    years: 30,
    propertyTaxPct: 1.1,
    hoaMonthly: 0,
    homeInsuranceMonthly: 120,
  },
};

export function useSession() {
  const [session, setSession] = useState<Session>(defaultSession);
  const [hydrated, setHydrated] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    const s = loadSession();
    if (s) setSession(s);
    setHydrated(true);
  }, []);

  const update = (patch: Partial<Session>) =>
    setSession((prev) => ({ ...prev, ...patch }));

  const save = () => {
    saveSession(session);
    setSavedAt(Date.now());
  };

  const savedText = useMemo(() => {
    if (!savedAt) return "";
    const secs = Math.round((Date.now() - savedAt) / 1000);
    return secs <= 2 ? "Profile saved ✅" : `Saved ${secs}s ago ✅`;
  }, [savedAt]);

  return { session, setSession, update, save, hydrated, savedText };
}