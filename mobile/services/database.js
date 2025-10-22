import * as SQLite from 'expo-sqlite';

// Open the database using the async API
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

// Initialize the complaints table with only latitude and longitude
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
        latitude REAL NOT NULL,
        longitude REAL NOT NULL
      );
    `);
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
  }
};

// Insert a new location record
export const insertComplaint = async (imagePath, latitude, longitude) => {
  const db = await getDB();
  if (!db || typeof db.runAsync !== 'function') {
    console.error('❌ Invalid DB object during insert');
    return;
  }

  if (latitude == null || longitude == null) {
    console.error('❌ Latitude and longitude are required');
    return;
  }

  try {
    await db.runAsync(
      `INSERT INTO complaints (latitude, longitude) VALUES (?, ?);`,
      [latitude, longitude]
    );
    console.log('✅ Location inserted');
  } catch (error) {
    console.error('❌ Insert failed:', error.message);
  }
};

// Fetch all location records
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
