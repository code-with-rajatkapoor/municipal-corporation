import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { db } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-change-me';

// File Upload Configuration
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.resolve(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '2mb' }));
app.use('/uploads', express.static(uploadDir));

const upload = multer({ dest: uploadDir, limits: { fileSize: 5 * 1024 * 1024 } });

// Initializing Database Tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    phone TEXT,
    id_proof_type TEXT,
    id_proof_number TEXT,
    role TEXT DEFAULT 'citizen',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS complaints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    complaint_code TEXT UNIQUE,
    user_id INTEGER,
    category TEXT,
    priority TEXT DEFAULT 'Medium',
    description TEXT,
    location TEXT,
    status TEXT DEFAULT 'Pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS pickups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    scheduled_date TEXT,
    address TEXT,
    waste_type TEXT,
    status TEXT DEFAULT 'Scheduled',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS corrections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    complaint_id TEXT,
    correction_type TEXT,
    description TEXT,
    status TEXT DEFAULT 'Submitted',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    complaint_id TEXT,
    rating INTEGER,
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Auth Helpers
const sign = (u) => jwt.sign({ id: u.id, role: u.role, name: u.name, email: u.email }, JWT_SECRET, { expiresIn: '7d' });

function auth(req, res, next) {
  try {
    const h = req.headers.authorization || '';
    if (!h.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
    req.user = jwt.verify(h.slice(7), JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

function roles(...allowed) {
  return (req, res, next) => allowed.includes(req.user.role) ? next() : res.status(403).json({ error: 'Insufficient permissions' });
}

// System Code Generator
const generateComplaintCode = () => `MCC-${(new Date()).getFullYear()}-${String(Date.now()).slice(-6)}`;

// Health Check Endpoint
app.get('/api/health', (req, res) => res.json({ ok: true, service: 'Municipal Citizen Portal API', time: new Date().toISOString() }));


// ==========================================
// AUTHENTICATION ENDPOINTS
// ==========================================

// REGISTER ENDPOINT
app.post('/api/auth/register', async (req, res) => {
  try {
    const body = req.body;
    const email = (body.email || '').trim().toLowerCase();
    const password = body.password || 'Test123456';
    const name = body.name || `${body.first_name || body.firstName || ''} ${body.last_name || body.lastName || ''}`.trim() || 'Citizen';
    const phone = body.phone || body.mobile || '';
    const idType = body.id_proof || body.idType || '';
    const idNumber = body.id_number || body.idNumber || '';

    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    // 1. Check if user already exists
    const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (existingUser) {
      return res.status(200).json({
        message: "User already exists",
        token: sign(existingUser),
        user: { id: existingUser.id, name: existingUser.name, email: existingUser.email, role: existingUser.role }
      });
    }

    // 2. Hash password and insert new user
    const hash = await bcrypt.hash(password, 10);
    const stmt = db.prepare('INSERT INTO users (name, email, password_hash, phone, id_proof_type, id_proof_number, role) VALUES (?, ?, ?, ?, ?, ?, ?)');
    const result = stmt.run(name, email, hash, phone, idType, idNumber, 'citizen');

    const newUser = { id: result.lastInsertRowid, name, email, role: 'citizen' };
    res.status(201).json({ token: sign(newUser), user: newUser });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// LOGIN ENDPOINT
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get((email || '').trim().toLowerCase());

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    res.json({ token: sign(user), user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/me', auth, (req, res) => res.json({ user: req.user }));


// ==========================================
// COMPLAINT ENDPOINTS
// ==========================================

// Create Complaint
app.post('/api/complaints', auth, upload.array('evidence', 5), (req, res) => {
  try {
    const { category, priority, description, location } = req.body;
    const code = generateComplaintCode();

    const stmt = db.prepare('INSERT INTO complaints (complaint_code, user_id, category, priority, description, location, status) VALUES (?, ?, ?, ?, ?, ?, ?)');
    const result = stmt.run(code, req.user.id, category, priority || 'Medium', description, location, 'Pending');

    res.status(201).json({ message: 'Complaint registered successfully', id: result.lastInsertRowid, complaint_code: code });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get Complaints
app.get('/api/complaints', auth, (req, res) => {
  const whereClause = req.user.role === 'citizen' ? 'WHERE c.user_id = ?' : '';
  const args = req.user.role === 'citizen' ? [req.user.id] : [];

  const complaints = db.prepare(`SELECT c.*, u.name as reported_by FROM complaints c JOIN users u ON u.id = c.user_id ${whereClause} ORDER BY c.created_at DESC`).all(...args);
  res.json(complaints);
});

// Update Complaint Status
app.patch('/api/complaints/:id/status', auth, roles('admin', 'officer'), (req, res) => {
  try {
    const { status } = req.body;
    db.prepare('UPDATE complaints SET status = ? WHERE id = ? OR complaint_code = ?').run(status, req.params.id, req.params.id);
    res.json({ message: 'Status updated', status });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Start Server
app.listen(PORT, () => console.log(`Municipal Backend running on http://localhost:${PORT}`));