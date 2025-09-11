from fastapi import FastAPI
from app.routers import upload, detect, road_info, save

app = FastAPI()

app.include_router(upload.router, prefix="/upload")
app.include_router(detect.router, prefix="/detect")
app.include_router(road_info.router, prefix="/road")
app.include_router(save.router, prefix="/save")