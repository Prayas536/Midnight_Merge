from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pandas as pd
import joblib
import os
import requests
from dotenv import load_dotenv
from typing import Dict, Any

load_dotenv()

app = FastAPI(title="Diabetes Prediction API")

# Load the model
try:
    model_path = os.path.join(os.path.dirname(__file__), "diabetes_model.pkl")
    ml_model = joblib.load(model_path)
    print("Model loaded successfully")
except Exception as e:
    print(f"Could not load ML model: {e}")
    ml_model = None

# Check API key
api_key = os.getenv("SAMBANOVA_API_KEY")
print(f"API key loaded: {api_key is not None}")

@app.get("/")
def health():
    return {"status": "ML running"}


class PredictionRequest(BaseModel):
    gender: str
    age: int
    hypertension: int
    heart_disease: int
    smoking_history: str
    bmi: float
    HbA1c_level: float
    blood_glucose_level: int

def sambanova_patient_explanation(patient_dict: Dict[str, Any], risk_percent: float, pred: int) -> str:
    """
    Generates a patient-friendly explanation using SambaNova API.
    """
    api_key = os.getenv("SAMBANOVA_API_KEY")
    if not api_key:
        return "API key missing."

    prompt = f"""
    You are a healthcare assistant inside a clinical decision support tool.
    Write a patient-friendly explanation in SIMPLE English.

    Rules:
    - Do NOT say "you have diabetes". This is only a risk estimate.
    - Be calm and supportive, not scary.
    - Use bullet points.
    - Mention key reasons using the patient's values (e.g., BMI of {patient_dict['bmi']}).
    - Suggest next steps: confirmatory tests and lifestyle changes.
    - End with a safety note: consult a doctor.
    - Include a diet chart in tabular form (use Markdown table format).
    - Suggest exercises based on the patient's health data, and include suggestions for images (provide image URLs or descriptions that can be displayed visually).
    - Add visually appealing elements like emojis, bold text, or simple formatting to make it engaging.

    Patient data: {patient_dict}
    Model output: prediction={pred} (0=no diabetes, 1=high risk), risk={risk_percent:.2f}%

    Output format (use exactly these headings):
    Title:
    What this means:
    Why this result:
    What you can do now:
    When to see a doctor:
    Safety note:
    Diet Chart:
    Exercise Suggestions:
    """

    api_url = "https://api.sambanova.ai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "llama3-8b",
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 500,
        "temperature": 0.7
    }

    try:
        response = requests.post(api_url, headers=headers, json=payload, timeout=10)
        if response.status_code == 200:
            result = response.json()
            return result["choices"][0]["message"]["content"]
        else:
            return f"Error: {response.status_code} - {response.text}"
    except Exception as e:
        return f"AI Explanation failed: {str(e)}"

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
        risk_percent = proba * 100

        patient_dict = request.model_dump()

        explanation = sambanova_patient_explanation(patient_dict, risk_percent, pred)

        return {
            "prediction": pred,
            "probability": proba,
            "risk_percent": risk_percent,
            "explanation": explanation
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")
    
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
