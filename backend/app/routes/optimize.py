from fastapi import APIRouter
from pydantic import BaseModel
from typing import Any, Dict

router = APIRouter()

class OptRequest(BaseModel):
    session: Dict[str, Any]

@router.post("/api/optimize")
def optimize(req: OptRequest):
    s = req.session
    expenses = s.get("expensesMonthly") or {}
    # pick top 2 discretionary-like categories if present
    candidates = ["dining", "entertainment", "shopping", "subscriptions", "travel"]
    recs = []

    for c in candidates:
        if c in expenses and expenses[c] > 0:
            recs.append({"action": f"Reduce {c}", "suggested_change": f"-{int(expenses[c]*0.2)} / month", "reason": "Lower variable spend improves runway."})

    if not recs:
        recs.append({"action": "Build emergency fund", "suggested_change": "+$200 / month", "reason": "Runway months is the strongest buffer."})

    return {
        "recommendations": recs[:3],
        "note": "These are baseline suggestions. Next we’ll add constrained optimization."
    }