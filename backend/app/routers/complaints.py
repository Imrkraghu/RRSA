from fastapi import APIRouter, UploadFile, Form, Depends
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.schemas.schemas import ComplaintCreate, ComplaintResponse
from app.crud.complaint import create_complaint
from app.utils.image_handler import save_image
from app.models.complaint import Complaint
from typing import List

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/all", response_model=List[ComplaintResponse])
def get_all_complaints(db: Session = Depends(get_db)):
    return db.query(Complaint).all()

@router.post("/", response_model=ComplaintResponse)
async def register_complaint(
    image: UploadFile,
    latitude: float = Form(...),
    longitude: float = Form(...),
    timestamp: str = Form(...),
    road_name: str = Form(...),
    road_type: str = Form(...),
    department: str = Form(...),
    anomalies_detected: str = Form(...),
    types: str = Form(...),
    ml_label: str = Form(...),
    confidence: float = Form(...),
    db: Session = Depends(get_db)
):
    image_path = save_image(image)

    data = ComplaintCreate(
        latitude=latitude,
        longitude=longitude,
        timestamp=timestamp,
        road_name=road_name,
        road_type=road_type,
        department=department,
        anomalies_detected=anomalies_detected,
        types=types,
        ml_label=ml_label,
        confidence=confidence,
        image_path=image_path
    )

    return create_complaint(db, data,image_path)