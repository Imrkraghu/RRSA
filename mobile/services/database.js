import * as SQLite from 'expo-sqlite';

// Safely open the database using the new async API
export const getDB = async () => {
  try {
    const db = await SQLite.openDatabaseAsync('rrsa_db');
    if (!db || typeof db.execAsync !== 'function') {
      throw new Error('Invalid database object');
    }
    return db;
  } catch (error) {
    console.error('❌ Failed to open database:', error.message);
    return null;
  }
};

// Initialize the complaints table with extended schema
export const initDB = async () => {
  const db = await getDB();
  if (!db) {
    console.error('❌ DB is null during init');
    return;
  }

  try {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS complaints (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        image_path TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
        road_name TEXT,
        road_type TEXT,
        department TEXT,
        anomalies_detected TEXT,
        types TEXT,
        ml_label TEXT,
        confidence REAL,
        synced INTEGER DEFAULT 0,
        user_id INTEGER
      );
    `);
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
  }
};

// Insert a new complaint record safely
export const insertComplaint = async (
  imagePath,
  latitude,
  longitude,
  timestamp,
  roadName = null,
  roadType = null,
  department = null,
  anomaliesDetected = null,
  types = null,
  mlLabel = null,
  confidence = null,
  synced = 0,
  userId = null
) => {
  const db = await getDB();
  if (!db || typeof db.runAsync !== 'function') {
    console.error('❌ Invalid DB object during insert');
    return;
  }

  if (!imagePath || latitude == null || longitude == null) {
    console.error('❌ Required fields missing for insert');
    return;
  }

  try {
    await db.runAsync(
      `INSERT INTO complaints (
        image_path, latitude, longitude, timestamp,
        road_name, road_type, department, anomalies_detected,
        types, ml_label, confidence, synced, user_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        imagePath, latitude, longitude, timestamp,
        roadName, roadType, department, anomaliesDetected,
        types, mlLabel, confidence ?? null, synced ? 1 : 0, userId ?? null
      ]
    );
    console.log('✅ Complaint inserted');
  } catch (error) {
    console.error('❌ Insert failed:', error.message);
  }
};

// Fetch all complaints and pass them to a callback
export const fetchComplaints = async (callback) => {
  const db = await getDB();
  if (!db || typeof db.getAllAsync !== 'function') {
    console.error('❌ Invalid DB object during fetch');
    return;
  }

  try {
    const results = await db.getAllAsync(`SELECT * FROM complaints;`);
    callback(results);
  } catch (error) {
    console.error('❌ Fetch failed:', error.message);
  }
};