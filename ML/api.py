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


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
