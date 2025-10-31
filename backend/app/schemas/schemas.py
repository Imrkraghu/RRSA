from pydantic import BaseModel
from datetime import datetime

class ComplaintCreate(BaseModel):
    latitude: float
    longitude: float
    timestamp: str
    road_name: str
    road_type: str
    department: str
    anomalies_detected: str
    types: str
    ml_label: str
    confidence: float
    image_path: str


class ComplaintResponse(BaseModel):
    id: int
    image_path: str
    timestamp: datetime

    class Config:
        orm_mode = True