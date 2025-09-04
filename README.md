# 📱 User Road Reporting System App

## 🎯 Objective

This project aims to build a mobile application that enables users to:
- Capture and upload images of road damage
- Automatically detect the type of damage using machine learning
- Retrieve road metadata based on GPS coordinates
- Store all relevant data in a structured backend for reporting and analysis

---

## 🧱 Project Modules

### 1. Mobile App (Frontend)

**Platform**: React Native (JavaScript)

**Features**:
- Camera access to capture road damage (`expo-camera`)
- GPS tagging (auto-fetch lat/long using `expo-location`)
- Upload image and location to server via REST API
- Display confirmation and damage type (optional preview)

**Folder Structure**:
## 📁 Folder Structure

```bash
RoadReportingSystem/
├── mobile/           # React Native frontend
├── backend/          # FastAPI backend
├── README.md         # Project overview and setup instructions
└── docs/             # Diagrams, API contracts, model documentation

mobile/
├── assets/                   # Images, icons, fonts
├── components/               # Reusable UI components (e.g., Button, Card)
├── screens/                  # App screens (Camera, Upload, Result)
│   ├── CameraScreen.js
│   ├── UploadScreen.js
│   └── ResultScreen.js
├── services/                 # API calls (axios wrappers)
│   └── api.js
├── utils/                    # Helper functions (e.g., GPS, image compression)
├── navigation/               # Stack or tab navigation setup
│   └── AppNavigator.js
├── App.js                    # Entry point
└── app.config.js             # Expo config


backend/
├── app/
│   ├── main.py               # FastAPI entry point
│   ├── models/               # Pydantic schemas and ORM models
│   │   ├── report.py
│   │   ├── road_info.py
│   │   └── user.py
│   ├── routers/              # API endpoints
│   │   ├── upload.py
│   │   ├── detect.py
│   │   ├── road_info.py
│   │   └── save.py
│   ├── services/             # Business logic (ML model, geolocation)
│   │   ├── detector.py
│   │   └── geo_lookup.py
│   ├── utils/                # Image handling, validation, etc.
│   └── config.py             # DB config, constants
├── media/                    # Uploaded images (if stored locally)
├── requirements.txt          # Python dependencies
└── README.md                 # Backend setup instructions


docs/
├── architecture_diagram.png
├── api_contracts.md
├── model_pipeline.md
└── database_schema.sql



---
```
### 3. Accurate Image Detection Model

**Model Type**: Two-step hybrid ML pipeline
- **Step 1**: MobileNet — verifies if the image contains a road
- **Step 2**: YOLOv5 or YOLOv8 — detects type of road damage

**Input**: Road image  
**Output**:  
- Rejected (if not a road)  
- Accepted → Damage type (e.g., pothole, crack, erosion)

**Deployment**:
- Server-side: TensorFlow or PyTorch
- Optional mobile-side: TensorFlow Lite or ONNX

---

### 4. Geolocation & Road Metadata

**APIs Used**:
- OpenStreetMap (Nominatim)
- Google Maps Roads API
- Mapbox Geocoding API

**Data Fetched**:
- Road name
- Road type (highway, local)
- Nearby landmarks
- Administrative region

---

### 5. Database Design

**Database**: PostgreSQL with PostGIS extension

**Schema Overview**:
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username TEXT,
    email TEXT,
    password_hash TEXT
);

CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    image_path TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    damage_type TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE road_info (
    id SERIAL PRIMARY KEY,
    report_id INTEGER REFERENCES reports(id),
    road_name TEXT,
    road_type TEXT,
    landmark TEXT
);

CREATE TABLE damage_types (
    id SERIAL PRIMARY KEY,
    type_name TEXT UNIQUE
);
