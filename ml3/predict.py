import pandas as pd
import joblib

def predict_stress(input_data, model_path='stress_level_model.pkl'):
    """
    Predicts stress level based on input data dictionary.
    """
    try:
        model = joblib.load(model_path)
    except FileNotFoundError:
        print(f"Error: Model not found at {model_path}. Please train it first.")
        return None

    # Preprocess incoming data if necessary
    df = pd.DataFrame([input_data])
    
    # Replicate Blood pressure split if passed as string
    if 'Blood Pressure' in df.columns:
        df[['Systolic', 'Diastolic']] = df['Blood Pressure'].str.split('/', expand=True).astype(float)
        df = df.drop('Blood Pressure', axis=1)
        
    prediction = model.predict(df)
    return prediction[0]

if __name__ == "__main__":
    # Example usage for testing
    sample_input = {
        'Gender': 'Male',
        'Age': 28,
        'Occupation': 'Doctor',
        'Sleep Duration': 6.2,
        'Quality of Sleep': 6,
        'Physical Activity Level': 60,
        'BMI Category': 'Normal',
        'Blood Pressure': '125/80',
        'Heart Rate': 75,
        'Daily Steps': 10000,
        'Sleep Disorder': 'None'
    }
    
    print("Testing ML prediction...")
    print(f"Input Data: {sample_input}")
    
    stress_level = predict_stress(sample_input)
    if stress_level is not None:
        print(f"Predicted Stress Level: {stress_level:.2f}")
