# Financial Risk Platform

A comprehensive financial planning and analysis web application that helps users manage their finances through interactive tools for budgeting, tax calculation, spending analysis, and mortgage planning.

## Live Demo

**[View Live Application](https://financial-model-project-31vmzghgn-vanessagomezmccs-projects.vercel.app/)**

## Overview

The Financial Risk Platform is a full-stack web application designed to empower users with data-driven insights into their financial health. Built with modern web technologies, it provides real-time calculations and visualizations to help users make informed financial decisions.

## Features

### Profile Management
- Store and manage personal financial information
- Secure local storage with browser-based persistence
- User-friendly interface for updating financial details

### Budget Intelligence Planner
- Track spending across multiple categories (rent, mortgage, debts, car, childcare, insurance)
- Compare your spending to national benchmarks
- Visual allocation breakdown with interactive pie charts
- Financial health score based on recommended budget allocations
- Dynamic insights and recommendations

### Tax Intelligence Dashboard
- Calculate federal and state tax obligations
- Support for multiple filing statuses
- Detailed annual and monthly tax breakdowns
- Effective tax rate analysis
- Tax planning tips and recommendations

### Mortgage Calculator
- Comprehensive mortgage payment calculations
- Visual payment breakdown (principal, interest, taxes, insurance)
- Loan amortization schedule over time
- Interactive charts showing loan balance progression
- Detailed year-by-year amortization table

### Spending Categories Analysis
- Analyze spending patterns across different categories
- Compare personal spending to national averages
- Interactive data visualizations
- Personalized financial recommendations

## Tech Stack

### Frontend
- **Framework:** Next.js 14 (React)
- **Language:** TypeScript
- **Styling:** Inline CSS with custom design system
- **Charts:** Recharts
- **Deployment:** Vercel

### Backend
- **Framework:** FastAPI (Python)
- **Language:** Python 3.12
- **API:** RESTful API
- **Deployment:** Render


## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.12+
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/vanessagomezmcc/Financial-Modeling-Project.git
cd Financial-Modeling-Project
```

2. **Set up the backend**
```bash
cd backend
pip install -r requirements.txt
```

3. **Set up the frontend**
```bash
cd ../frontend
npm install
```

### Running Locally

1. **Start the backend server**
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

2. **Start the frontend development server**
```bash
cd frontend
npm run dev
```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## Project Structure

```
Financial-Modeling-Project/
├── backend/
│   ├── app/
│   │   ├── routes/
│   │   │   ├── budget_analysis.py
│   │   │   ├── mortgage.py
│   │   │   └── tax_analysis.py
│   │   ├── data/
│   │   ├── main.py
│   │   └── tax_estimator.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── categories/
│   │   │   ├── mortgage/
│   │   │   ├── profile/
│   │   │   ├── taxes/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── components/
│   │   │   └── BackButton.tsx
│   │   └── lib/
│   │       ├── FinancialContext.tsx
│   │       ├── session.ts
│   │       └── useSession.ts
│   ├── package.json
│   └── next.config.ts
│
└── README.md
```

## Configuration

### Environment Variables

**Frontend (`.env.local`):**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Frontend Production (`.env.production`):**
```env
NEXT_PUBLIC_API_URL=https://your-backend-api.onrender.com
```

## API Endpoints

### Tax Analysis
```
POST /api/tax-analysis
```
Calculate federal and state taxes based on income and filing status.

### Mortgage Calculator
```
POST /api/mortgage
```
Calculate monthly mortgage payments with detailed breakdown.

### Budget Analysis
```
POST /api/budget-analysis
```
Analyze spending patterns and compare to national benchmarks.

## Key Features Explained

### Budget Intelligence Planner
The Budget Intelligence Planner allows users to:
- Select relevant expense categories
- Input monthly spending amounts
- Compare spending to national averages
- Receive a financial health score (0-100)
- Get personalized recommendations for budget optimization

### Tax Intelligence Dashboard
Users can:
- Calculate federal income tax based on 2024 tax brackets
- Estimate state income tax for all 50 states
- View FICA (Social Security and Medicare) deductions
- See both annual and monthly tax breakdowns
- Calculate effective tax rate
- Access tax planning tips

### Mortgage Calculator
Features include:
- Principal and interest calculation using standard amortization formula
- Property tax and insurance estimates
- Visual breakdown of monthly payment components
- 30-year amortization schedule with interactive charts
- Year-by-year principal and interest breakdown

## Data Privacy

All user data is stored locally in the browser using localStorage. No personal financial information is sent to external servers or stored in any database. Users have full control over their data and can clear it at any time.

## Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/vanessagomezmcc/Financial-Modeling-Project/issues).

## Future Enhancements

- [ ] Add investment portfolio tracking
- [ ] Implement retirement planning calculator
- [ ] Add debt payoff strategies and calculators
- [ ] Create savings goal tracker
- [ ] Add export to PDF functionality
- [ ] Implement data visualization dashboards
- [ ] Add multi-currency support
- [ ] Create mobile app version

## Author

**Vanessa Gomez**

- GitHub: [@vanessagomezmcc](https://github.com/vanessagomezmcc)
- LinkedIn: [Vanessa Gomez](https://www.linkedin.com/in/vanessagomezmcc)

## License

This project is open source and available under the [MIT License](LICENSE).

##  Acknowledgments

- Tax bracket data sourced from IRS 2024 tax tables
- Budget benchmarks based on national consumer expenditure data
- Mortgage calculations follow standard amortization formulas
- Design inspiration from modern financial planning tools

---

**Note:** This is a portfolio project created for educational purposes. Tax calculations are estimates and should not be used as professional financial advice. Always consult with a certified tax professional or financial advisor for official tax and financial planning guidance.

---
