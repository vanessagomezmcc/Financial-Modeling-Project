"use client";

import { createContext, useContext, useState, useEffect } from "react";

interface Profile {
  state: string;
  filingStatus: string;
  age: number;
  dependents: number;
  incomeAnnual: number;
  savingsCash: number;
}

interface FinancialContextType {
  profile: Profile | null;
  setProfile: (profile: Profile) => void;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export const FinancialProvider = ({ children }: { children: React.ReactNode }) => {
  const [profile, setProfileState] = useState<Profile | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("profile");
    if (stored) {
      setProfileState(JSON.parse(stored));
    }
  }, []);

  // Save to localStorage whenever profile changes
  const setProfile = (newProfile: Profile) => {
    setProfileState(newProfile);
    localStorage.setItem("profile", JSON.stringify(newProfile));
  };

  return (
    <FinancialContext.Provider value={{ profile, setProfile }}>
      {children}
    </FinancialContext.Provider>
  );
};

export const useFinancial = () => {
  const context = useContext(FinancialContext);
  if (!context) {
    throw new Error("useFinancial must be used inside FinancialProvider");
  }
  return context;
};