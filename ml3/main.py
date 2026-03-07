from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import pandas as pd
import numpy as np
import os
import json
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

app = FastAPI()

# Load the trained model
base_dir = os.path.dirname(os.path.abspath(__file__))
# Setup Groq Client
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None
model_path = os.path.join(base_dir, 'stress_level_model.pkl')

try:
    model = joblib.load(model_path)
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

# Define the request payload format
class StressPredictionRequest(BaseModel):
    gender: str
    age: int
    occupation: str
    sleep_duration: float
    quality_of_sleep: int
    physical_activity_level: int
    bmi_category: str
    blood_pressure: str
    heart_rate: int
    daily_steps: int
    sleep_disorder: str

from fastapi import Request

@app.post("/predict_stress")
async def predict_stress(request: Request):
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded. Ensure train_model.py has run.")

    body = await request.json()
    print(f"📥 Received payload: {body}")

    try:
        # Manually extract fields to provide better error messages
        gender = body.get('gender')
        age = body.get('age')
        occupation = body.get('occupation')
        sleep_duration = body.get('sleep_duration')
        quality_of_sleep = body.get('quality_of_sleep')
        physical_activity_level = body.get('physical_activity_level')
        bmi_category = body.get('bmi_category')
        blood_pressure = body.get('blood_pressure')
        heart_rate = body.get('heart_rate')
        daily_steps = body.get('daily_steps')
        sleep_disorder = body.get('sleep_disorder')

        # Check for missing fields
        missing = [f for f in ['gender', 'age', 'occupation', 'sleep_duration', 'quality_of_sleep', 
                              'physical_activity_level', 'bmi_category', 'blood_pressure', 
                              'heart_rate', 'daily_steps', 'sleep_disorder'] if body.get(f) is None]
        if missing:
            raise ValueError(f"Missing fields: {', '.join(missing)}")

        # Split blood pressure into Systolic and Diastolic
        try:
            bps = str(blood_pressure).split('/')
            systolic = float(bps[0])
            diastolic = float(bps[1])
        except (ValueError, IndexError):
            raise ValueError(f"Invalid blood pressure format: {blood_pressure}. Expected SYS/DIA (e.g., 120/80).")

        # Create a single row DataFrame to match expected pipeline input
        # Column names must match those in the trainer exactly
        input_data = pd.DataFrame([{
            'Gender': gender,
            'Age': int(age),
            'Occupation': occupation,
            'Sleep Duration': float(sleep_duration),
            'Quality of Sleep': int(quality_of_sleep),
            'Physical Activity Level': int(physical_activity_level),
            'BMI Category': bmi_category,
            'Heart Rate': int(heart_rate),
            'Daily Steps': int(daily_steps),
            'Sleep Disorder': sleep_disorder,
            'Systolic': systolic,
            'Diastolic': diastolic
        }])

        print(f"📊 Input DataFrame columns: {input_data.columns.tolist()}")

        # The model is a Pipeline including ColumnTransformer and RandomForestRegressor
        prediction = model.predict(input_data)
        stress_level = float(prediction[0])

        return {"stress_level": stress_level}

    except Exception as e:
        import traceback
        error_msg = f"Prediction error: {str(e)}"
        print(f"❌ {error_msg}")
        print(traceback.format_exc())
        raise HTTPException(status_code=400, detail=error_msg)

class CombinedStressRequest(BaseModel):
    gender: str
    age: int
    occupation: str
    sleep_duration: float
    quality_of_sleep: int
    physical_activity_level: int
    bmi_category: str
    blood_pressure: str
    heart_rate: int
    daily_steps: int
    sleep_disorder: str
    message: str

