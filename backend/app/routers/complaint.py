from fastapi import APIRouter, UploadFile, File, Form
from app.services.complaint_logger import log_complaint

router = APIRouter()

@router.post("/register_complaint/")
async def register_complaint(
    file: UploadFile = File(...),
    latitude: str = Form(...),
    longitude: str = Form(...),
    road_name: str = Form(...),
    road_type: str = Form(...),
    department: str = Form(...),
    num_pictures: int = Form(...),
    anomalies_detected: int = Form(...),
    types: str = Form(...),
    confidence: float = Form(None)
):
    # Save image to disk (optional)
    contents = await file.read()
    image_path = f"uploads/{file.filename}"
    with open(image_path, "wb") as f:
        f.write(contents)

    # Log metadata
    log_complaint({
        "image_path": image_path,
        "latitude": latitude,
        "longitude": longitude,
        "road_name": road_name,
        "road_type": road_type,
        "department": department,
        "num_pictures": num_pictures,
        "anomalies_detected": anomalies_detected,
        "types": types,
        "confidence": confidence,
    })

    return {"status": "success", "message": "Complaint registered"}
