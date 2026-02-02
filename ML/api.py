from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List
import pandas as pd
import joblib
import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

app = FastAPI(title="Diabetes Prediction + AI Assistant API")

try:
    model_path = os.path.join(os.path.dirname(__file__), "diabetes_model.pkl")
    ml_model = joblib.load(model_path)
    print("✅ ML model loaded")
except Exception as e:
    print(f"❌ Could not load ML model: {e}")
    ml_model = None

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
print(f"🔑 GROQ_API_KEY configured: {bool(GROQ_API_KEY)}")
client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

@app.get("/")
def health():
    return {
        "status": "ML + AI service running",
        "groq_configured": bool(GROQ_API_KEY),
        "model_loaded": ml_model is not None
    }

@app.get("/health")
def health_detailed():
    return {
        "status": "healthy",
        "groq_api_key": "configured" if GROQ_API_KEY else "NOT CONFIGURED",
        "ml_model": "loaded" if ml_model is not None else "NOT LOADED",
        "ai_client": "ready" if client is not None else "NOT READY"
    }
class PredictionRequest(BaseModel):
    gender: str
    age: int
    hypertension: int
    heart_disease: int
    smoking_history: str
    bmi: float
    HbA1c_level: float
    blood_glucose_level: int


class ChatRequest(BaseModel):
    user_message: str
    prediction_context: Dict[str, Any]
    chat_history: List[Dict[str, str]] = []

@app.post("/predict")
async def predict(request: PredictionRequest):

    if ml_model is None:
        raise HTTPException(status_code=500, detail="ML model not loaded")

    input_df = pd.DataFrame([{
        "gender": request.gender,
        "age": request.age,
        "hypertension": request.hypertension,
        "heart_disease": request.heart_disease,
        "smoking_history": request.smoking_history,
        "bmi": request.bmi,
        "HbA1c_level": request.HbA1c_level,
        "blood_glucose_level": request.blood_glucose_level
    }])

    try:
        pred = int(ml_model.predict(input_df)[0])
        proba = float(ml_model.predict_proba(input_df)[0][1])
        risk_percent = round(proba * 100, 2)

        return {
            "prediction": pred,              
            "probability": proba,
            "risk_percent": risk_percent,
            "patient_data": request.model_dump()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@app.post("/ai/chat")
def ai_chat(req: ChatRequest):

    if not GROQ_API_KEY:
        raise HTTPException(status_code=503, detail="GROQ_API_KEY not configured")
    
    if not client:
        raise HTTPException(status_code=503, detail="AI service client not initialized")

    risk_level = "High" if req.prediction_context.get("prediction") == 1 else "Low"

    system_prompt = f"""
You are an AI Health Assistant helping a patient understand
a diabetes risk prediction.

STRICT RULES:
- You are NOT a doctor
- Do NOT diagnose diabetes
- Do NOT prescribe medicines
- Do NOT give emergency advice
- Be calm, supportive, and reassuring
- Explain in simple English
- Encourage lifestyle improvements
- Encourage consulting a healthcare professional

IMPORTANT:
This prediction is NOT a diagnosis.

Prediction Result:
Risk Level: {risk_level}
Risk Percentage: {req.prediction_context.get("risk_percent")}%

Patient Data:
{req.prediction_context.get("patient_data")}
"""

    messages = [{"role": "system", "content": system_prompt}]

    # previous conversation (if any)
    for msg in req.chat_history:
        messages.append(msg)

    # current user message
    messages.append({
        "role": "user",
        "content": req.user_message
    })

    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",  # Currently supported model
            messages=messages,
            temperature=0.4,
            max_tokens=500
        )

        return {
            "reply": response.choices[0].message.content
        }

    except Exception as e:
        print(f"❌ AI response error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI response failed: {str(e)}")


class GenerateNotesRequest(BaseModel):
    patient_data: Dict[str, Any]
    current_metrics: Dict[str, Any]
    visit_history: List[Dict[str, Any]] = []


class HealthJourneyRequest(BaseModel):
    patient_data: Dict[str, Any]
    all_visits: List[Dict[str, Any]]


@app.post("/ai/generate-notes")
def generate_doctor_notes(req: GenerateNotesRequest):
    """Generate AI-powered doctor's notes and recommendations for a patient visit."""
    
    if not GROQ_API_KEY or not client:
        raise HTTPException(status_code=503, detail="AI service not configured")
    
    # Build context from patient data and metrics
    patient_info = req.patient_data
    current = req.current_metrics
    history_summary = ""
    
    if req.visit_history:
        history_summary = "\n".join([
            f"- {v.get('visitDate', 'Unknown date')}: HbA1c={v.get('metrics', {}).get('HbA1cLevel', 'N/A')}%, "
            f"BMI={v.get('metrics', {}).get('bmi', 'N/A')}, "
            f"Risk={v.get('prediction', {}).get('riskLabel', 'N/A')}"
            for v in req.visit_history[:5]  # Last 5 visits
        ])
    
    system_prompt = f"""You are a medical documentation assistant helping a doctor write clinical notes.
Generate professional, concise doctor's notes and recommendations based on the patient data.

IMPORTANT:
- Be professional and clinical in tone
- Focus on objective observations
- Provide actionable recommendations
- Keep notes between 3-5 sentences
- Keep recommendations between 3-5 bullet points

Patient Information:
- Name: {patient_info.get('name', 'Patient')}
- Age: {patient_info.get('age', 'Unknown')}
- Gender: {patient_info.get('gender', 'Unknown')}

Current Visit Metrics:
- HbA1c: {current.get('HbA1cLevel', 'Not recorded')}%
- Blood Glucose: {current.get('bloodGlucoseLevel', 'Not recorded')} mg/dL
- BMI: {current.get('bmi', 'Not recorded')}
- Hypertension: {'Yes' if current.get('hypertension') else 'No'}
- Heart Disease: {'Yes' if current.get('heartDisease') else 'No'}
- Smoking History: {current.get('smokingHistory', 'Unknown')}

Previous Visit History:
{history_summary if history_summary else 'No previous visits recorded.'}
"""

    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": "Generate clinical notes and recommendations for this patient visit. Format: Start with 'NOTES:' followed by the notes, then 'RECOMMENDATIONS:' followed by bullet points."}
            ],
            temperature=0.3,
            max_tokens=600
        )
        
        content = response.choices[0].message.content
        
        # Parse notes and recommendations
        notes = ""
        recommendations = ""
        
        if "RECOMMENDATIONS:" in content:
            parts = content.split("RECOMMENDATIONS:")
            notes_part = parts[0].replace("NOTES:", "").strip()
            recommendations = parts[1].strip()
            notes = notes_part
        else:
            notes = content.replace("NOTES:", "").strip()
        
        return {
            "notes": notes,
            "recommendations": recommendations
        }
        
    except Exception as e:
        print(f"❌ Notes generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Notes generation failed: {str(e)}")


