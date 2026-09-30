const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import database instance & helper methods from db.js
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 4000;

// ==========================================
// 1. GLOBAL MIDDLEWARE
// ==========================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Enforce JWT_SECRET in production
if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  console.error('FATAL ERROR: JWT_SECRET environment variable is missing!');
  process.exit(1);
}

// ==========================================
// 2. SECURITY: RATE LIMITING
// ==========================================
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 auth requests per 15 mins
  message: { ok: false, error: 'Too many authentication attempts. Please try again after 15 minutes.' }
});

// Apply rate limiter to authentication endpoints
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ==========================================
// 3. FILE UPLOAD CONFIGURATION (MULTER)
// ==========================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|mp4/;
  const mimeType = allowedTypes.test(file.mimetype);
  const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimeType && extName) {
    return cb(null, true);
  }
  cb(new Error('Invalid file type! Only JPEG, JPG, PNG, WEBP images and MP4 videos are allowed.'));
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter: fileFilter
});

// ==========================================
// 4. API ROUTES
// ==========================================

// --- System Health Check ---
app.get('/api/health', (req, res) => {
  res.status(200).json({
    ok: true,
    service: 'Municipal Citizen Portal API',
    timestamp: new Date().toISOString()
  });
});

// --- Authentication Routes ---
app.post('/api/auth/register', async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ ok: false, error: 'Name, email, and password are required.' });
    }

    const result = await db.registerUser({ name, email, password, phone });
    res.status(201).json({ ok: true, ...result });
  } catch (err) {
    next(err);
  }
});

app.post('/api/auth/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ ok: false, error: 'Email and password are required.' });
    }

    const result = await db.loginUser({ email, password });
    res.status(200).json({ ok: true, ...result });
  } catch (err) {
    next(err);
  }
});

app.get('/api/me', (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ ok: false, error: 'No authorization token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const user = db.verifyToken(token);
    res.status(200).json({ ok: true, user });
  } catch (err) {
    next(err);
  }
});

// --- Complaints Routes ---
app.post('/api/complaints', upload.single('evidence'), async (req, res, next) => {
  try {
    const { description, category, ward, address, citizenEmail } = req.body;
    
    if (!description || !category) {
      return res.status(400).json({ ok: false, error: 'Description and category are required.' });
    }

    const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const complaint = await db.createComplaint({
      description,
      category,
      ward,
      address,
      citizenEmail,
      evidenceUrl: fileUrl
    });

    res.status(201).json({ ok: true, complaint });
  } catch (err) {
    next(err);
  }
});

app.get('/api/complaints', async (req, res, next) => {
  try {
    const { email, role } = req.query;
    const complaints = await db.getComplaints({ email, role });
    res.status(200).json({ ok: true, complaints });
  } catch (err) {
    next(err);
  }
});

app.patch('/api/complaints/:id/status', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, officerResponse, officerId } = req.body;

    const updated = await db.updateComplaintStatus({ id, status, officerResponse, officerId });
    res.status(200).json({ ok: true, complaint: updated });
  } catch (err) {
    next(err);
  }
});

// --- Pickups Routes ---
app.post('/api/pickups', async (req, res, next) => {
  try {
    const { address, wasteType, scheduledDate, citizenEmail } = req.body;
    const pickup = await db.schedulePickup({ address, wasteType, scheduledDate, citizenEmail });
    res.status(201).json({ ok: true, pickup });
  } catch (err) {
    next(err);
  }
});

app.get('/api/pickups', async (req, res, next) => {
  try {
    const { email } = req.query;
    const pickups = await db.getPickups(email);
    res.status(200).json({ ok: true, pickups });
  } catch (err) {
    next(err);
  }
});

// --- Admin Analytics Routes ---
app.get('/api/admin/stats', async (req, res, next) => {
  try {
    const stats = await db.getAdminStats();
    res.status(200).json({ ok: true, stats });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 5. 404 & CENTRALIZED ERROR HANDLING
// ==========================================

// Catch-all for undefined routes
app.use((req, res) => {
  res.status(404).json({ ok: false, error: 'Route not found' });
});

// Centralized Express Error Handler
app.use((err, req, res, next) => {
  console.error('API Error:', err.message || err);

  if (err instanceof multer.MulterError) {
    return res.status(400).json({ ok: false, error: `File upload error: ${err.message}` });
  }

  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    ok: false,
    error: err.message || 'Internal Server Error'
  });
});

// ==========================================
// 6. START SERVER
// ==========================================
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});