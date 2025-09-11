from fastapi import APIRouter, Query
from app.services.detector import detect_road

router = APIRouter()

@router.get("/")
def run_detection(image_path: str = Query(...)):
    result = detect_road(image_path)
    return result
