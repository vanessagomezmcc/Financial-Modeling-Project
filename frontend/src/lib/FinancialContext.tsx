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
  taxData: any;
  setTaxData: (data: any) => void;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export const FinancialProvider = ({ children }: { children: React.ReactNode }) => {
  const [profile, setProfileState] = useState<Profile | null>(null);
  const [taxData, setTaxDataState] = useState<any>(null);

  useEffect(() => {
    const storedProfile = localStorage.getItem("profile");
    const storedTax = localStorage.getItem("taxData");

    if (storedProfile) setProfileState(JSON.parse(storedProfile));
    if (storedTax) setTaxDataState(JSON.parse(storedTax));
  }, []);

  const setProfile = (newProfile: Profile) => {
    setProfileState(newProfile);
    localStorage.setItem("profile", JSON.stringify(newProfile));
  };

  const setTaxData = (data: any) => {
    setTaxDataState(data);
    localStorage.setItem("taxData", JSON.stringify(data));
  };

  return (
    <FinancialContext.Provider
      value={{
        profile,
        setProfile,
        taxData,
        setTaxData
      }}
    >
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