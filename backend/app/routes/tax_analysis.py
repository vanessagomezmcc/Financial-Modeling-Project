from fastapi import APIRouter
from pydantic import BaseModel
from typing import Literal

router = APIRouter()

FilingStatus = Literal[
    "single",
    "married_joint",
    "married_separate",
    "head_of_household"
]

class TaxRequest(BaseModel):
    state: str
    annual_income: float
    filing_status: FilingStatus
    dependents: int = 0


# =========================
# FEDERAL STRUCTURE
# =========================

FEDERAL_BRACKETS = {
    "single": [(11000,0.10),(44725,0.12),(95375,0.22),(182100,0.24),(231250,0.32),(578125,0.35)],
    "married_joint": [(22000,0.10),(89450,0.12),(190750,0.22),(364200,0.24),(462500,0.32),(693750,0.35)],
    "married_separate": [(11000,0.10),(44725,0.12),(95375,0.22),(182100,0.24),(231250,0.32),(346875,0.35)],
    "head_of_household": [(15700,0.10),(59850,0.12),(95350,0.22),(182100,0.24),(231250,0.32),(578100,0.35)],
}

STANDARD_DEDUCTION = {
    "single": 13850,
    "married_joint": 27700,
    "married_separate": 13850,
    "head_of_household": 20800,
}

def calculate_federal_tax(income, filing):
    tax = 0
    prev = 0
    for limit, rate in FEDERAL_BRACKETS[filing]:
        if income > limit:
            tax += (limit - prev) * rate
            prev = limit
        else:
            tax += (income - prev) * rate
            return tax
    tax += (income - prev) * 0.37
    return tax


# =========================
# STATE STRUCTURE
# =========================

NO_TAX_STATES = {
    "AK","FL","NV","SD","TN","TX","WA","WY"
}

FLAT_TAX_STATES = {
    "AZ":0.025,"CO":0.044,"GA":0.0575,"ID":0.058,
    "IL":0.0495,"IN":0.0323,"KY":0.045,"MA":0.05,
    "MI":0.0425,"NC":0.0475,"PA":0.0307,"UT":0.0485,
    "AL":0.05,"MS":0.05
}

# Simplified graduated averages
GRADUATED_STATE_AVG = {
    "CA":0.08,"NY":0.065,"NJ":0.06,"CT":0.055,"MD":0.05,
    "VA":0.05,"MN":0.055,"WI":0.053,"HI":0.07,"OR":0.065,
    "VT":0.055,"ME":0.052,"RI":0.055,"DC":0.06,
    "MO":0.048,"IA":0.05,"KS":0.05,"LA":0.05,"NE":0.05,
    "OK":0.05,"AR":0.05,"SC":0.05,"WV":0.05,
    "MT":0.055,"ND":0.045,"NM":0.048,"DE":0.052,
    "NH":0.00
}


# =========================
# MAIN ROUTE
# =========================

@router.post("/api/tax-analysis")
def analyze_taxes(req: TaxRequest):

    state = req.state.upper().strip()
    if not state:
        return {"error":"State is required."}

    income = req.annual_income
    if income <= 0:
        return {"error":"Income must be positive."}

    filing = req.filing_status.lower()
    dependents = req.dependents

    # -------------------------
    # Federal
    # -------------------------
    deduction = STANDARD_DEDUCTION[filing]
    taxable_income = max(income - deduction,0)

    federal_tax = calculate_federal_tax(taxable_income, filing)

    child_credit = dependents * 2000
    federal_tax = max(federal_tax - child_credit,0)

    # -------------------------
    # FICA
    # -------------------------
    social_security = min(income,160200) * 0.062
    medicare = income * 0.0145
    additional_medicare = 0

    if filing == "married_joint":
        threshold = 250000
    elif filing == "married_separate":
        threshold = 125000
    else:
        threshold = 200000

    if income > threshold:
        additional_medicare = (income - threshold) * 0.009

    fica = social_security + medicare + additional_medicare

    # -------------------------
    # State
    # -------------------------
    if state in NO_TAX_STATES:
        state_tax = 0
        state_type = "No Income Tax"

    elif state in FLAT_TAX_STATES:
        state_tax = income * FLAT_TAX_STATES[state]
        state_type = "Flat Tax"

    elif state in GRADUATED_STATE_AVG:
        state_tax = income * GRADUATED_STATE_AVG[state]
        state_type = "Graduated (avg applied)"

    else:
        state_tax = income * 0.05
        state_type = "Estimated"

    # -------------------------
    # Final
    # -------------------------
    total_tax = federal_tax + state_tax + fica
    net_income = income - total_tax

    return {
        "federal_tax_annual": round(federal_tax,2),
        "state_tax_annual": round(state_tax,2),
        "fica_annual": round(fica,2),
        "total_tax_annual": round(total_tax,2),
        "net_income_annual": round(net_income,2),

        "federal_tax_monthly": round(federal_tax/12,2),
        "state_tax_monthly": round(state_tax/12,2),
        "fica_monthly": round(fica/12,2),
        "total_tax_monthly": round(total_tax/12,2),
        "net_income_monthly": round(net_income/12,2),

        "effective_rate": round((total_tax/income)*100,2),
        "state_type": state_type,
        "taxable_income": round(taxable_income,2)
    }