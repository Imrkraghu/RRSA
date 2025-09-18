from fastapi import FastAPI
from app.routers import detect, complaints


app = FastAPI()

app.include_router(detect.router, prefix="/detect")
app.include_router(complaints.router, prefix="/complaints")