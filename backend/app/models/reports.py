from pydantic import BaseModel
from datetime import datetime

class Report(BaseModel):
    id: int
    image_path: str
    location: str
    timestamp: datetime
