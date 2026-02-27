from fastapi import APIRouter
from pydantic import BaseModel
from typing import Any, Dict

router = APIRouter()

class RiskRequest(BaseModel):
    session: Dict[str, Any]

@router.post("/api/risk")
def risk(req: RiskRequest):
    s = req.session
    income = float(s.get("incomeAnnual", 0)) / 12.0
    expenses = sum((s.get("expensesMonthly") or {}).values())
    savings = float(s.get("savingsCash", 0))

    # optional housing
    rent = float(s.get("rentMonthly") or 0)
    mortgage = s.get("mortgage") or {}
    hoa = float(mortgage.get("hoaMonthly") or 0)
    ins = float(mortgage.get("homeInsuranceMonthly") or 0)

    # optional debts
    debts = s.get("debts") or {}
    debt_min = sum(float(v.get("minPayment") or 0) for v in debts.values())

    fixed = rent + hoa + ins + debt_min
    total_exp = expenses + fixed

    runway_months = savings / max(total_exp, 1)

    # simple stress score
    cashflow = income - total_exp
    score = 0
    score += 40 if cashflow < 0 else 0
    score += 30 if runway_months < 1 else 0
    score += 20 if runway_months < 3 else 0
    score += 10 if fixed / max(income, 1) > 0.5 else 0
    score = min(100, score)

    if score < 30:
        label = "Low"
    elif score < 60:
        label = "Moderate"
    elif score < 80:
        label = "High"
    else:
        label = "Critical"

    return {
        "risk_score": score,
        "risk_category": label,
        "monthly_income_est": round(income, 2),
        "monthly_expenses_est": round(total_exp, 2),
        "cashflow_est": round(cashflow, 2),
        "runway_months": round(runway_months, 2),
    }