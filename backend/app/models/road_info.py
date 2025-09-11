from pydantic import BaseModel
from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

# ORM model for database
class RoadInfo(Base):
    __tablename__ = "road_info"

    id = Column(Integer, primary_key=True, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    location_name = Column(String, nullable=True)
    road_type = Column(String, nullable=True)
    surface_condition = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

# Pydantic schema for API
class RoadInfoCreate(BaseModel):
    latitude: float
    longitude: float
    location_name: str | None = None
    road_type: str | None = None
    surface_condition: str | None = None

class RoadInfoRead(RoadInfoCreate):
    id: int
    timestamp: datetime

    class Config:
        orm_mode = True
