from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.mortgage import router as mortgage_router
from app.routes.budget_analysis import router as budget_router
from app.routes.tax_analysis import router as tax_router




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


app.include_router(mortgage_router)
app.include_router(budget_router)
app.include_router(tax_router)

