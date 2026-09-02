# 🏥 Nitya Clinic - Appointment System

A complete hospital appointment booking system for **Nitya Clinic** by **Dr. Nitya (MBBS)**.

## 🔑 Login Credentials

| Role | Login Page | Credentials |
|------|-----------|-------------|
| **Patient** | `patient-login.html` | Any name + 10-digit mobile number (auto-registers) |
| **Doctor** | `doctor-login.html` | Username: `sachin` / Password: `bhakare123` |

## 📁 Project Structure

```
NityaClinic/
├── backend/                 # Node.js + Express + SQLite API
│   ├── server.js            # Main backend server
│   ├── package.json
│   └── nitya_clinic.db    # SQLite database (auto-created)
├── frontend/
│   ├── css/style.css        # Styles
│   ├── js/                  # Frontend logic
│   ├── patient-login.html   # Patient login page
│   ├── doctor-login.html    # Doctor login page
│   ├── appointment.html     # Patient appointment booking page
│   └── doctor-dashboard.html# Doctor's private appointments view
├── start-backend.bat        # One-click backend launcher
└── open-patient.bat         # Opens patient login page
```

## 🚀 How to Run

### 1. Start the Backend (required - stores appointment data)
Double-click **`start-backend.bat`** — OR run manually:
```bash
cd backend
npm start
```
You should see: `Nitya Clinic Backend Started! http://localhost:8080`

### 2. Open the Website
Double-click **`open-patient.bat`** — OR open `frontend/patient-login.html` in your browser.

## 🔄 How It Works

1. **Patient** logs in with name + mobile number → lands on **appointment page**
2. Patient picks a date, time slot, adds reason → books appointment
3. **Doctor** logs in (sachin / bhakare123) → opens **dashboard**
4. Doctor sees ALL patient appointments (name, mobile, date, time, reason)
5. Doctor can **Confirm** or **Cancel** each appointment
6. All data is stored in the backend SQLite database (only the doctor can see it)

## 📡 API Endpoints

| Method | URL | Purpose |
|--------|-----|---------|
| POST | `/api/patients/login` | Patient login / auto-register |
| POST | `/api/doctor/login` | Doctor login |
| POST | `/api/appointments` | Create appointment |
| GET | `/api/appointments` | Get all appointments (doctor) |
| GET | `/api/appointments/patient/:id` | Get a patient's appointments |
| GET | `/api/appointments/date/:date` | Get appointments by date |
| PUT | `/api/appointments/:id/status` | Confirm / cancel appointment |

## ⚙️ Tech Stack
- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express
- **Database:** SQLite (file-based, no setup needed)

> ⚠️ The doctor's dashboard is only visible after logging in with the doctor credentials, so patient appointment data stays private to the doctor.
