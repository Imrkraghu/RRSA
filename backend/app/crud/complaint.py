from app.models.complaint import Complaint

def create_complaint(db, data, image_path):
    complaint = Complaint(
        image_path=image_path,
        latitude=data.latitude,
        longitude=data.longitude,
        road_name=data.road_name,
        road_type=data.road_type,
        department=data.department,
        anomalies_detected=data.anomalies_detected,
        types=data.types,
    )
    db.add(complaint)
    db.commit()
    db.refresh(complaint)
    return complaint
