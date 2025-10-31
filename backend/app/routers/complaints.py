from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.services.database import SessionLocal
from app.models.complaint import Complaint
import shutil, os, uuid

router = APIRouter()

# POST: Create a new complaint
@router.post("/")
async def create_complaint(
    image: UploadFile = File(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    location_name: str = Form(""),
    timestamp: str = Form("")
):
    filename = f"{uuid.uuid4().hex}_{image.filename}"
    image_path = os.path.join("uploads", filename)
    os.makedirs("uploads", exist_ok=True)

    try:
        with open(image_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image save failed: {str(e)}")

    db = SessionLocal()
    try:
        complaint = Complaint(
            image_path=image_path,
            latitude=latitude,
            longitude=longitude,
            location_name=location_name,
            timestamp=timestamp
        )
        db.add(complaint)
        db.commit()
        db.refresh(complaint)
        return {"id": complaint.id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database insert failed: {str(e)}")
    finally:
        db.close()

# GET: Fetch all complaints
@router.get("/complaints/")
def get_complaints():
    db = SessionLocal()
    try:
        return db.query(Complaint).order_by(Complaint.id.desc()).all()
    finally:
        db.close()
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.services.database import SessionLocal
from app.models.complaint import Complaint
import shutil, os, uuid

router = APIRouter()

# POST: Create a new complaint
@router.post("/complaints/")
async def create_complaint(
    image: UploadFile = File(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    location_name: str = Form(""),
    timestamp: str = Form("")
):
    filename = f"{uuid.uuid4().hex}_{image.filename}"
    image_path = os.path.join("uploads", filename)
    os.makedirs("uploads", exist_ok=True)

    try:
        with open(image_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image save failed: {str(e)}")

    db = SessionLocal()
    try:
        complaint = Complaint(
            image_path=image_path,
            latitude=latitude,
            longitude=longitude,
        )
        db.add(complaint)
        db.commit()
        db.refresh(complaint)
        return {"id": complaint.id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database insert failed: {str(e)}")
    finally:
        db.close()

# GET: Fetch all complaints
@router.get("/complaints/")
def get_complaints():
    db = SessionLocal()
    try:
        return db.query(Complaint).order_by(Complaint.id.desc()).all()
    finally:
        db.close()