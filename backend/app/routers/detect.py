from fastapi import APIRouter, UploadFile, File
from app.services.detector import detect_road
import tempfile

router = APIRouter()

@router.post("/")
async def process_image(file: UploadFile = File(...)):
    with tempfile.NamedTemporaryFile(delete=True, suffix=".jpg") as temp:
        temp.write(await file.read())
        temp.flush()
        result = detect_road(temp.name)
    return result