@app.post("/ai/health-journey-analysis")
def analyze_health_journey(req: HealthJourneyRequest):
    """Analyze a patient's health journey and provide personalized advice on reducing diabetes risk."""
    
    if not GROQ_API_KEY or not client:
        raise HTTPException(status_code=503, detail="AI service not configured")
    
    patient = req.patient_data
    visits = req.all_visits
    
    # Calculate trends
    if visits:
        hba1c_values = [v.get('metrics', {}).get('HbA1cLevel') for v in visits if v.get('metrics', {}).get('HbA1cLevel')]
        bmi_values = [v.get('metrics', {}).get('bmi') for v in visits if v.get('metrics', {}).get('bmi')]
        glucose_values = [v.get('metrics', {}).get('bloodGlucoseLevel') for v in visits if v.get('metrics', {}).get('bloodGlucoseLevel')]
        risk_scores = [v.get('prediction', {}).get('riskScore') for v in visits if v.get('prediction', {}).get('riskScore')]
        
        latest = visits[0] if visits else {}
        oldest = visits[-1] if visits else {}
        
        trend_summary = f"""
Latest Metrics (most recent visit):
- HbA1c: {latest.get('metrics', {}).get('HbA1cLevel', 'N/A')}%
- BMI: {latest.get('metrics', {}).get('bmi', 'N/A')}
- Blood Glucose: {latest.get('metrics', {}).get('bloodGlucoseLevel', 'N/A')} mg/dL
- Risk Score: {latest.get('prediction', {}).get('riskScore', 'N/A')}

Progress Over {len(visits)} Visits:
- HbA1c Range: {min(hba1c_values) if hba1c_values else 'N/A'} - {max(hba1c_values) if hba1c_values else 'N/A'}%
- BMI Range: {min(bmi_values) if bmi_values else 'N/A'} - {max(bmi_values) if bmi_values else 'N/A'}
- Risk Score Range: {min(risk_scores) if risk_scores else 'N/A'} - {max(risk_scores) if risk_scores else 'N/A'}
"""
    else:
        trend_summary = "No visit history available."
    
    system_prompt = f"""You are a supportive AI health advisor analyzing a patient's diabetes risk journey.
Your goal is to provide encouraging yet realistic advice on how the patient can reduce their diabetes risk.

IMPORTANT: You must return the response in valid JSON format ONLY. Do not include any text outside the JSON block.

Schema:
{{
  "greeting": "A warm, personalized opening line",
  "summary": "2-3 sentences summarizing their progress and current status",
  "key_takeaways": [
    {{
      "title": "Metric Name (e.g., HbA1c)",
      "status": "Good/Warning/Critical",
      "content": "Explanation of their current value and what it means"
    }}
  ],
  "personalized_advice": [
    {{
      "category": "Diet/Exercise/Lifestyle",
      "action": "Specific actionable advice",
      "impact": "Why this helps"
    }}
  ],
  "next_steps": ["Specific next step 1", "Specific next step 2"]
}}

Patient Profile:
- Name: {patient.get('name', 'Patient')}
- Gender: {patient.get('gender', 'Unknown')}
- Hypertension: {'Yes' if patient.get('hypertension') else 'No'}
- Heart Disease: {'Yes' if patient.get('heartDisease') else 'No'}
- Smoking: {patient.get('smokingHistory', 'Unknown')}

{trend_summary}
"""

    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": "Analyze my health journey and provide the JSON response used for the dashboard."}
            ],
            temperature=0.4,
            max_tokens=1000,
            response_format={"type": "json_object"}
        )
        
        content = response.choices[0].message.content
        import json
        analysis_json = json.loads(content)
        
        return {
            "analysis": analysis_json,
            "visits_analyzed": len(visits)
        }
        
    except Exception as e:
        print(f"❌ Health journey analysis error: {str(e)}")
        # Fallback to simple structure if JSON parsing fails
        return {
            "analysis": {
                "greeting": "Hello, here is your health analysis.",
                "summary": "We encountered an error processing the detailed analysis, but your data is safe.",
                "key_takeaways": [],
                "personalized_advice": [],
                "next_steps": ["Consult your doctor for detailed advice."]
            },
            "visits_analyzed": len(visits)
        }


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

