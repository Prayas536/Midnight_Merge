# Diabetes Patient Management System (React + Node/Express + MongoDB +ML & GENAI Integration)

## What you get
- Doctor portal: patient CRUD, visit logging, analytics charts, ML risk prediction
- Patient portal: profile, visit history, charts
- Secure API: JWT + bcrypt + validation + RBAC
- ML integration: backend calls your Streamlit model endpoint (never from frontend)

---

## Monorepo structure
```
Diabetes/
  backend/
  frontend/
  streamlit/
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
npm run dev
```

### Frontend
```bash
cd ../frontend
npm install
npm start
```

### Streamlit
```bash
python -m venv .venv
pip install -r streamlit\requirements.txt
cd ../streamlit
python api.py
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
### Frontend env
Set:
- `SAMBANOVA_API_KEY`
- `REACT_APP_API_BASE_URL`
### Backend env
Set:
- `NODE_ENV`
- `MONGO_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `CORS_ORIGIN`
- `USE_AUTH_COOKIE`
- `COOKIE_NAME`
- `SAMBANOVA_API_KEY`
- `ML_PREDICT_URL`
- `ML_TIMEOUT_MS`
- `ML_RETRY_COUNT`
- `MODEL_VERSION`

Backend will call ML URL from server side with retries and return normalized result.

### Streamlit env(name it as sambanova.env)
Set:
- `SAMBANOVA_API_KEY`
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
