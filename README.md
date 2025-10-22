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

**Platform**: React Native (JavaScript, Expo)

**Features**:
- Camera access to capture road damage (`expo-camera`)
- GPS tagging (auto-fetch lat/long using `expo-location`)
- Upload image and location to server via REST API
- Display confirmation and damage type (optional preview)
- Optional offline mode with local SQLite storage
- also need to offer multi user support

### 🚀 Setup Instructions (Frontend)

#### Prerequisites
- Node.js ≥ 18.x
- Expo CLI: `npm install -g expo-cli`
- Expo Go app (on your mobile device for testing after that the new apk version will be given )

#### Installation

```bash for frontend using expo go
git clone https://github.com/Imrkraghu/RRSA.git
cd RRSA/mobile
npm install
npx expo start
```

```bash for backend 
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

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
│   └── ImagePreviewScreen.js
│   └── Homepage.js
│   └── ComplaintSuccess.js
│   └── ComplaintHistory.js
├── services/                 # API calls (axios wrappers)
│   └── api.js
│   └── database.js           #ensure that the database is present and the tables are created 
├── utils/
│   └── config.py                 #access file which will access the shared configuration
│   └── shared_config.json        #add your backend ip address here
├── navigation/               # Stack or tab navigation setup
│   └── AppNavigation.js
├── App.js                    # Entry point for app which also initialize the database
└── app.config.js             # Expo config
└── index.js                  # passes the app through the expo framework to load it
└── package-lock.json         #list all the package installled
└── package.json

backend/
├── app/
│   ├── main.py               # FastAPI entry point it takes the routers, static routes and also have build engine for the database
│   ├── models/               
│   │   ├── Complaints.py     # contains the complaint table schema 
│   ├── routers/              # API endpoints
│   │   ├── Complaints.py     # contains the all routes for the complaint related including the one where data is inserted into the database and also where its fetched
│   │   ├── detect.py         # contains the temporary of the what the model has detetected
│   ├── services/             
│   │   ├── detector.py       # contains the model processing code
│   │   └── database.py       #contains the database address and credentials which you need to change if you are creating your own
│   ├── utils/
│   |   └── Image_handler.js  # Image handling, validation, etc.
│   └── config.py             # DB config, constants
│   ├── uploads/              # Uploaded images come here
│   ├── train/                # contains the model here which is used to process the data
|   │   ├── Model/            contains the model
|   |   └── trainmodel.py     #training script for model but it will train the model in the pytorch but react native will require the tflite version so you need to convert it.    
├── requirements.txt          # Python dependencies
└── README.md                 # Backend setup instructions



---
```
### 3. Accurate Image Detection Model

**Old Model Type**: This was the old approach but it was not finalised due to lack of model supprot
- **Step 1**: MobileNet — verifies if the image contains a road
- **Step 2**: YOLOv5 or YOLOv8 — detects type of road damage
- 
**New Model Type**: This is new approach which is going to be used for the new model its a TFlite version of model compatible with the react native 
- **Step 1**: Model Confirms that the Road is detected adn if yes then the other class are selected
- **Step 2**: model do annotation in the image for the class and update the image in the aws server along with the data

**Input**: Road image  
**Output**:  
- Rejected (if not a road)  
- Accepted → Damage type (e.g., pothole, crack, erosion)

**Deployment**:
- Ml Model Processing will be done on the end user device itself
- postgres will be used to store the data in the AWS Sever

---

### 4. Geolocation & Road Metadata

**APIs Used**:
- OpenStreetMap (Nominatim)
- Google Maps Roads API
- Mapbox Geocoding API
