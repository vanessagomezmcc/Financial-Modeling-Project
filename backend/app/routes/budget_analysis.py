from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict

router = APIRouter()

# --- National Recommended Budget (50/30/20 adjusted model) ---
NATIONAL_RECOMMENDED = {
    "rent": 0.30,
    "mortgage": 0.25,
    "car": 0.10,
    "insurance": 0.08,
    "childcare": 0.10,
    "debts": 0.10,
}

# --- State Cost-of-Living Multipliers ---
STATE_COL = {
    "AL": 0.901,  # Alabama
    "AK": 1.023,  # Alaska
    "AZ": 1.007,  # Arizona
    "AR": 0.869,  # Arkansas
    "CA": 1.107,  # California
    "CO": 1.019,  # Colorado
    "CT": 1.046,  # Connecticut
    "DE": 0.988,  # Delaware
    "DC": 1.110,  # District of Columbia
    "FL": 1.036,  # Florida
    "GA": 0.965,  # Georgia
    "HI": 1.097,  # Hawaii
    "ID": 0.922,  # Idaho
    "IL": 0.988,  # Illinois
    "IN": 0.921,  # Indiana
    "IA": 0.888,  # Iowa
    "KS": 0.899,  # Kansas
    "KY": 0.899,  # Kentucky
    "LA": 0.887,  # Louisiana
    "ME": 0.980,  # Maine
    "MD": 1.046,  # Maryland
    "MA": 1.076,  # Massachusetts
    "MI": 0.943,  # Michigan
    "MN": 0.983,  # Minnesota
    "MS": 0.868,  # Mississippi
    "MO": 0.911,  # Missouri
    "MT": 0.910,  # Montana
    "NE": 0.903,  # Nebraska
    "NV": 0.979,  # Nevada
    "NH": 1.054,  # New Hampshire
    "NJ": 1.089,  # New Jersey
    "NM": 0.909,  # New Mexico
    "NY": 1.078,  # New York
    "NC": 0.944,  # North Carolina
    "ND": 0.882,  # North Dakota
    "OH": 0.919,  # Ohio
    "OK": 0.887,  # Oklahoma
    "OR": 1.048,  # Oregon
    "PA": 0.974,  # Pennsylvania
    "RI": 1.020,  # Rhode Island
    "SC": 0.935,  # South Carolina
    "SD": 0.882,  # South Dakota
    "TN": 0.921,  # Tennessee
    "TX": 0.971,  # Texas
    "UT": 0.957,  # Utah
    "VT": 0.971,  # Vermont
    "VA": 1.013,  # Virginia
    "WA": 1.084,  # Washington
    "WV": 0.896,  # West Virginia
    "WI": 0.932,  # Wisconsin
    "WY": 0.915,  # Wyoming
}

class BudgetRequest(BaseModel):
    state: str
    monthly_income: float
    expenses: Dict[str, float]


@router.post("/api/budget-analysis")
def analyze_budget(req: BudgetRequest):

    # --- Normalize State ---
    state = req.state.upper()
    col_multiplier = STATE_COL.get(state, 1.0)

    income = req.monthly_income
    expenses = req.expenses

    if income <= 0:
        return {"error": "Income must be greater than zero."}

    # --- Compute Ratios ---
    ratios = {
        k: (v / income) for k, v in expenses.items()
    }

    total_expenses = sum(expenses.values())
    housing_ratio = ratios.get("rent", 0) + ratios.get("mortgage", 0)
    debt_ratio = ratios.get("debts", 0)
    fixed_ratio = total_expenses / income

    # --- Adjust Recommended by State COL ---
    adjusted_recommended = {
        k: v * col_multiplier
        for k, v in NATIONAL_RECOMMENDED.items()
    }

    # --- Percentile Estimate (Housing vs State Avg) ---
    state_avg_housing = (
        adjusted_recommended.get("rent", 0)
        + adjusted_recommended.get("mortgage", 0)
    )

    percentile = 50

    if housing_ratio < state_avg_housing:
        percentile = int(50 - ((state_avg_housing - housing_ratio) * 100))
    else:
        percentile = int(50 + ((housing_ratio - state_avg_housing) * 100))

    percentile = max(1, min(percentile, 99))

    # ==============================
    # --- BALANCED STRICT SCORE ---
    # ==============================

    total_penalty = 0

    # 1️⃣ Housing Penalty (Cap 25)
    if housing_ratio > 0.30:
        housing_penalty = (housing_ratio - 0.30) * 150
        total_penalty += min(housing_penalty, 25)

    # 2️⃣ Debt Penalty (Cap 20)
    if debt_ratio > 0.15:
        debt_penalty = (debt_ratio - 0.15) * 180
        total_penalty += min(debt_penalty, 20)

    # 3️⃣ Fixed Cost Penalty (Cap 30)
    if fixed_ratio > 0.50:
        fixed_penalty = (fixed_ratio - 0.50) * 200
        total_penalty += min(fixed_penalty, 30)

    # 4️⃣ Category Deviation Penalty (Cap 10 per category)
    for k in NATIONAL_RECOMMENDED:
        user_val = ratios.get(k, 0)
        rec_val = adjusted_recommended.get(k, 0)
        deviation = abs(user_val - rec_val)

        if deviation > 0.05:
            deviation_penalty = deviation * 120
            total_penalty += min(deviation_penalty, 10)

    # 5️⃣ Concentration Risk (Cap 15)
    for v in ratios.values():
        if v > 0.45:
            concentration_penalty = (v - 0.45) * 200
            total_penalty += min(concentration_penalty, 15)

    # 6️⃣ Savings Adjustment
    savings_rate = 1 - fixed_ratio

    if savings_rate >= 0.25:
        total_penalty -= 5
    elif savings_rate < 0.10:
        total_penalty += 8

    # --- Final Score ---
    total_penalty = min(total_penalty, 70)  # cap total damage
    score = 100 - total_penalty
    score = max(25, min(int(score), 100))   # never below 25

    # --- Status ---
    status = "Healthy"

    if fixed_ratio > 0.60:
        status = "Overextended"
    elif fixed_ratio < 0.40:
        status = "Underutilizing income"

    return {
        "ratios": ratios,
        "housing_ratio": housing_ratio,
        "debt_ratio": debt_ratio,
        "fixed_ratio": fixed_ratio,
        "recommended": adjusted_recommended,
        "percentile": percentile,
        "score": score,
        "status": status
    }