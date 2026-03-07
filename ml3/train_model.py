import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import joblib
import os

def main():
    print("Starting Stress Level Prediction Model Training...")
    
    # Check if dataset exists
    data_path = 'Sleep.csv'
    if not os.path.exists(data_path):
        print(f"Error: Dataset not found at {data_path}")
        return

    # Load dataset
    df = pd.read_csv(data_path)
    print(f"Dataset loaded. Shape: {df.shape}")

    # Preprocessing
    if 'Person ID' in df.columns:
        df = df.drop('Person ID', axis=1)

    # Handle Blood Pressure (split into Systolic and Diastolic)
    if 'Blood Pressure' in df.columns:
        df[['Systolic', 'Diastolic']] = df['Blood Pressure'].str.split('/', expand=True).astype(float)
        df = df.drop('Blood Pressure', axis=1)

    # Handle Sleep Disorder
    if 'Sleep Disorder' in df.columns:
        df['Sleep Disorder'] = df['Sleep Disorder'].fillna('None')

    # Define features and target
    target_col = 'Stress Level'
    if target_col not in df.columns:
        print(f"Error: Target column '{target_col}' not found.")
        return

    X = df.drop(target_col, axis=1)
    y = df[target_col]

    # Identify numeric and categorical columns
    numeric_features = X.select_dtypes(include=['int64', 'float64']).columns.tolist()
    categorical_features = X.select_dtypes(include=['object', 'category']).columns.tolist()

    print(f"Numeric features: {numeric_features}")
    print(f"Categorical features: {categorical_features}")

    # Create preprocessing pipeline
    numeric_transformer = StandardScaler()
    categorical_transformer = OneHotEncoder(handle_unknown='ignore')

    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, numeric_features),
            ('cat', categorical_transformer, categorical_features)
        ])

    # Create model pipeline - RandomForestRegressor
    model = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('regressor', RandomForestRegressor(n_estimators=100, random_state=42))
    ])

    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Train model
    print("Training model...")
    model.fit(X_train, y_train)

    # Evaluate model
    y_pred = model.predict(X_test)
    mse = mean_squared_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)

    print("\n--- Model Evaluation ---")
    print(f"Mean Squared Error: {mse:.4f}")
    print(f"R2 Score: {r2:.4f}")

    # Save the model
    model_path = 'stress_level_model.pkl'
    joblib.dump(model, model_path)
    print(f"\nModel saved successfully to {model_path}")

if __name__ == '__main__':
    main()
