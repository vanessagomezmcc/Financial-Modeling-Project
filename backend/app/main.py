from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.taxes import router as taxes_router
from app.routes.mortgage import router as mortgage_router
from app.routes.risk import router as risk_router
from app.routes.simulate import router as simulate_router
from app.routes.optimize import router as optimize_router
from app.routes.relocate import router as relocate_router
from app.routes.budget_analysis import router as budget_router
from app.routes.life_events import router as life_events_router


app = FastAPI(title="Finance Risk Platform")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health():
    return {"ok": True}

app.include_router(taxes_router)
app.include_router(mortgage_router)
app.include_router(risk_router)
app.include_router(simulate_router)
app.include_router(optimize_router)
app.include_router(relocate_router)
app.include_router(life_events_router)
app.include_router(budget_router)