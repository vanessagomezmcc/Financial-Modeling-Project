"""
tax_estimator.py

Purpose
-------
A pragmatic, website-friendly US take‑home pay estimator that includes:

1) Individual Income Tax (Federal + estimated State) on:
   - Earned income (wages)
   - Unearned income (interest, ordinary dividends)
   - Capital gains (short-term treated as ordinary; long-term uses LTCG brackets)

2) Payroll Taxes (FICA) on wages:
   - Social Security: 6.2% up to the annual wage base
   - Medicare: 1.45% on all wages
   - Additional Medicare: +0.9% above a threshold (by filing status)

3) Capital Gains Tax (Federal):
   - Long-term capital gains (0% / 15% / 20%) using the "stacking" method
   - Short-term capital gains treated as ordinary income

Data Notes (IMPORTANT)
----------------------
- Federal ordinary income brackets (2025) come from the IRS.
- Federal standard deduction amounts (2025) come from IRS guidance.
- Social Security wage base values come from SSA.
- State taxes here are *estimates*:
    * For "flat tax" states: we use the flat rate.
    * For progressive states: we approximate an effective rate using a min/max
      rate range and the top-bracket threshold.
  This is good for "ballpark" take‑home calculations in a product UI, but it is
  not a substitute for a true state-by-state bracket + deduction + credit engine.

You should add:
- State-specific deductions/exemptions/credits
- Local taxes (NYC, SF, etc.)
- SALT limitations, AMT, NIIT (3.8%), SE taxes for 1099 income, etc.
as your product needs grow.

Quick Start
-----------
from tax_estimator import estimate_take_home

result = estimate_take_home(
    wages=120_000,
    interest=500,
    dividends=1_000,
    st_cap_gains=0,
    lt_cap_gains=5_000,
    filing_status="single",
    state="CA",
)

print(result["net_annual"], result["net_monthly"])
print(result["breakdown"])
print(result["insights"])

License: MIT-like (use freely, at your own risk).
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List, Literal, Optional, Tuple

FilingStatus = Literal["single", "married_joint", "married_separate", "head_of_household"]


# ----------------------------
# Federal: 2025 brackets (IRS)
# ----------------------------
# Brackets are defined on TAXABLE INCOME (after deductions), as:
# (upper_limit, rate). The last bracket has upper_limit = None.
FEDERAL_ORDINARY_BRACKETS_2025: Dict[FilingStatus, List[Tuple[Optional[float], float]]] = {
    "single": [
        (11_925, 0.10),
        (48_475, 0.12),
        (103_350, 0.22),
        (197_300, 0.24),
        (250_525, 0.32),
        (626_350, 0.35),
        (None, 0.37),
    ],
    "married_joint": [
        (23_850, 0.10),
        (96_950, 0.12),
        (206_700, 0.22),
        (394_600, 0.24),
        (501_050, 0.32),
        (751_600, 0.35),
        (None, 0.37),
    ],
    "married_separate": [
        (11_925, 0.10),
        (48_475, 0.12),
        (103_350, 0.22),
        (197_300, 0.24),
        (250_525, 0.32),
        (375_800, 0.35),
        (None, 0.37),
    ],
    "head_of_household": [
        (17_000, 0.10),
        (64_850, 0.12),
        (103_350, 0.22),
        (197_300, 0.24),
        (250_500, 0.32),
        (626_350, 0.35),
        (None, 0.37),
    ],
}

# Standard deduction (2025) - IRS guidance
FEDERAL_STANDARD_DEDUCTION_2025: Dict[FilingStatus, float] = {
    "single": 15_750,
    "married_joint": 31_500,
    "married_separate": 15_750,
    "head_of_household": 23_625,
}

# Federal long-term capital gains (LTCG) brackets (2025): thresholds are on *total taxable income*
# using the stacking method.
FEDERAL_LTCG_THRESHOLDS_2025: Dict[FilingStatus, Tuple[float, float]] = {
    # (top_of_0_percent, top_of_15_percent); above that is 20%
    "single": (48_350, 533_400),
    "married_separate": (48_350, 300_000),
    "head_of_household": (64_750, 566_700),
    "married_joint": (96_700, 600_050),
}

# FICA (employee share)
SS_RATE = 0.062
MEDICARE_RATE = 0.0145
ADDL_MEDICARE_RATE = 0.009

# Social Security wage base (SSA) for 2025.
SS_WAGE_BASE_2025 = 176_100

# Additional Medicare threshold by filing status (IRS rules)
ADDL_MEDICARE_THRESHOLD: Dict[FilingStatus, float] = {
    "single": 200_000,
    "head_of_household": 200_000,
    "married_joint": 250_000,
    "married_separate": 125_000,
}


# ---------------------------------------
# State tax model (simple + explainable)
# ---------------------------------------
@dataclass(frozen=True)
class StateTaxSpec:
    """Simple state income tax specification for an *estimate*.

    type:
      - "none": no broad wage income tax
      - "flat": one flat rate
      - "range": progressive; approximate effective rate using min/max and top bracket threshold
    """
    type: Literal["none", "flat", "range"]
    flat_rate: float = 0.0
    min_rate: float = 0.0
    max_rate: float = 0.0
    top_bracket_threshold: float = 0.0  # used only for "range"


# Derived primarily from Paycom's 2025 state income tax overview (min/max rate ranges and a rough top-bracket size).
# For production: replace this with a full bracket table per state.
STATE_TAX_2025: Dict[str, StateTaxSpec] = {
    # No broad wage income tax (note: WA has a capital gains excise tax for some high earners; not modeled here)
    "AK": StateTaxSpec("none"),
    "FL": StateTaxSpec("none"),
    "NV": StateTaxSpec("none"),
    "NH": StateTaxSpec("none"),
    "SD": StateTaxSpec("none"),
    "TN": StateTaxSpec("none"),
    "TX": StateTaxSpec("none"),
    "WA": StateTaxSpec("none"),
    "WY": StateTaxSpec("none"),

    # Flat tax states (rates are 2025-ish; confirm for your product)
    "AZ": StateTaxSpec("flat", flat_rate=0.025),
    "CO": StateTaxSpec("flat", flat_rate=0.044),
    "GA": StateTaxSpec("flat", flat_rate=0.0539),
    "IL": StateTaxSpec("flat", flat_rate=0.0495),
    "IN": StateTaxSpec("flat", flat_rate=0.03),
    "IA": StateTaxSpec("flat", flat_rate=0.038),
    "KY": StateTaxSpec("flat", flat_rate=0.04),
    "LA": StateTaxSpec("flat", flat_rate=0.03),
    "MA": StateTaxSpec("range", min_rate=0.05, max_rate=0.09, top_bracket_threshold=1_083_150),
    "MI": StateTaxSpec("flat", flat_rate=0.0425),
    "MS": StateTaxSpec("range", min_rate=0.0, max_rate=0.044, top_bracket_threshold=10_000),
    "NC": StateTaxSpec("flat", flat_rate=0.0425),
    "PA": StateTaxSpec("flat", flat_rate=0.0307),
    "UT": StateTaxSpec("flat", flat_rate=0.0455),

    # Range/progressive (min/max from Paycom ranges; top bracket threshold from Paycom "tax brackets" column)
    "AL": StateTaxSpec("range", min_rate=0.02, max_rate=0.05, top_bracket_threshold=3_000),
    "AR": StateTaxSpec("range", min_rate=0.02, max_rate=0.039, top_bracket_threshold=4_500),
    "CA": StateTaxSpec("range", min_rate=0.01, max_rate=0.133, top_bracket_threshold=1_000_000),
    "CT": StateTaxSpec("range", min_rate=0.02, max_rate=0.0699, top_bracket_threshold=500_000),
    "DE": StateTaxSpec("range", min_rate=0.022, max_rate=0.066, top_bracket_threshold=60_000),
    "HI": StateTaxSpec("range", min_rate=0.014, max_rate=0.11, top_bracket_threshold=325_000),
    "ID": StateTaxSpec("range", min_rate=0.0, max_rate=0.053, top_bracket_threshold=4_673),
    "KS": StateTaxSpec("range", min_rate=0.052, max_rate=0.0558, top_bracket_threshold=23_000),
    "ME": StateTaxSpec("range", min_rate=0.058, max_rate=0.0715, top_bracket_threshold=63_450),
    "MD": StateTaxSpec("range", min_rate=0.02, max_rate=0.0575, top_bracket_threshold=250_000),
    "MN": StateTaxSpec("range", min_rate=0.0535, max_rate=0.0985, top_bracket_threshold=198_630),
    "MO": StateTaxSpec("range", min_rate=0.02, max_rate=0.047, top_bracket_threshold=9_191),
    "MT": StateTaxSpec("range", min_rate=0.047, max_rate=0.059, top_bracket_threshold=21_100),
    "NE": StateTaxSpec("range", min_rate=0.0246, max_rate=0.052, top_bracket_threshold=38_870),
    "NJ": StateTaxSpec("range", min_rate=0.014, max_rate=0.1075, top_bracket_threshold=1_000_000),
    "NM": StateTaxSpec("range", min_rate=0.015, max_rate=0.059, top_bracket_threshold=210_000),
    "NY": StateTaxSpec("range", min_rate=0.04, max_rate=0.109, top_bracket_threshold=25_000_000),
    "ND": StateTaxSpec("range", min_rate=0.0195, max_rate=0.025, top_bracket_threshold=244_825),
    "OH": StateTaxSpec("range", min_rate=0.0275, max_rate=0.035, top_bracket_threshold=100_000),
    "OK": StateTaxSpec("range", min_rate=0.0025, max_rate=0.0475, top_bracket_threshold=7_200),
    "OR": StateTaxSpec("range", min_rate=0.0475, max_rate=0.099, top_bracket_threshold=125_000),
    "RI": StateTaxSpec("range", min_rate=0.0375, max_rate=0.0599, top_bracket_threshold=181_650),
    "SC": StateTaxSpec("range", min_rate=0.0, max_rate=0.062, top_bracket_threshold=17_830),
    "VT": StateTaxSpec("range", min_rate=0.0335, max_rate=0.0875, top_bracket_threshold=242_000),
    "VA": StateTaxSpec("range", min_rate=0.02, max_rate=0.0575, top_bracket_threshold=17_000),
    "DC": StateTaxSpec("range", min_rate=0.04, max_rate=0.1075, top_bracket_threshold=1_000_000),
    "WV": StateTaxSpec("range", min_rate=0.0222, max_rate=0.0482, top_bracket_threshold=60_000),
    "WI": StateTaxSpec("range", min_rate=0.035, max_rate=0.0765, top_bracket_threshold=323_290),
}

# Add remaining states not listed above (defaults to "range" unknown -> you should fill these for production)
# If a state isn't found, the estimator will treat state tax as 0 but will surface an insight.
ALL_STATE_CODES = {
    "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO",
    "MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC"
}
for _st in ALL_STATE_CODES:
    STATE_TAX_2025.setdefault(_st, StateTaxSpec("range", min_rate=0.0, max_rate=0.05, top_bracket_threshold=100_000))


# ----------------------------
# Core calculation utilities
# ----------------------------
def _clamp(x: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, x))


def _compute_progressive_tax(taxable_income: float, brackets: List[Tuple[Optional[float], float]]) -> float:
    """Compute tax given brackets [(upper, rate), ...]."""
    if taxable_income <= 0:
        return 0.0
    tax = 0.0
    lower = 0.0
    for upper, rate in brackets:
        if upper is None:
            # last bracket
            tax += (taxable_income - lower) * rate
            break
        if taxable_income <= upper:
            tax += (taxable_income - lower) * rate
            break
        tax += (upper - lower) * rate
        lower = upper
    return max(0.0, tax)


def _compute_fica(wages: float, filing_status: FilingStatus) -> Dict[str, float]:
    """Employee-side payroll taxes on wages."""
    wages = max(0.0, wages)
    ss_taxable = min(wages, SS_WAGE_BASE_2025)
    ss = ss_taxable * SS_RATE

    medicare = wages * MEDICARE_RATE

    addl_threshold = ADDL_MEDICARE_THRESHOLD[filing_status]
    addl_medicare = max(0.0, wages - addl_threshold) * ADDL_MEDICARE_RATE

    return {
        "social_security": ss,
        "medicare": medicare,
        "additional_medicare": addl_medicare,
        "fica_total": ss + medicare + addl_medicare,
    }


def _compute_federal_ltcg_tax(
    ordinary_taxable: float,
    lt_cap_gains: float,
    filing_status: FilingStatus,
) -> float:
    """Compute federal long-term capital gains tax using stacking."""
    if lt_cap_gains <= 0:
        return 0.0

    top0, top15 = FEDERAL_LTCG_THRESHOLDS_2025[filing_status]

    # Total taxable income includes ordinary + LTCG.
    total_taxable = ordinary_taxable + lt_cap_gains

    # Portion of LTCG taxed at 0% fills up to top0 after ordinary income.
    zero_room = max(0.0, top0 - ordinary_taxable)
    taxed_0 = min(lt_cap_gains, zero_room)

    # Portion taxed at 15% fills up to top15.
    remaining = lt_cap_gains - taxed_0
    fifteen_room = max(0.0, top15 - max(ordinary_taxable, top0))
    taxed_15 = min(remaining, fifteen_room)

    remaining -= taxed_15
    taxed_20 = max(0.0, remaining)

    return taxed_0 * 0.0 + taxed_15 * 0.15 + taxed_20 * 0.20


def _estimate_state_effective_rate(state: str, income: float) -> Tuple[float, str]:
    """Return (effective_rate, explanation)."""
    st = (state or "").strip().upper()
    spec = STATE_TAX_2025.get(st)
    if spec is None:
        return 0.0, f"State '{state}' not recognized; state tax assumed 0."

    if spec.type == "none":
        return 0.0, f"{st}: no broad wage income tax modeled."
    if spec.type == "flat":
        return spec.flat_rate, f"{st}: flat income tax rate ~{spec.flat_rate*100:.2f}%."
    # progressive / range: approximate effective rate between min and max.
    if income <= 0:
        return 0.0, f"{st}: no taxable income, state tax 0."

    # A smooth curve that rises from min->max as income approaches and exceeds the top threshold.
    # This mimics "effective rate increases with income" without requiring full brackets.
    t = max(1.0, spec.top_bracket_threshold)
    x = income / t
    # Saturating curve: 0 at x=0, approaches 1 as x grows.
    s = 1.0 - (2.718281828 ** (-3.0 * x))
    eff = spec.min_rate + (spec.max_rate - spec.min_rate) * _clamp(s, 0.0, 1.0)

    return eff, f"{st}: progressive estimate using ~{spec.min_rate*100:.2f}% to {spec.max_rate*100:.2f}% range."


def _safe_status(status: str) -> FilingStatus:
    s = (status or "").strip().lower()
    mapping = {
        "single": "single",
        "mfj": "married_joint",
        "married_joint": "married_joint",
        "married filing jointly": "married_joint",
        "mfs": "married_separate",
        "married_separate": "married_separate",
        "married filing separately": "married_separate",
        "hoh": "head_of_household",
        "head": "head_of_household",
        "head_of_household": "head_of_household",
        "head of household": "head_of_household",
    }
    if s not in mapping:
        raise ValueError(f"Unknown filing_status '{status}'. Use: single, married_joint, married_separate, head_of_household.")
    return mapping[s]  # type: ignore[return-value]


# ----------------------------
# Public API
# ----------------------------
def estimate_take_home(
    wages: float,
    interest: float = 0.0,
    dividends: float = 0.0,
    st_cap_gains: float = 0.0,
    lt_cap_gains: float = 0.0,
    filing_status: str = "single",
    state: str = "CA",
    pre_tax_deductions: float = 0.0,
    itemized_deductions: Optional[float] = None,
) -> Dict[str, object]:
    """
    Estimate annual and monthly after-tax income.

    Parameters
    ----------
    wages : annual W-2 wages
    interest, dividends : annual ordinary investment income (simplified as ordinary income)
    st_cap_gains : short-term capital gains (treated as ordinary income)
    lt_cap_gains : long-term capital gains (uses LTCG brackets)
    filing_status : single | married_joint | married_separate | head_of_household (aliases supported)
    state : 2-letter code (e.g., CA, NY, TX) or DC
    pre_tax_deductions : (optional) 401(k), HSA, etc. Reduces ordinary income for both federal/state.
    itemized_deductions : if provided, used instead of standard deduction (federal only, simplified).

    Returns dict with:
      net_annual, net_monthly
      breakdown: detailed tax components
      insights: recommendations / caveats
    """
    fs = _safe_status(filing_status)

    wages = float(wages or 0.0)
    interest = float(interest or 0.0)
    dividends = float(dividends or 0.0)
    st_cap_gains = float(st_cap_gains or 0.0)
    lt_cap_gains = float(lt_cap_gains or 0.0)
    pre_tax_deductions = float(pre_tax_deductions or 0.0)

    gross_total = wages + interest + dividends + st_cap_gains + lt_cap_gains

    # Ordinary income (for ordinary tax brackets)
    ordinary_income = wages + interest + dividends + st_cap_gains
    ordinary_income_after_pretax = max(0.0, ordinary_income - pre_tax_deductions)

    # Federal deduction
    standard = FEDERAL_STANDARD_DEDUCTION_2025[fs]
    deduction_used = standard if itemized_deductions is None else max(0.0, float(itemized_deductions))
    ordinary_taxable = max(0.0, ordinary_income_after_pretax - deduction_used)

    # Federal ordinary income tax
    fed_ordinary_tax = _compute_progressive_tax(ordinary_taxable, FEDERAL_ORDINARY_BRACKETS_2025[fs])

    # Federal LTCG tax (stacking)
    fed_ltcg_tax = _compute_federal_ltcg_tax(ordinary_taxable, max(0.0, lt_cap_gains), fs)

    # Payroll (FICA) on wages
    fica = _compute_fica(wages=max(0.0, wages), filing_status=fs)

    # State income tax (estimate)
    state_tax_base = max(0.0, (ordinary_income_after_pretax + max(0.0, lt_cap_gains)))
    state_eff_rate, state_expl = _estimate_state_effective_rate(state, state_tax_base)
    state_income_tax = state_tax_base * state_eff_rate

    total_tax = fed_ordinary_tax + fed_ltcg_tax + fica["fica_total"] + state_income_tax
    net_annual = gross_total - total_tax
    net_monthly = net_annual / 12.0

    insights = _generate_insights(
        wages=wages,
        ordinary_income=ordinary_income,
        lt_cap_gains=lt_cap_gains,
        filing_status=fs,
        state=state,
        pre_tax_deductions=pre_tax_deductions,
        state_model_explanation=state_expl,
        deduction_used=deduction_used,
        used_standard=(itemized_deductions is None),
    )

    return {
        "gross_annual": gross_total,
        "net_annual": net_annual,
        "net_monthly": net_monthly,
        "breakdown": {
            "federal_ordinary_tax": fed_ordinary_tax,
            "federal_ltcg_tax": fed_ltcg_tax,
            "fica_total": fica["fica_total"],
            "fica_social_security": fica["social_security"],
            "fica_medicare": fica["medicare"],
            "fica_additional_medicare": fica["additional_medicare"],
            "state_income_tax_est": state_income_tax,
            "state_effective_rate_est": state_eff_rate,
            "federal_deduction_used": deduction_used,
            "ordinary_taxable_income": ordinary_taxable,
            "state_tax_base": state_tax_base,
        },
        "insights": insights,
        "assumptions": {
            "tax_year": 2025,
            "notes": [
                "State taxes are approximated (flat or min/max range). For precise results, use state brackets + deductions + credits.",
                "No local taxes modeled (city/county).",
                "No AMT/NIIT modeled. NIIT (3.8%) can apply to investment income for higher earners.",
                "Assumes interest/dividends are ordinary; qualified dividends not separately modeled.",
            ],
        },
    }


def _generate_insights(
    wages: float,
    ordinary_income: float,
    lt_cap_gains: float,
    filing_status: FilingStatus,
    state: str,
    pre_tax_deductions: float,
    state_model_explanation: str,
    deduction_used: float,
    used_standard: bool,
) -> List[str]:
    insights: List[str] = []

    # Model caveats
    st = (state or "").strip().upper()
    if st not in ALL_STATE_CODES:
        insights.append(f"State code '{state}' not recognized. I assumed 0% state income tax; you should correct the state.")
    else:
        insights.append(state_model_explanation)

    # Pretax savings
    if wages > 0 and pre_tax_deductions <= 0:
        insights.append(
            "If you have access to pre-tax accounts (401(k), 403(b), HSA), contributions can lower taxable income and increase take-home efficiency."
        )
    elif pre_tax_deductions > 0:
        insights.append("Pre-tax deductions were applied to ordinary income (simplified). Consider maxing these if possible.")

    # FICA note
    if wages > SS_WAGE_BASE_2025:
        insights.append(
            f"Social Security tax (6.2%) stops at the 2025 wage base (${SS_WAGE_BASE_2025:,.0f}); above that, only Medicare continues."
        )

    # Investment income nuance
    if lt_cap_gains > 0:
        insights.append(
            "Long-term capital gains may be taxed at 0/15/20% federally depending on your taxable income; consider gain harvesting or timing sales across years."
        )
    if ordinary_income > 0 and lt_cap_gains == 0:
        insights.append(
            "If some dividends are qualified (not modeled separately here), the real federal tax could be lower than this estimate."
        )

    # Deduction hint
    if used_standard:
        insights.append(
            f"This estimate used the federal standard deduction (${deduction_used:,.0f} for {filing_status}). Itemizing could change results."
        )
    else:
        insights.append("This estimate used your provided itemized deduction amount for federal taxable income.")

    # High-income caution
    if wages + ordinary_income + lt_cap_gains > 200_000:
        insights.append(
            "High earners may owe additional taxes not modeled here (e.g., Net Investment Income Tax 3.8%, AMT, state surtaxes). Treat this as a baseline."
        )

    return insights


if __name__ == "__main__":
    # Small CLI demo
    demo = estimate_take_home(
        wages=120_000,
        interest=500,
        dividends=1_000,
        st_cap_gains=0,
        lt_cap_gains=5_000,
        filing_status="single",
        state="CA",
        pre_tax_deductions=10_000,
    )
    import json
    print(json.dumps(demo, indent=2))
