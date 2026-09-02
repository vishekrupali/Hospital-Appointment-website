const express = require('express');
const cors = require('cors');
const path = require('path');
const Database = require('better-sqlite3');

const app = express();
const PORT = 8080;

app.use(cors());
app.use(express.json());

const db = new Database(path.join(__dirname, 'nitya_clinic.db'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    mobile TEXT NOT NULL UNIQUE,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    patient_name TEXT NOT NULL,
    mobile TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'PENDING',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

const DOCTOR_USERNAME = 'Nitya';
const DOCTOR_PASSWORD = 'Nitya123';

function getDoctor() {
  return {
    id: 1,
  name: 'Dr. Nitya',
  degree: 'MBBS',
    username: DOCTOR_USERNAME
  };
}

// ==================== PATIENT AUTH ====================
app.post('/api/patients/login', (req, res) => {
  const { name, mobile } = req.body;
  if (!name || !name.trim() || !mobile || !mobile.trim()) {
    return res.status(400).json({ success: false, message: 'Name and mobile number are required.' });
  }
  if (!/^\d{10}$/.test(mobile.trim())) {
    return res.status(400).json({ success: false, message: 'Mobile number must be exactly 10 digits.' });
  }

  const existing = db.prepare('SELECT * FROM patients WHERE mobile = ?').get(mobile.trim());
  if (existing) {
    return res.json({ success: true, message: 'Login successful.', data: existing });
  }

  const info = db.prepare('INSERT INTO patients (name, mobile) VALUES (?, ?)')
    .run(name.trim(), mobile.trim());
  const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(info.lastInsertRowid);

  res.status(201).json({ success: true, message: 'Welcome! Your account has been created.', data: patient });
});

// ==================== DOCTOR AUTH ====================
app.post('/api/doctor/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required.' });
  }
  if (username.trim() === DOCTOR_USERNAME && password === DOCTOR_PASSWORD) {
    return res.json({ success: true, message: 'Login successful.', data: getDoctor() });
  }
  res.status(401).json({ success: false, message: 'Invalid username or password.' });
});

// ==================== APPOINTMENTS ====================
app.post('/api/appointments', (req, res) => {
  const { patientId, patientName, mobile, date, time, reason, status } = req.body;
  if (!patientId || !date || !time) {
    return res.status(400).json({ success: false, message: 'Patient, date, and time are required.' });
  }

  const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(patientId);
  if (!patient) {
    return res.status(404).json({ success: false, message: 'Patient not found. Please log in again.' });
  }

  const name = patient.name || patientName || '';
  const phone = patient.mobile || mobile || '';

  const existing = db.prepare(
    'SELECT * FROM appointments WHERE date = ? AND time = ? AND status IN (?, ?)'
  ).all(date, time, 'PENDING', 'CONFIRMED');

  if (existing.length > 0) {
    return res.status(409).json({ success: false, message: 'This time slot is already booked. Please choose another time.' });
  }

  const info = db.prepare(
    'INSERT INTO appointments (patient_id, patient_name, mobile, date, time, reason, status) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(patientId, name, phone, date, time, reason || '', status || 'PENDING');

  const appointment = db.prepare('SELECT * FROM appointments WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json({ success: true, message: 'Appointment booked successfully.', data: appointment });
});

app.get('/api/appointments', (req, res) => {
  const appointments = db.prepare('SELECT * FROM appointments ORDER BY date DESC, time DESC').all();
  res.json({ success: true, message: 'Appointments retrieved.', data: appointments });
});

app.get('/api/appointments/patient/:patientId', (req, res) => {
  const appointments = db.prepare(
    'SELECT * FROM appointments WHERE patient_id = ? ORDER BY date DESC, time DESC'
  ).all(req.params.patientId);
  res.json({ success: true, message: 'Appointments retrieved.', data: appointments });
});

app.get('/api/appointments/date/:date', (req, res) => {
  const appointments = db.prepare(
    'SELECT * FROM appointments WHERE date = ? ORDER BY time'
  ).all(req.params.date);
  res.json({ success: true, message: 'Appointments retrieved.', data: appointments });
});

app.put('/api/appointments/:id/status', (req, res) => {
  const { status } = req.body;
  if (!status || !['PENDING', 'CONFIRMED', 'CANCELLED'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status. Must be PENDING, CONFIRMED, or CANCELLED.' });
  }

  const appointment = db.prepare('SELECT * FROM appointments WHERE id = ?').get(req.params.id);
  if (!appointment) {
    return res.status(404).json({ success: false, message: 'Appointment not found.' });
  }

  db.prepare('UPDATE appointments SET status = ? WHERE id = ?').run(status, req.params.id);
  const updated = db.prepare('SELECT * FROM appointments WHERE id = ?').get(req.params.id);

  res.json({ success: true, message: 'Appointment status updated.', data: updated });
});

app.listen(PORT, () => {
  console.log('======================================');
  console.log('  Nitya Clinic Backend Started!      ');
  console.log(`  http://localhost:${PORT}             `);
  console.log('======================================');
  console.log('  Doctor login: sachin / bhakare123  ');
  console.log('======================================');
});
