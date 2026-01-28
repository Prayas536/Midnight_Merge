# from fastapi import FastAPI, HTTPException
# from pydantic import BaseModel
# import pandas as pd
# import joblib
# import os
# import requests
# from dotenv import load_dotenv
# from typing import Dict, Any

# load_dotenv()

# app = FastAPI(title="Diabetes Prediction API")

# # Load the model
# try:
#     model_path = os.path.join(os.path.dirname(__file__), "diabetes_model.pkl")
#     ml_model = joblib.load(model_path)
#     print("Model loaded successfully")
# except Exception as e:
#     print(f"Could not load ML model: {e}")
#     ml_model = None

# # Check API key
# api_key = os.getenv("SAMBANOVA_API_KEY")
# print(f"API key loaded: {api_key is not None}")

# @app.get("/")
# def health():
#     return {"status": "ML running"}


# class PredictionRequest(BaseModel):
#     gender: str
#     age: int
#     hypertension: int
#     heart_disease: int
#     smoking_history: str
#     bmi: float
#     HbA1c_level: float
#     blood_glucose_level: int

# def sambanova_patient_explanation(patient_dict: Dict[str, Any], risk_percent: float, pred: int) -> str:
#     """
#     Generates a patient-friendly explanation using SambaNova API.
#     """
#     api_key = os.getenv("SAMBANOVA_API_KEY")
#     if not api_key:
#         return "API key missing."

#     prompt = f"""
#     You are a healthcare assistant inside a clinical decision support tool.
#     Write a patient-friendly explanation in SIMPLE English.

#     Rules:
#     - Do NOT say "you have diabetes". This is only a risk estimate.
#     - Be calm and supportive, not scary.
#     - Use bullet points.
#     - Mention key reasons using the patient's values (e.g., BMI of {patient_dict['bmi']}).
#     - Suggest next steps: confirmatory tests and lifestyle changes.
#     - End with a safety note: consult a doctor.
#     - Include a diet chart in tabular form (use Markdown table format).
#     - Suggest exercises based on the patient's health data, and include suggestions for images (provide image URLs or descriptions that can be displayed visually).
#     - Add visually appealing elements like emojis, bold text, or simple formatting to make it engaging.

#     Patient data: {patient_dict}
#     Model output: prediction={pred} (0=no diabetes, 1=high risk), risk={risk_percent:.2f}%

#     Output format (use exactly these headings):
#     Title:
#     What this means:
#     Why this result:
#     What you can do now:
#     When to see a doctor:
#     Safety note:
#     Diet Chart:
#     Exercise Suggestions:
#     """

#     api_url = "https://api.sambanova.ai/v1/chat/completions"
#     headers = {
#         "Authorization": f"Bearer {api_key}",
#         "Content-Type": "application/json"
#     }
#     payload = {
#         "model": "llama3-8b",
#         "messages": [{"role": "user", "content": prompt}],
#         "max_tokens": 500,
#         "temperature": 0.7
#     }

#     try:
#         response = requests.post(api_url, headers=headers, json=payload, timeout=10)
#         if response.status_code == 200:
#             result = response.json()
#             return result["choices"][0]["message"]["content"]
#         else:
#             return f"Error: {response.status_code} - {response.text}"
#     except Exception as e:
#         return f"AI Explanation failed: {str(e)}"

# @app.post("/predict")
# async def predict(request: PredictionRequest):
#     if ml_model is None:
#         raise HTTPException(status_code=500, detail="ML model not loaded")

#     input_df = pd.DataFrame([{
#         "gender": request.gender,
#         "age": request.age,
#         "hypertension": request.hypertension,
#         "heart_disease": request.heart_disease,
#         "smoking_history": request.smoking_history,
#         "bmi": request.bmi,
#         "HbA1c_level": request.HbA1c_level,
#         "blood_glucose_level": request.blood_glucose_level
#     }])

#     try:
#         pred = int(ml_model.predict(input_df)[0])
#         proba = float(ml_model.predict_proba(input_df)[0][1])
#         risk_percent = proba * 100

#         patient_dict = request.model_dump()

#         explanation = sambanova_patient_explanation(patient_dict, risk_percent, pred)

#         return {
#             "prediction": pred,
#             "probability": proba,
#             "risk_percent": risk_percent,
#             "explanation": explanation
#         }
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")
    
# if __name__ == "__main__":
#     import uvicorn
#     port = int(os.environ.get("PORT", 8000))
#     uvicorn.run(app, host="0.0.0.0", port=port)














from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List
import pandas as pd
import joblib
import os
from dotenv import load_dotenv
from groq import Groq

# -------------------------------------------------
# Load environment variables
# -------------------------------------------------
load_dotenv()

# -------------------------------------------------
# App init
# -------------------------------------------------
app = FastAPI(title="Diabetes Prediction + AI Assistant API")

# -------------------------------------------------
# Load ML model
# -------------------------------------------------
try:
    model_path = os.path.join(os.path.dirname(__file__), "diabetes_model.pkl")
    ml_model = joblib.load(model_path)
    print("✅ ML model loaded")
except Exception as e:
    print(f"❌ Could not load ML model: {e}")
    ml_model = None

# -------------------------------------------------
# Groq client
# -------------------------------------------------
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
print(f"🔑 GROQ_API_KEY configured: {bool(GROQ_API_KEY)}")
client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

# -------------------------------------------------
# Health check
# -------------------------------------------------
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

# -------------------------------------------------
# Schemas
# -------------------------------------------------
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


# -------------------------------------------------
# Prediction endpoint (PURE ML)
# -------------------------------------------------
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
            "prediction": pred,              # 0 or 1
            "probability": proba,
            "risk_percent": risk_percent,
            "patient_data": request.model_dump()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


# -------------------------------------------------
# AI CHAT ENDPOINT (CONVERSATIONAL)
# -------------------------------------------------
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


# -------------------------------------------------
# Run locally (Render ignores this)
# -------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
