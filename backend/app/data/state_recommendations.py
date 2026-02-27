STATE_RECOMMENDATIONS = {
    "US": {"rent": 0.18, "mortgage": 0.12, "debts": 0.10, "car": 0.10, "childcare": 0.10, "insurance": 0.08},

    # High Cost Tier (very high housing)
    "CA": {"rent": 0.22, "mortgage": 0.11, "debts": 0.10, "car": 0.09, "childcare": 0.11, "insurance": 0.08},
    "NY": {"rent": 0.23, "mortgage": 0.11, "debts": 0.10, "car": 0.08, "childcare": 0.11, "insurance": 0.09},
    "HI": {"rent": 0.24, "mortgage": 0.10, "debts": 0.10, "car": 0.09, "childcare": 0.11, "insurance": 0.09},
    "MA": {"rent": 0.22, "mortgage": 0.11, "debts": 0.10, "car": 0.08, "childcare": 0.11, "insurance": 0.08},
    "NJ": {"rent": 0.22, "mortgage": 0.12, "debts": 0.10, "car": 0.09, "childcare": 0.11, "insurance": 0.09},
    "DC": {"rent": 0.23, "mortgage": 0.11, "debts": 0.10, "car": 0.08, "childcare": 0.11, "insurance": 0.09},
    "WA": {"rent": 0.21, "mortgage": 0.12, "debts": 0.10, "car": 0.09, "childcare": 0.10, "insurance": 0.08},
    "CO": {"rent": 0.21, "mortgage": 0.12, "debts": 0.10, "car": 0.10, "childcare": 0.10, "insurance": 0.08},
    "MD": {"rent": 0.21, "mortgage": 0.12, "debts": 0.10, "car": 0.09, "childcare": 0.11, "insurance": 0.09},
    "OR": {"rent": 0.20, "mortgage": 0.12, "debts": 0.10, "car": 0.10, "childcare": 0.10, "insurance": 0.08},
    "CT": {"rent": 0.21, "mortgage": 0.12, "debts": 0.10, "car": 0.09, "childcare": 0.11, "insurance": 0.09},

    # Medium-High Tier
    "IL": {"rent": 0.19, "mortgage": 0.13, "debts": 0.10, "car": 0.10, "childcare": 0.10, "insurance": 0.08},
    "VA": {"rent": 0.19, "mortgage": 0.13, "debts": 0.10, "car": 0.10, "childcare": 0.10, "insurance": 0.08},
    "AZ": {"rent": 0.19, "mortgage": 0.13, "debts": 0.10, "car": 0.11, "childcare": 0.09, "insurance": 0.08},
    "NV": {"rent": 0.19, "mortgage": 0.13, "debts": 0.10, "car": 0.11, "childcare": 0.09, "insurance": 0.08},
    "UT": {"rent": 0.18, "mortgage": 0.14, "debts": 0.10, "car": 0.11, "childcare": 0.09, "insurance": 0.08},
    "FL": {"rent": 0.18, "mortgage": 0.13, "debts": 0.10, "car": 0.11, "childcare": 0.09, "insurance": 0.09},
    "TX": {"rent": 0.16, "mortgage": 0.13, "debts": 0.10, "car": 0.11, "childcare": 0.09, "insurance": 0.08},

    # Mid Tier
    "NC": {"rent": 0.17, "mortgage": 0.14, "debts": 0.10, "car": 0.11, "childcare": 0.09, "insurance": 0.08},
    "GA": {"rent": 0.17, "mortgage": 0.14, "debts": 0.10, "car": 0.11, "childcare": 0.09, "insurance": 0.08},
    "PA": {"rent": 0.17, "mortgage": 0.14, "debts": 0.10, "car": 0.10, "childcare": 0.09, "insurance": 0.08},
    "MI": {"rent": 0.16, "mortgage": 0.15, "debts": 0.10, "car": 0.11, "childcare": 0.08, "insurance": 0.08},
    "OH": {"rent": 0.16, "mortgage": 0.15, "debts": 0.10, "car": 0.11, "childcare": 0.08, "insurance": 0.08},
    "MN": {"rent": 0.17, "mortgage": 0.14, "debts": 0.10, "car": 0.10, "childcare": 0.09, "insurance": 0.08},
    "WI": {"rent": 0.16, "mortgage": 0.15, "debts": 0.10, "car": 0.11, "childcare": 0.08, "insurance": 0.08},
    "TN": {"rent": 0.16, "mortgage": 0.15, "debts": 0.10, "car": 0.11, "childcare": 0.08, "insurance": 0.08},
    "SC": {"rent": 0.16, "mortgage": 0.15, "debts": 0.10, "car": 0.11, "childcare": 0.08, "insurance": 0.08},

    # Lower Cost Tier
    "IN": {"rent": 0.15, "mortgage": 0.14, "debts": 0.10, "car": 0.10, "childcare": 0.08, "insurance": 0.08},
    "MO": {"rent": 0.15, "mortgage": 0.15, "debts": 0.10, "car": 0.11, "childcare": 0.08, "insurance": 0.08},
    "KY": {"rent": 0.15, "mortgage": 0.15, "debts": 0.10, "car": 0.11, "childcare": 0.08, "insurance": 0.08},
    "AL": {"rent": 0.14, "mortgage": 0.16, "debts": 0.10, "car": 0.11, "childcare": 0.08, "insurance": 0.08},
    "AR": {"rent": 0.14, "mortgage": 0.16, "debts": 0.10, "car": 0.11, "childcare": 0.08, "insurance": 0.08},
    "LA": {"rent": 0.15, "mortgage": 0.15, "debts": 0.10, "car": 0.11, "childcare": 0.08, "insurance": 0.09},
    "OK": {"rent": 0.14, "mortgage": 0.16, "debts": 0.10, "car": 0.11, "childcare": 0.08, "insurance": 0.08},
    "MS": {"rent": 0.13, "mortgage": 0.17, "debts": 0.10, "car": 0.11, "childcare": 0.08, "insurance": 0.08},
    "WV": {"rent": 0.13, "mortgage": 0.17, "debts": 0.10, "car": 0.11, "childcare": 0.08, "insurance": 0.08},

    # Mountain / Rural Tier
    "ID": {"rent": 0.16, "mortgage": 0.15, "debts": 0.10, "car": 0.11, "childcare": 0.08, "insurance": 0.08},
    "MT": {"rent": 0.16, "mortgage": 0.15, "debts": 0.10, "car": 0.12, "childcare": 0.08, "insurance": 0.08},
    "WY": {"rent": 0.15, "mortgage": 0.16, "debts": 0.10, "car": 0.12, "childcare": 0.08, "insurance": 0.08},
    "ND": {"rent": 0.14, "mortgage": 0.16, "debts": 0.10, "car": 0.12, "childcare": 0.08, "insurance": 0.08},
    "SD": {"rent": 0.14, "mortgage": 0.16, "debts": 0.10, "car": 0.12, "childcare": 0.08, "insurance": 0.08},
    "NE": {"rent": 0.15, "mortgage": 0.15, "debts": 0.10, "car": 0.11, "childcare": 0.08, "insurance": 0.08},
    "KS": {"rent": 0.15, "mortgage": 0.15, "debts": 0.10, "car": 0.11, "childcare": 0.08, "insurance": 0.08},
    "IA": {"rent": 0.15, "mortgage": 0.15, "debts": 0.10, "car": 0.11, "childcare": 0.08, "insurance": 0.08},

    # New England Low Density
    "ME": {"rent": 0.17, "mortgage": 0.14, "debts": 0.10, "car": 0.11, "childcare": 0.09, "insurance": 0.08},
    "NH": {"rent": 0.18, "mortgage": 0.14, "debts": 0.10, "car": 0.10, "childcare": 0.09, "insurance": 0.08},
    "VT": {"rent": 0.18, "mortgage": 0.14, "debts": 0.10, "car": 0.10, "childcare": 0.09, "insurance": 0.08},
    "RI": {"rent": 0.19, "mortgage": 0.13, "debts": 0.10, "car": 0.09, "childcare": 0.10, "insurance": 0.08},

    # Remaining States
    "NM": {"rent": 0.15, "mortgage": 0.15, "debts": 0.10, "car": 0.11, "childcare": 0.08, "insurance": 0.08},
    "AK": {"rent": 0.19, "mortgage": 0.14, "debts": 0.10, "car": 0.12, "childcare": 0.09, "insurance": 0.09},
}