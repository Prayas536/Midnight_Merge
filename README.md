# 🩺 Diabetes Patient Management System(DPMS)
 ⚙️**React · Node.js · Express · MongoDB · Python ML (Logistic Regression) · GenAI (grok / llama-3.1-8b-instant)**

A role-based preventive care platform that helps doctors detect early diabetes risk signals from routine OPD data and supports timely, informed interventions—while giving patients understandable, non-alarming guidance.

🔗**🚀Live Demo URL's:**
- PROJECT: https://diabetespredictions-vert.vercel.app  
- Backend: https://diabetesprediction-production-6f63.up.railway.app/  
- ML Service: https://diabetesprediction-production-9f42.up.railway.app/  
---

## 📃 Table of contents
- [1) 📌 Overview](#1--overview)
- [2) 🎯 Why this problem + How we address it](#2--why-this-problem--how-we-address-it)
- [3) ✨ Features](#3--features)
- [4) 🔄 Workflow (OPD-friendly CDS)](#4--workflow-opd-friendly-cds)
- [5) 🤖 ML + GenAI Integration](#5--ml--genai-integration)
- [6) ⚖️ Ethics, Bias & Limitations](#6--ethics-bias--limitations)
- [7) 💼 Business Feasibility](#7--business-feasibility)
- [8) 🛠️ Tech Stack](#8--tech-stack)
- [9) 📁 Repository Structure](#9--repository-structure)
- [10) 📡 API Overview](#10--api-overview)
- [11) ⚡ Setup (Local)](#11--setup-local)
- [12) ☁️ Deployment Notes](#12--deployment-notes)
---
## 1) Overview
Diabetes often develops **silently**. This prototype converts routine structured patient inputs (e.g., **age, BMI, HbA1c, blood glucose, comorbidities, smoking history**) into:

- ✅ an ML-based **risk estimate**  
- 🏷️ a **risk category** (Low / Medium / High)  
- 🔎 **key contributing factors**  
- 🧭 **next-step guidance** (follow-up + lifestyle actions)  

**Two user roles:**  
- **👨‍⚕️ Doctor Portal:** Patient management, visit logging, analytics, and risk prediction support  
- **👤 Patient Portal:** Visit trends, risk summaries, self-entry estimation, and a lifestyle-focused GenAI assistant *(non-diagnostic)*  
---
## 2) 🎯  Why this problem + how we address it
### 🔥  Motivation
In real OPD settings, doctors face:
- limited time per patient
- fragmented history across visits
- uncertainty in early-risk interpretation

Patients face:
- difficulty understanding probabilistic risk
- low adherence without clear next steps
### ✅ How the system maps to the problem statement
| 🧩 Requirement | ✅ How we implement it |
|---|---|
| Transform structured data into risk estimates (with uncertainty) | Logistic Regression returns probability (`riskScore`) + `confidence` proxy |
| Identify key contributing factors / modifiable drivers | Highlights major drivers (BMI, HbA1c, glucose, smoking, etc.) |
| Communicate differently for doctors & patients | Doctor view is detailed; patient view is simplified + supportive |
| Suggest next-step actions | Follow-up + lifestyle guidance + GenAI Q&A (non-diagnostic) |
| Longitudinal tracking | Visit history + trend charts across checkups |
---
## 3) ✨ Features

### 👨‍⚕️ Doctor Portal
- 🔐 Doctor signup / login  
- 👥 Create, search, update & manage patients (CRUD)  
- 📝 Log visits (checkups) and maintain longitudinal history  
- 🎯 Trigger **ML risk prediction** per visit  
- 📊 Analytics dashboard + charts for trends (HbA1c, glucose, BMI, etc.)  
- 🎫 Auto-generates patient credentials (**patientId + one-time password**)  

### 👤 Patient Portal
- 🔐 Secure login via doctor-issued credentials  
- 📚 View profile + visit history  
- 📈 Trend charts across visits  
- 🎯 Current risk status + key contributing factors  
- ✍️ Self-entry risk estimation (patient inputs → quick estimate)  
- 🤖 GenAI lifestyle assistant (diet/exercise/habits) — *non-diagnostic*  

### 🛡️ Security & Reliability
- 🔐 JWT authentication + **RBAC** (Doctor / Patient)  
- 🔒 Password hashing via **bcrypt**  
- ✅ Input validation + consistent error handling  
- ⏱️ Backend → ML calls include **timeout + retry** handling  
- 📦 Normalized responses for frontend stability  
---
## 4) Workflow (OPD-friendly CDS)
1. Doctor logs in
2. Doctor creates patient → system generates `patientId` + one-time password
3. Doctor records a visit (routine labs/vitals)
4. Backend calls ML service and stores:
   - risk score + risk label
   - visit snapshot values
5. Patient logs in and sees:
   - simplified status
   - trends across visits
   - doctor advice
6. Patient can use the GenAI assistant for lifestyle questions (non-diagnostic)

![Diabetes Workflow](frontend/assets/workflow.png)

---
## 5) 🤖 ML + GenAI integration
### 5.1 🧠 ML: Logistic Regression (Python service)
- **Model:** Logistic Regression (binary classification: diabetic vs non-diabetic)
- **Dataset:** Provided with the problem statement (used for training/validation)
- **Inputs:** age, hypertension, heart disease, BMI, HbA1c, blood glucose, smoking history
- **Outputs:**
  - `riskScore` = predicted probability (0–1)
  - `riskLabel` = Low/Medium/High (threshold-based)
  - `confidence` = confidence proxy (see note below)

### 5.2 💬 GenAI: Lifestyle Assistant (grok / llama-3.1-8b-instant)
GenAI is integrated to improve communication and reduce doctor burden by answering common prevention questions:
- diet suggestions (what to reduce/what to include)
- exercise ideas and adherence tips
- explanations of terms like HbA1c and glucose ranges

**Safety behavior**
- The assistant is instructed to avoid diagnosis, medication decisions, or emergency guidance.
- It provides educational guidance and encourages consultation with a doctor for medical decisions.

**Scope**
- GenAI is an education + coaching layer.
- Risk prediction is produced only by the ML model.
---
## 6) ⚖️ Ethics, bias & limitations
### 🛡️ Safety / non-misleading communication
- The tool communicates **risk**, not certainty.
- Patient-facing messaging avoids alarmist diagnostic language.
- GenAI assistant is constrained to non-diagnostic lifestyle guidance.
### ⚠️ Bias considerations
- Risk models may perform differently across groups (age, gender).
- (Recommended evaluation) Report metrics across subgroups to detect performance gaps.
- Training data limitations can introduce bias if the dataset under-represents certain populations.
### 🔒 Privacy & security
- Role-based access ensures:
  - Doctors access only their patients
  - Patients access only their own data
- Password hashing + JWT-based sessions
### ⛔ Limitations
- Generalization depends on the provided dataset’s representativeness.
- If lab values are missing or incorrect, risk estimates become less reliable.
- Free-tier deployments can cause initial request delay (cold start).
---
## 7) 💼 Business feasibility
### 🎯 Who would use this
- Small to mid clinics / OPD setups
- Health camps / community screenings
- Corporate wellness programs
### 💎 Value proposition
- Earlier risk visibility → earlier intervention → fewer complications
- Reduces doctor cognitive load by summarizing trends + risk drivers
- Improves patient understanding and adherence via simplified dashboards + education assistant
### 💰 Monetization options
- SaaS subscription per clinic/month
- Per-doctor seat licensing
- Paid tier for analytics (cohort risk lists, reminders, exports)
- Optional integrations with labs / EMR systems (future)
### 〰️ Implementation feasibility
- Uses low-cost web stack and lightweight ML inference
- Can be piloted in a single clinic with minimal integration requirements
---
## 8) 🛠️ Tech stack
- Frontend: React + UI libraries
- Backend: Node.js + Express
- Database: MongoDB
- ML: Python (REST API)
- Auth: JWT + bcrypt
---
## 9) 📁 Repository structure
```bash
Diabetes/
  ├── backend/
  ├── frontend/
  └── ML/ 
```
---
## 10) 📡 API overview
#### Auth:

- POST /api/auth/register-doctor
- POST /api/auth/login
- POST /api/auth/login-patient
- GET /api/auth/me

#### Patients (Doctor only):

- POST /api/patients
- GET /api/patients?q=search
- GET /api/patients/:id
- PUT /api/patients/:id
- DELETE /api/patients/:id

#### Visits:

- POST /api/patients/:id/visits
- GET /api/patients/:id/visits
- GET /api/my/visits
- GET /api/my/profile

#### Prediction:

- POST /api/predictions

##### Standard response format:

{ "success": true, "data": {} }
{ "success": false, "message": "...", "errors": [...] }

## 11)⚡ Setup (local)
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

### 12) ☁️ Deployment Notes
- ✅ **Frontend:** Deployed on Vercel (fast load)  
- ✅ **Backend + ML:** Deployed on Railway free tier  
- ⏳ **Cold start warning:** Free tier may sleep when idle → first request can take ~10–30s to wake up  

> ⚠️ If the issue still persists, kindly open the **Backend** and **ML** URLs in separate Chrome windows.


---

