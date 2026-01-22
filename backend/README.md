# Diabetes Patient Management System — Backend (Node/Express/Mongo)

## Features
- Doctor & patient auth (JWT)
- Doctor CRUD for patients + visit logging
- Patient self portal endpoints (/api/my/*)
- ML risk prediction proxy (/api/predictions) -> calls Streamlit endpoint
- Validation, RBAC, consistent API responses

## Setup
1) Install deps
```bash
cd backend
npm install
```

2) Create env
```bash
cp .env.example .env
```
Edit values as needed.

3) Run MongoDB locally (example)
```bash
mongod
```

4) Start backend
```bash
npm run dev
# or
npm start
```

Server will run on http://localhost:5000

## Notes on Auth Token Storage
This template supports:
- **localStorage** token (default): simpler in dev
- **HttpOnly cookie** (recommended in production): set `USE_AUTH_COOKIE=true`

Frontend is built to work with localStorage by default. If you switch to cookies, enable `withCredentials` in frontend axios and update CORS.

## Streamlit ML endpoint
Backend expects a JSON endpoint at `ML_PREDICT_URL` (default: http://localhost:8501/predict)

If your Streamlit app currently only renders UI, add a JSON route (example in README at repo root).
