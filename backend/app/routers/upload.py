from fastapi import APIRouter, File, UploadFile
from fastapi.responses import JSONResponse
import shutil
import os

router = APIRouter()

@router.post("/")
async def upload_image(file: UploadFile = File(...)):
    save_path = f"media/{file.filename}"
    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return JSONResponse(content={"message": "Image uploaded", "path": save_path})
