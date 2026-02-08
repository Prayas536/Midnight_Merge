"""
Medicine Recommendation API
FastAPI service for predicting recommended medicine and dosage
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import pandas as pd
import joblib
import os

app = FastAPI(title="Medicine Recommendation API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the medicine recommendation model
try:
    model_path = os.path.join(os.path.dirname(__file__), "medicine_model.pkl")
    model_data = joblib.load(model_path)
    medicine_pipeline = model_data["medicine_pipeline"]
    dosage_pipeline = model_data["dosage_pipeline"]
    medicine_encoder = model_data["medicine_encoder"]
    dosage_encoder = model_data["dosage_encoder"]
    feature_columns = model_data["feature_columns"]
    dropdown_values = model_data["dropdown_values"]
    medicine_classes = model_data["medicine_classes"]
    dosage_classes = model_data["dosage_classes"]
    print("Medicine recommendation model loaded successfully")
except Exception as e:
    print(f"Could not load medicine model: {e}")
    medicine_pipeline = None
    dosage_pipeline = None


class MedicineRecommendationRequest(BaseModel):
    Target: str
    Genetic_Markers: str
    Autoantibodies: str
    Family_History: str
    Environmental_Factors: str
    Insulin_Levels: float
    Age: int
    BMI: float
    Physical_Activity: str
    Dietary_Habits: str
    Blood_Pressure: float
    Cholesterol_Levels: float
    Waist_Circumference: float
    Blood_Glucose_Levels: float
    Ethnicity: str
    Socioeconomic_Factors: str
    Smoking_Status: str
    Alcohol_Consumption: str
    Glucose_Tolerance_Test: str
    History_of_PCOS: str
    Previous_Gestational_Diabetes: str
    Pregnancy_History: str
    Weight_Gain_During_Pregnancy: float
    Pancreatic_Health: float
    Pulmonary_Function: float
    Cystic_Fibrosis_Diagnosis: str
    Steroid_Use_History: str
    Genetic_Testing: str
    Neurological_Assessments: float
    Liver_Function_Tests: str
    Digestive_Enzyme_Levels: float
    Urine_Test: str
    Birth_Weight: float
    Early_Onset_Symptoms: str
    diabetes: int
    HbA1c_level: float


@app.get("/")
def health():
    return {
        "status": "Medicine Recommendation API running",
        "model_loaded": medicine_pipeline is not None
    }


@app.get("/health")
def health_detailed():
    return {
        "status": "healthy",
        "medicine_model": "loaded" if medicine_pipeline is not None else "NOT LOADED",
        "dosage_model": "loaded" if dosage_pipeline is not None else "NOT LOADED"
    }


@app.get("/dropdown-options")
def get_dropdown_options():
    """Return dropdown options for the frontend form"""
    if dropdown_values is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    return {
        "success": True,
        "data": dropdown_values
    }


@app.post("/predict-medicine")
async def predict_medicine(request: MedicineRecommendationRequest):
    """Predict recommended medicine and dosage for a patient"""
    
    if medicine_pipeline is None or dosage_pipeline is None:
        raise HTTPException(status_code=500, detail="Medicine model not loaded")
    
    # Convert request to DataFrame with correct column names (matching training data)
    input_data = {
        "Target": request.Target,
        "Genetic Markers": request.Genetic_Markers,
        "Autoantibodies": request.Autoantibodies,
        "Family History": request.Family_History,
        "Environmental Factors": request.Environmental_Factors,
        "Insulin Levels": request.Insulin_Levels,
        "Age": request.Age,
        "BMI": request.BMI,
        "Physical Activity": request.Physical_Activity,
        "Dietary Habits": request.Dietary_Habits,
        "Blood Pressure": request.Blood_Pressure,
        "Cholesterol Levels": request.Cholesterol_Levels,
        "Waist Circumference": request.Waist_Circumference,
        "Blood Glucose Levels": request.Blood_Glucose_Levels,
        "Ethnicity": request.Ethnicity,
        "Socioeconomic Factors": request.Socioeconomic_Factors,
        "Smoking Status": request.Smoking_Status,
        "Alcohol Consumption": request.Alcohol_Consumption,
        "Glucose Tolerance Test": request.Glucose_Tolerance_Test,
        "History of PCOS": request.History_of_PCOS,
        "Previous Gestational Diabetes": request.Previous_Gestational_Diabetes,
        "Pregnancy History": request.Pregnancy_History,
        "Weight Gain During Pregnancy": request.Weight_Gain_During_Pregnancy,
        "Pancreatic Health": request.Pancreatic_Health,
        "Pulmonary Function": request.Pulmonary_Function,
        "Cystic Fibrosis Diagnosis": request.Cystic_Fibrosis_Diagnosis,
        "Steroid Use History": request.Steroid_Use_History,
        "Genetic Testing": request.Genetic_Testing,
        "Neurological Assessments": request.Neurological_Assessments,
        "Liver Function Tests": request.Liver_Function_Tests,
        "Digestive Enzyme Levels": request.Digestive_Enzyme_Levels,
        "Urine Test": request.Urine_Test,
        "Birth Weight": request.Birth_Weight,
        "Early Onset Symptoms": request.Early_Onset_Symptoms,
        "diabetes": request.diabetes,
        "HbA1c_level": request.HbA1c_level,
    }
    
    input_df = pd.DataFrame([input_data])
    
    try:
        # Predict medicine
        medicine_pred_encoded = medicine_pipeline.predict(input_df)[0]
        medicine_proba = medicine_pipeline.predict_proba(input_df)[0]
        recommended_medicine = medicine_encoder.inverse_transform([medicine_pred_encoded])[0]
        medicine_confidence = float(max(medicine_proba))
        
        # Predict dosage
        dosage_pred_encoded = dosage_pipeline.predict(input_df)[0]
        dosage_proba = dosage_pipeline.predict_proba(input_df)[0]
        dosage_mg = int(dosage_encoder.inverse_transform([dosage_pred_encoded])[0])
        dosage_confidence = float(max(dosage_proba))
        
        return {
            "success": True,
            "recommended_medicine": recommended_medicine,
            "dosage_mg": dosage_mg,
            "medicine_confidence": round(medicine_confidence, 4),
            "dosage_confidence": round(dosage_confidence, 4),
            "all_medicine_probabilities": {
                medicine_classes[i]: round(float(medicine_proba[i]), 4) 
                for i in range(len(medicine_classes))
            },
            "patient_data": input_data
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)
