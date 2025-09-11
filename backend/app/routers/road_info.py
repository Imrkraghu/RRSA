from fastapi import APIRouter
from app.services.geo_lookup import get_location_from_coords

router = APIRouter()

@router.get("/")
def get_road_info(lat: float, lon: float):
    location = get_location_from_coords(lat, lon)
    return {"location": location}
