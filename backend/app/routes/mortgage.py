from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class MortgageRequest(BaseModel):
    principal: float
    rate_pct: float
    years: int
    home_value: float
    property_tax_pct: float
    hoa_monthly: float = 0
    home_insurance_monthly: float = 0

@router.post("/api/mortgage")
def mortgage(req: MortgageRequest):
    r = req.rate_pct / 100 / 12
    n = req.years * 12

    if r == 0:
        pi = req.principal / n
    else:
        pi = req.principal * (r * (1 + r) ** n) / ((1 + r) ** n - 1)

    prop_tax_monthly = (req.home_value * (req.property_tax_pct / 100)) / 12
    total_monthly = pi + prop_tax_monthly + req.hoa_monthly + req.home_insurance_monthly

    return {
        "pi_monthly": round(pi, 2),
        "property_tax_monthly": round(prop_tax_monthly, 2),
        "hoa_monthly": round(req.hoa_monthly, 2),
        "home_insurance_monthly": round(req.home_insurance_monthly, 2),
        "total_monthly": round(total_monthly, 2),
    }