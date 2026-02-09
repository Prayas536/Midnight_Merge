"""
Training script for Medicine Recommendation Model
Predicts: recommended_medicine, dosage_mg
Based on patient health data from Final_dataset_for_ML2.csv
"""
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, LabelEncoder
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.ensemble import RandomForestClassifier
import numpy as np

# Load dataset
print("Loading dataset...")
df = pd.read_csv("medications.csv")

# Handle duplicate column names by using column indices
# The last 3 columns are duplicate names, we'll drop them
df = df.iloc[:, :38]  # Keep only first 38 columns

print(f"Dataset shape: {df.shape}")
print(f"Columns: {df.columns.tolist()}")

# Define target columns
target_medicine = "recommended_medicine"
target_dosage = "dosage_mg"

# Define feature columns (all except targets)
feature_cols = [col for col in df.columns if col not in [target_medicine, target_dosage]]

print(f"\nFeature columns ({len(feature_cols)}): {feature_cols}")
print(f"Target columns: {target_medicine}, {target_dosage}")

# Prepare features and targets
X = df[feature_cols].copy()
y_medicine = df[target_medicine].copy()
y_dosage = df[target_dosage].copy()

# Identify numeric and categorical columns
num_cols = X.select_dtypes(include=["int64", "float64"]).columns.tolist()
cat_cols = X.select_dtypes(include=["object", "bool"]).columns.tolist()

print(f"\nNumeric columns ({len(num_cols)}): {num_cols}")
print(f"Categorical columns ({len(cat_cols)}): {cat_cols}")

# Create preprocessing pipelines
numeric_transformer = Pipeline(steps=[
    ("imputer", SimpleImputer(strategy="median"))
])

categorical_transformer = Pipeline(steps=[
    ("imputer", SimpleImputer(strategy="most_frequent")),
    ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False))
])

preprocessor = ColumnTransformer(
    transformers=[
        ("num", numeric_transformer, num_cols),
        ("cat", categorical_transformer, cat_cols),
    ]
)

# Encode target labels
medicine_encoder = LabelEncoder()
y_medicine_encoded = medicine_encoder.fit_transform(y_medicine)

dosage_encoder = LabelEncoder()
y_dosage_encoded = dosage_encoder.fit_transform(y_dosage)

# Create the medicine recommendation classifier
print("\nTraining medicine recommendation model...")
medicine_pipeline = Pipeline(steps=[
    ("preprocessor", preprocessor),
    ("classifier", RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1, class_weight="balanced"))
])

# Train-test split
X_train, X_test, y_med_train, y_med_test, y_dos_train, y_dos_test = train_test_split(
    X, y_medicine_encoded, y_dosage_encoded, test_size=0.2, random_state=42
)

# Train medicine classifier
medicine_pipeline.fit(X_train, y_med_train)
med_accuracy = medicine_pipeline.score(X_test, y_med_test)
print(f"Medicine model accuracy: {med_accuracy:.4f}")

# Create the dosage classifier
print("\nTraining dosage model...")
dosage_pipeline = Pipeline(steps=[
    ("preprocessor", preprocessor),
    ("classifier", RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1, class_weight="balanced"))
])

dosage_pipeline.fit(X_train, y_dos_train)
dos_accuracy = dosage_pipeline.score(X_test, y_dos_test)
print(f"Dosage model accuracy: {dos_accuracy:.4f}")

# Extract unique values for dropdowns (for frontend use)
dropdown_values = {}
for col in cat_cols:
    dropdown_values[col] = df[col].unique().tolist()

# Also add Target column unique values
dropdown_values["Target"] = df["Target"].unique().tolist()

# Save models and metadata
model_data = {
    "medicine_pipeline": medicine_pipeline,
    "dosage_pipeline": dosage_pipeline,
    "medicine_encoder": medicine_encoder,
    "dosage_encoder": dosage_encoder,
    "feature_columns": feature_cols,
    "numeric_columns": num_cols,
    "categorical_columns": cat_cols,
    "dropdown_values": dropdown_values,
    "medicine_classes": medicine_encoder.classes_.tolist(),
    "dosage_classes": dosage_encoder.classes_.tolist(),
}

joblib.dump(model_data, "medicine_model.pkl")

print("\n✅ Model saved as medicine_model.pkl")
print(f"Medicine classes: {medicine_encoder.classes_.tolist()}")
print(f"Dosage classes: {dosage_encoder.classes_.tolist()}")
print(f"\nDropdown values saved for frontend integration")
print(f"Features needed ({len(feature_cols)}): {feature_cols}")
