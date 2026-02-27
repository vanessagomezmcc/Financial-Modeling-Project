from fastapi import APIRouter

router = APIRouter()

@router.get("/api/life-events")
def life_events():
    return {"message": "Life events route working"}