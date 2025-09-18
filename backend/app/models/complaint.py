from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
from app.core.database import Base

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    image_path = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    road_name = Column(String)
    road_type = Column(String)
    department = Column(String)
    anomalies_detected = Column(String)
    types = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
