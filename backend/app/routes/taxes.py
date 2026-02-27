from fastapi import APIRouter
from pydantic import BaseModel
from app.tax_estimator import estimate_take_home

router = APIRouter()


class TaxRequest(BaseModel):
    wages: float
    interest: float = 0
    dividends: float = 0
    st_cap_gains: float = 0
    lt_cap_gains: float = 0
    filing_status: str
    state: str
    pre_tax_deductions: float = 0


@router.post("/api/calculate-taxes")
def calculate_taxes(req: TaxRequest):

    result = estimate_take_home(
        wages=req.wages,
        interest=req.interest,
        dividends=req.dividends,
        st_cap_gains=req.st_cap_gains,
        lt_cap_gains=req.lt_cap_gains,
        filing_status=req.filing_status,
        state=req.state,
        pre_tax_deductions=req.pre_tax_deductions,
    )

    return result