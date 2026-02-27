from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict
from app.data.state_recommendations import STATE_RECOMMENDATIONS

router = APIRouter()


class BudgetRequest(BaseModel):
    state: str
    monthly_income: float
    expenses: Dict[str, float]


@router.post("/api/budget-analysis")
def analyze_budget(req: BudgetRequest):

    # -------------------------
    # Normalize State
    # -------------------------
    state = req.state.upper()
    if state not in STATE_RECOMMENDATIONS:
        state = "US"

    adjusted_recommended = STATE_RECOMMENDATIONS[state]

    income = req.monthly_income
    expenses = req.expenses or {}

    if income <= 0:
        return {"error": "Income must be greater than zero."}

    # -------------------------
    # Ensure Taxes Exists
    # -------------------------
    taxes = expenses.get("taxes", 0)
    expenses["taxes"] = taxes

    # -------------------------
    # Compute Totals
    # -------------------------
    total_expenses = sum(expenses.values())
    savings = income - total_expenses

    # -------------------------
    # Compute Ratios
    # -------------------------
    ratios = {
        k: round(v / income, 4)
        for k, v in expenses.items()
    }

    housing_ratio = ratios.get("rent", 0) + ratios.get("mortgage", 0)
    debt_ratio = ratios.get("debts", 0)
    fixed_ratio = round(total_expenses / income, 4)

    # -------------------------
    # Recommended Housing
    # -------------------------
    recommended_housing = (
        adjusted_recommended.get("rent", 0)
        + adjusted_recommended.get("mortgage", 0)
    )

    # -------------------------
    # Percentile Estimate
    # -------------------------
    percentile = 50
    if housing_ratio < recommended_housing:
        percentile = int(50 - ((recommended_housing - housing_ratio) * 100))
    else:
        percentile = int(50 + ((housing_ratio - recommended_housing) * 100))

    percentile = max(1, min(percentile, 99))

    # =============================
    # SCORING MODEL
    # =============================

    total_penalty = 0

    # Housing penalty (cap 25)
    if housing_ratio > 0.30:
        total_penalty += min((housing_ratio - 0.30) * 150, 25)

    # Debt penalty (cap 20)
    if debt_ratio > 0.15:
        total_penalty += min((debt_ratio - 0.15) * 180, 20)

    # Fixed cost penalty (cap 30)
    if fixed_ratio > 0.50:
        total_penalty += min((fixed_ratio - 0.50) * 200, 30)

    # Overspending penalty (cap 10 per category)
    for k in adjusted_recommended:
        user_val = ratios.get(k, 0)
        rec_val = adjusted_recommended.get(k, 0)

        if user_val > rec_val + 0.05:
            deviation = user_val - rec_val
            total_penalty += min(deviation * 120, 10)

    # Concentration risk (cap 15)
    for v in ratios.values():
        if v > 0.45:
            total_penalty += min((v - 0.45) * 200, 15)

    # Savings adjustment
    savings_rate = 1 - fixed_ratio
    if savings_rate >= 0.25:
        total_penalty -= 5
    elif savings_rate < 0.10:
        total_penalty += 8

    total_penalty = min(total_penalty, 70)

    score = 100 - total_penalty
    score = max(25, min(int(score), 100))

    # -------------------------
    # Status
    # -------------------------
    status = "Healthy"
    if fixed_ratio > 0.60:
        status = "Overextended"
    elif fixed_ratio < 0.40:
        status = "Underutilizing income"

    # -------------------------
    # RESPONSE
    # -------------------------
    return {
        "ratios": ratios,
        "total_expenses": round(total_expenses, 2),
        "savings": round(savings, 2),
        "housing_ratio": round(housing_ratio, 4),
        "debt_ratio": round(debt_ratio, 4),
        "fixed_ratio": fixed_ratio,
        "recommended": adjusted_recommended,
        "recommended_housing": round(recommended_housing, 4),
        "percentile": percentile,
        "score": score,
        "status": status
    }