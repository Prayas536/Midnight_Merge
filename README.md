# Diabetes Patient Management System (React + Node/Express + MongoDB)

## What you get
- Doctor portal: patient CRUD, visit logging, analytics charts, ML risk prediction
- Patient portal: profile, visit history, charts
- Secure API: JWT + bcrypt + validation + RBAC
- ML integration: backend calls your Streamlit model endpoint (never from frontend)

---

## Monorepo structure
```
diabetes-pms/
  backend/
  frontend/
```

---

## 1) Run locally (quickstart)

### Prereqs
- Node.js 18+
- MongoDB running locally or a MongoDB Atlas URI
- Your Streamlit model deployed with a JSON prediction endpoint (see section 4)

### Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Frontend
```bash
cd ../frontend
npm install
cp .env.example .env
npm start
```

Open:
- Frontend: http://localhost:3000
- Backend health: http://localhost:5000/api/health

---

## 2) Default logins / onboarding flow
1) Register a doctor
2) Doctor creates a patient — the API returns `patientId` and a generated patient password (shown once)
3) Patient logs in using patientId + password

> Patient passwords are hashed in DB; plain password is only returned once at creation.

---

## 3) Streamlit ML integration (important)

### Recommended Streamlit JSON API contract
Expose an endpoint like:
- `POST /predict`
- Request JSON: the exact model inputs (example below)
- Response JSON:
```json
{
  "riskLabel": "High",
  "riskScore": 0.82,
  "confidence": 0.82
}
```

### If your Streamlit app does NOT have a JSON route
Best practical approach: add a small FastAPI/Flask wrapper next to Streamlit, OR add a `st.experimental_connection`-based handler.
Because Streamlit is UI-first, many deployments don't expose JSON routes by default.

**Simple Streamlit option (works in many cases):**
Add to your Streamlit code (example idea only; adjust to your app):
```python
# streamlit_app.py
import streamlit as st
from streamlit.web.server import Server
from flask import Flask, request, jsonify

# NOTE: Streamlit doesn't officially promote Flask embedding in all setups.
# If this doesn't work on your host, use a separate FastAPI wrapper.
```

**Most reliable option (recommended):**
Create a small `fastapi_wrapper` service that loads the same model artifact and exposes `/predict` as JSON.
Then point backend `ML_PREDICT_URL` to that wrapper.

### Backend env
Set:
- `ML_PREDICT_URL`
- `ML_TIMEOUT_MS`
- `ML_RETRY_COUNT`
- `MODEL_VERSION`

Backend will call ML URL from server side with retries and return normalized result.

---

## 4) API overview

Auth:
- POST `/api/auth/register-doctor`
- POST `/api/auth/login`
- POST `/api/auth/login-patient`
- GET  `/api/auth/me`

Patients (doctor only):
- POST `/api/patients`
- GET `/api/patients?q=search`
- GET `/api/patients/:id`
- PUT `/api/patients/:id`
- DELETE `/api/patients/:id`

Visits:
- POST `/api/patients/:id/visits` (doctor)
- GET `/api/patients/:id/visits` (doctor)
- GET `/api/my/visits` (patient)
- GET `/api/my/profile` (patient)

Prediction:
- POST `/api/predictions` (doctor)

Response shape:
- Success: `{ "success": true, "data": ... }`
- Error: `{ "success": false, "message": "...", "errors": [...] }`

---

## 5) Production notes (short)
- Use HttpOnly cookie mode: set `USE_AUTH_COOKIE=true`
- Put API behind HTTPS + set secure cookie options
- Lock CORS to your real frontend origin
- Use MongoDB Atlas in production