@app.post("/ai_stress_advice")
async def ai_stress_advice(request: CombinedStressRequest):
    if not GROQ_API_KEY or not client:
        raise HTTPException(status_code=503, detail="AI service not configured on ML3.")
        
    try:
        # We need the numerical score from the request body directly because the UI button will send it
        # Temporarily, we will recalculate it from the ML model since we are forwarding the full CombinedStressRequest which the ML needs anyway
        bps = str(request.blood_pressure).split('/')
        systolic = float(bps[0])
        diastolic = float(bps[1])

        input_data = pd.DataFrame([{
            'Gender': request.gender,
            'Age': int(request.age),
            'Occupation': request.occupation,
            'Sleep Duration': float(request.sleep_duration),
            'Quality of Sleep': int(request.quality_of_sleep),
            'Physical Activity Level': int(request.physical_activity_level),
            'BMI Category': request.bmi_category,
            'Heart Rate': int(request.heart_rate),
            'Daily Steps': int(request.daily_steps),
            'Sleep Disorder': request.sleep_disorder,
            'Systolic': systolic,
            'Diastolic': diastolic
        }])
        
        num_prediction = model.predict(input_data)
        ml_score = float(num_prediction[0])
        
        message = request.message.strip()
        
        system_prompt = f"""You are an empathetic, professional AI health and lifestyle advisor helping a user manage their stress.
The user has completed a stress assessment based on physical metrics (sleep, activity, heart rate, etc.), which gave them a numerical Stress Score of {round(ml_score, 2)} out of 10.
Additionally, the user provided the following personal reflection about their current situation:
"{message}"

Based on the Stress Score of {round(ml_score, 2)} and their personal reflection, provide an encouraging, personalized message to help them understand their situation and offer tailored advice.

IMPORTANT: You must return the response in valid JSON format ONLY. Do not write anything outside the JSON block.

Schema:
{{
  "mood": "Detected Mood (e.g., Happy, Neutral, Stressed, Overwhelmed)",
  "text": "A personalized, empathetic 3-4 sentence message addressing their specific problem and acknowledging their stress score.",
  "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"]
}}
"""

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": "Analyze my situation and provide the JSON response containing mood, message, and recommendations."}
            ],
            temperature=0.6,
            max_tokens=600,
            response_format={"type": "json_object"}
        )
        
        content = response.choices[0].message.content
        analysis_json = json.loads(content)
        
        return {
            "success": True,
            "stress_level": round(ml_score, 2),
            "mood": analysis_json.get("mood", "Neutral"),
            "ai_message": analysis_json.get("text", "Thank you for sharing your thoughts. Please take care of yourself."),
            "recommendations": analysis_json.get("recommendations", ["Take a deep breath.", "Stay hydrated."]),
        }
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict_stress_combined")
async def predict_stress_combined(request: CombinedStressRequest):
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded.")

    try:
        # 1. Numerical Prediction
        bps = str(request.blood_pressure).split('/')
        systolic = float(bps[0])
        diastolic = float(bps[1])

        input_data = pd.DataFrame([{
            'Gender': request.gender,
            'Age': int(request.age),
            'Occupation': request.occupation,
            'Sleep Duration': float(request.sleep_duration),
            'Quality of Sleep': int(request.quality_of_sleep),
            'Physical Activity Level': int(request.physical_activity_level),
            'BMI Category': request.bmi_category,
            'Heart Rate': int(request.heart_rate),
            'Daily Steps': int(request.daily_steps),
            'Sleep Disorder': request.sleep_disorder,
            'Systolic': systolic,
            'Diastolic': diastolic
        }])
        
        num_prediction = model.predict(input_data)
        num_stress_level = float(num_prediction[0])

        # 2. Text Analysis
        text = request.message.lower()
        stress_keywords = ['stressed', 'overwhelmed', 'deadline', 'busy', 'tired', 'anxious', 'pressure', 'exhausted', 'hard', 'difficult', 'struggling', 'sad', 'angry', 'frustrated', 'worried', 'nervous']
        happy_keywords = ['happy', 'great', 'amazing', 'relaxed', 'fun', 'good', 'wonderful', 'joy', 'excited', 'calm', 'peaceful', 'satisfied', 'excellent', 'love', 'liked', 'best']
        
        stress_count = sum(1 for word in stress_keywords if word in text)
        happy_count = sum(1 for word in happy_keywords if word in text)
        
        text_score = 5.0 + (stress_count * 1.5) - (happy_count * 1.0)
        text_score = max(0.0, min(10.0, text_score))

        # 3. Combine Scores (Weighted average: 70% health, 30% text)
        # If message is empty, use 100% health
        if not request.message.strip():
            final_stress_level = num_stress_level
        else:
            final_stress_level = (num_stress_level * 0.7) + (text_score * 0.3)

        # 4. Determine Mood and Recommendations based on final level
        mood = "Neutral"
        recommendations = []
        
        if final_stress_level >= 8.0:
            mood = "Very Stressed"
            recommendations = ["Take a 15-minute guided meditation.", "Listen to soft music.", "Practice deep breathing."]
        elif final_stress_level >= 6.0:
            mood = "Stressed"
            recommendations = ["Try a light workout.", "Watch a comedy movie.", "Try to disconnect from screens."]
        elif final_stress_level <= 2.0:
            mood = "Very Happy"
            recommendations = ["Share your positive energy!", "Write in a gratitude journal."]
        elif final_stress_level <= 4.0:
            mood = "Happy"
            recommendations = ["Enjoy your favorite hobby.", "Plan something fun for the weekend."]
        else:
            mood = "Neutral"
            recommendations = ["A balanced day! Get 8 hours of sleep.", "Consider a light walk."]

        return {
            "stress_level": round(final_stress_level, 2),
            "mood": mood,
            "recommendations": recommendations,
            "breakdown": {
                "health_stress_level": round(num_stress_level, 2),
                "text_stress_score": round(text_score, 2)
            }
        }

    except Exception as e:
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    # Make sure this runs on port 8002 to avoid collision with ml1 (8000) and ml2 (8001)
    uvicorn.run(app, host="0.0.0.0", port=8002)
