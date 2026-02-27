from fastapi import APIRouter
from pydantic import BaseModel
from typing import Any, Dict
import random

router = APIRouter()

class SimRequest(BaseModel):
    session: Dict[str, Any]
    months: int = 12
    runs: int = 500

@router.post("/api/simulate")
def simulate(req: SimRequest):
    s = req.session
    base_income = float(s.get("incomeAnnual", 0)) / 12.0
    base_exp = sum((s.get("expensesMonthly") or {}).values())
    savings0 = float(s.get("savingsCash", 0))

    rent = float(s.get("rentMonthly") or 0)
    mortgage = s.get("mortgage") or {}
    hoa = float(mortgage.get("hoaMonthly") or 0)
    ins = float(mortgage.get("homeInsuranceMonthly") or 0)

    debts = s.get("debts") or {}
    debt_min = sum(float(v.get("minPayment") or 0) for v in debts.values())
    fixed = rent + hoa + ins + debt_min
    base_total = base_exp + fixed

    distress = 0
    ending_savings = []

    for _ in range(req.runs):
        savings = savings0
        for _m in range(req.months):
            income = base_income
            exp = base_total

            # shocks
            if random.random() < 0.06:  # income shock
                income *= random.uniform(0.3, 0.8)
            if random.random() < 0.08:  # expense spike
                exp += random.uniform(200, 1500)

            savings += (income - exp)

            if savings < 0:
                distress += 1
                break

        ending_savings.append(savings)

    prob = distress / max(req.runs, 1)
    avg_end = sum(ending_savings) / max(len(ending_savings), 1)

    return {
        "runs": req.runs,
        "months": req.months,
        "distress_probability": round(prob, 4),
        "avg_ending_savings": round(avg_end, 2),
    }