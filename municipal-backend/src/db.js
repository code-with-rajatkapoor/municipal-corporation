const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-change-me';

// Initialize SQLite database
const dbPath = path.join(__dirname, '../data/database.sqlite');
const db = new Database(dbPath);

// Enable Foreign Keys
db.pragma('foreign_keys = ON');

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    phone TEXT,
    role TEXT DEFAULT 'citizen',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS complaints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    complaint_code TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    ward TEXT,
    address TEXT,
    citizen_email TEXT,
    status TEXT DEFAULT 'Pending',
    evidence_url TEXT,
    officer_response TEXT,
    officer_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS pickups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    address TEXT NOT NULL,
    waste_type TEXT NOT NULL,
    scheduled_date TEXT NOT NULL,
    citizen_email TEXT,
    status TEXT DEFAULT 'Scheduled',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// --- Authentication Helper Functions ---
async function registerUser({ name, email, password, phone }) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const stmt = db.prepare(`
    INSERT INTO users (name, email, password, phone)
    VALUES (?, ?, ?, ?)
  `);
  const info = stmt.run(name, email, hashedPassword, phone || null);
  const user = { id: info.lastInsertRowid, name, email, role: 'citizen' };
  const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
  return { user, token };
}

async function loginUser({ email, password }) {
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  const user = stmt.get(email);
  if (!user) {
    throw new Error('Invalid email or password.');
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw new Error('Invalid email or password.');
  }

  const userPayload = { id: user.id, name: user.name, email: user.email, role: user.role };
  const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '7d' });
  return { user: userPayload, token };
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

// --- Complaint Helper Functions ---
async function createComplaint({ description, category, ward, address, citizenEmail, evidenceUrl }) {
  const complaintCode = `MCC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
  const stmt = db.prepare(`
    INSERT INTO complaints (complaint_code, description, category, ward, address, citizen_email, evidence_url)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const info = stmt.run(complaintCode, description, category, ward || null, address || null, citizenEmail || null, evidenceUrl || null);
  
  return db.prepare('SELECT * FROM complaints WHERE id = ?').get(info.lastInsertRowid);
}

async function getComplaints({ email, role } = {}) {
  if (role === 'officer' || role === 'admin') {
    return db.prepare('SELECT * FROM complaints ORDER BY created_at DESC').all();
  }
  if (email) {
    return db.prepare('SELECT * FROM complaints WHERE citizen_email = ? ORDER BY created_at DESC').all(email);
  }
  return db.prepare('SELECT * FROM complaints ORDER BY created_at DESC').all();
}

async function updateComplaintStatus({ id, status, officerResponse, officerId }) {
  const stmt = db.prepare(`
    UPDATE complaints
    SET status = COALESCE(?, status),
        officer_response = COALESCE(?, officer_response),
        officer_id = COALESCE(?, officer_id)
    WHERE id = ? OR complaint_code = ?
  `);
  stmt.run(status || null, officerResponse || null, officerId || null, id, id);
  return db.prepare('SELECT * FROM complaints WHERE id = ? OR complaint_code = ?').get(id, id);
}

// --- Pickup Helper Functions ---
async function schedulePickup({ address, wasteType, scheduledDate, citizenEmail }) {
  const stmt = db.prepare(`
    INSERT INTO pickups (address, waste_type, scheduled_date, citizen_email)
    VALUES (?, ?, ?, ?)
  `);
  const info = stmt.run(address, wasteType, scheduledDate, citizenEmail || null);
  return db.prepare('SELECT * FROM pickups WHERE id = ?').get(info.lastInsertRowid);
}

async function getPickups(email) {
  if (email) {
    return db.prepare('SELECT * FROM pickups WHERE citizen_email = ? ORDER BY created_at DESC').all(email);
  }
  return db.prepare('SELECT * FROM pickups ORDER BY created_at DESC').all();
}

// --- Admin Analytics Helper Functions ---
async function getAdminStats() {
  const total = db.prepare('SELECT COUNT(*) as count FROM complaints').get().count;
  const pending = db.prepare("SELECT COUNT(*) as count FROM complaints WHERE status = 'Pending'").get().count;
  const inProgress = db.prepare("SELECT COUNT(*) as count FROM complaints WHERE status = 'In Progress'").get().count;
  const resolved = db.prepare("SELECT COUNT(*) as count FROM complaints WHERE status = 'Resolved'").get().count;

  return { totalComplaints: total, pending, inProgress, resolved };
}

// Export database instance and helper functions required by server.js
module.exports = {
  db,
  registerUser,
  loginUser,
  verifyToken,
  createComplaint,
  getComplaints,
  updateComplaintStatus,
  schedulePickup,
  getPickups,
  getAdminStats
};