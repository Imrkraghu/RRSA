from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
import os

from app.routers import detect, complaints
from app.services.database import Base, engine
from app.models import complaint  # ✅ Import models before create_all

app = FastAPI()

# Create tables
Base.metadata.create_all(bind=engine)

# ✅ Mount static files from project root
app.mount(
    "/uploads",
    StaticFiles(directory=os.path.join(os.path.dirname(__file__), "..", "uploads")),
    name="uploads"
)

# Include routers
app.include_router(detect.router, prefix="/detect")
app.include_router(complaints.router, prefix="/complaints")