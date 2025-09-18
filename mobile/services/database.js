import * as SQLite from 'expo-sqlite';

// Safely open the database using the new async API
export const getDB = async () => {
  try {
    const db = await SQLite.openDatabaseAsync('rrsa.db');
    if (!db || typeof db.execAsync !== 'function') {
      throw new Error('Invalid database object');
    }
    return db;
  } catch (error) {
    console.error('❌ Failed to open database:', error);
    return null;
  }
};

// Initialize the complaints table with extended schema
export const initDB = async () => {
  const db = await getDB();
  if (!db) return;

  try {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS complaints (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        imagePath TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
        roadName TEXT,
        roadType TEXT,
        department TEXT,
        anomaliesDetected TEXT,
        types TEXT,
        mlLabel TEXT,
        confidence REAL,
        synced INTEGER DEFAULT 0,
        userId INTEGER
      );
    `);
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  }
};

// Insert a new complaint record
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
  if (!db) return;

  try {
    await db.runAsync(
      `INSERT INTO complaints (
        imagePath, latitude, longitude, timestamp,
        roadName, roadType, department, anomaliesDetected,
        types, mlLabel, confidence, synced, userId
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        imagePath, latitude, longitude, timestamp,
        roadName, roadType, department, anomaliesDetected,
        types, mlLabel, confidence, synced, userId
      ]
    );
    console.log('✅ Complaint inserted');
  } catch (error) {
    console.error('❌ Insert failed:', error);
  }
};

// Fetch all complaints and pass them to a callback
export const fetchComplaints = async (callback) => {
  const db = await getDB();
  if (!db) return;

  try {
    const results = await db.getAllAsync(`SELECT * FROM complaints;`);
    callback(results);
  } catch (error) {
    console.error('❌ Fetch failed:', error);
  }
};