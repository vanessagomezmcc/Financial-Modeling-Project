export type Profile = {
  age: number;
  state: string;
  filingStatus: "single" | "married";
  dependents: number;
};

export type SelectedModules = {
  rent?: boolean;
  mortgage?: boolean;
  debts?: boolean;
  car?: boolean;
  childcare?: boolean;
  insurance?: boolean;
};

export type Session = {
  profile: Profile;
  modules: SelectedModules;
  incomeAnnual: number;
  expensesMonthly: Record<string, number>;
  savingsCash: number;

  rentMonthly?: number;

  debts?: Record<string, { balance: number; apr: number; minPayment: number }>;

  mortgage?: {
    homeValue: number;
    principal: number;
    ratePct: number;
    years: number;
    propertyTaxPct: number;
    hoaMonthly?: number;
    homeInsuranceMonthly?: number;
  };
};

const KEY = "finance_session_v1";

export function loadSession(): Session | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(KEY);
  return raw ? (JSON.parse(raw) as Session) : null;
}

export function saveSession(s: Session) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(s));
}