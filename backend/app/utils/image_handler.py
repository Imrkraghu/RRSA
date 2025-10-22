import os
from fastapi import UploadFile

def save_image(upload_file: UploadFile) -> str:
    os.makedirs("images", exist_ok=True)
    file_path = f"images/{upload_file.filename}"
    with open(file_path, "wb") as f:
        f.write(upload_file.file.read())
    return file_path
