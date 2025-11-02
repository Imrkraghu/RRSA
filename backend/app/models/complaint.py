from sqlalchemy import Column, Integer, Float, String
from app.services.database import Base

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    image_path = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    location_name = Column(String, nullable=True)   # ✅ Add this line
    timestamp = Column(String, nullable=True)       # ✅ Add this too if you're sending it
