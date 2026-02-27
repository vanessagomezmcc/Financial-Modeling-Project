from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class TaxesRequest(BaseModel):
    state: str
    filing_status: str
    income_annual: float

@router.post("/api/taxes")
def calc_taxes(req: TaxesRequest):
    state_rate = {"CA": 0.09, "NY": 0.065, "TX": 0.0, "FL": 0.0}.get(req.state, 0.05)
    fed_rate = 0.22
    fica_rate = 0.0765

    annual_tax = req.income_annual * (fed_rate + state_rate + fica_rate)
    net_annual = req.income_annual - annual_tax

    return {
        "annual_tax": round(annual_tax, 2),
        "net_annual": round(net_annual, 2),
        "net_monthly": round(net_annual / 12, 2),
        "effective_tax_rate": round(annual_tax / req.income_annual, 4),
    }