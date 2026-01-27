# 🩺 Diabetes Patient Management System

**React · Node.js · Express · MongoDB · ML · GenAI**

🔗 **[Live Demo](https://diabetespredictions-vert.vercel.app)**

## Overview

A full-stack Diabetes Patient Management System for doctors and patients with secure authentication, analytics dashboards, and ML-based risk prediction.

**Demonstrates:** Scalable backend architecture, role-based access control, ML & GenAI integration, production-ready API design.

## ✨ Features

**👨‍⚕️ Doctor Portal**
- Create, update & manage patients (CRUD)
- Log patient visits
- View analytics & charts
- Trigger ML risk prediction

**🧑‍🦽 Patient Portal**
- Secure login
- View profile & visit history
- Health trend charts

**🔐 Security & Backend**
- JWT authentication + Bcrypt hashing
- Input validation & RBAC
- HttpOnly cookies (production)

**🤖 ML & GenAI Integration**
- Server-side ML model calls
- Retry + timeout handling
- Normalized prediction responses

## 🗂️ Monorepo Structure

```
Diabetes/
  ├── backend/
  ├── frontend/
  └── ML/
```

## ⚡ Quick Start

**Prerequisites:** Node.js 18+, MongoDB (local/Atlas), ML endpoint

**Backend:**
```bash
cd backend && npm install && npm run dev
```

**Frontend:**
```bash
cd frontend && npm install && npm start
```

**ML Service:**
```bash
cd ML && py -3.11 -m venv venv && venv\Scripts\activate
pip install -r requirements.txt && python api.py
```

**Open:** 
- Frontend **[Live Demo](https://diabetespredictions-vert.vercel.app)**, 
- Backend **[Live Demo](https://diabetes-backend-1fwr.onrender.com)**, 
- ML **[Live Demo](https://diabetes-ml-xqt3.onrender.com)**

## 🔐 Onboarding Flow

1. Register a doctor
2. Doctor creates patient (returns `patientId` + auto-generated password)
3. Patient logs in with `patientId` + password

> Passwords are hashed in DB; plain password shown once only at creation.

## 🤖 ML Integration

**ML Endpoint Contract:**
```
POST /predict
Response: { "riskLabel": "High", "riskScore": 0.82, "confidence": 0.82 }
```

**Environment Variables:**

| **Frontend** | **Backend** | **ML** |
|---|---|---|
| `REACT_APP_API_BASE_URL` | `PORT`, `NODE_ENV`, `MONGO_URI` | `SAMBANOVA_API_KEY` |
| `SAMBANOVA_API_KEY` | `JWT_SECRET`, `JWT_EXPIRES_IN` | |
| | `CORS_ORIGIN`, `USE_AUTH_COOKIE` | |
| | `ML_PREDICT_URL`, `ML_TIMEOUT_MS`, `ML_RETRY_COUNT` | |

## 📡 API Overview

**Auth:** `POST /api/auth/register-doctor`, `POST /api/auth/login`, `POST /api/auth/login-patient`, `GET /api/auth/me`

**Patients (Doctor only):** `POST /api/patients`, `GET /api/patients?q=search`, `GET /api/patients/:id`, `PUT /api/patients/:id`, `DELETE /api/patients/:id`

**Visits:** `POST /api/patients/:id/visits`, `GET /api/patients/:id/visits`, `GET /api/my/visits`, `GET /api/my/profile`

**Prediction:** `POST /api/predictions`

**Response Format:** `{ "success": true, "data": {} }` or `{ "success": false, "message": "...", "errors": [...] }`

## ⚠️ Loading Time Note

**Deployment:** Frontend on Vercel (instant), Backend & ML on Render (free tier)

**Why delay:** Render free tier sleeps when idle; first request wakes it up (10–30s). Subsequent requests are fast.

If you see a loading animation, please wait—the system is initializing.
