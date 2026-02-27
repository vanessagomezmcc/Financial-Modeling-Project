from fastapi import APIRouter
from pydantic import BaseModel
from typing import Any, Dict

router = APIRouter()

class RelocateRequest(BaseModel):
    session: Dict[str, Any]
    to_state: str

@router.post("/api/relocate")
def relocate(req: RelocateRequest):
    s = req.session
    income_annual = float(s.get("incomeAnnual", 0))
    from_state = (s.get("profile") or {}).get("state", "CA")
    to_state = req.to_state.upper()

    rates = {"CA": 0.09, "NY": 0.065, "TX": 0.0, "FL": 0.0}
    from_rate = rates.get(str(from_state).upper(), 0.05)
    to_rate = rates.get(to_state, 0.05)

    fed = 0.22
    fica = 0.0765

    from_tax = income_annual * (fed + fica + from_rate)
    to_tax = income_annual * (fed + fica + to_rate)

    return {
        "from_state": from_state,
        "to_state": to_state,
        "net_annual_from": round(income_annual - from_tax, 2),
        "net_annual_to": round(income_annual - to_tax, 2),
        "delta_net_annual": round((income_annual - to_tax) - (income_annual - from_tax), 2),
        "note": "Next upgrade: state brackets + cost of living."
    }