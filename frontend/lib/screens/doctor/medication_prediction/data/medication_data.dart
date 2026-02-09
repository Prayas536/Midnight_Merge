import 'package:flutter/material.dart';

class MedicationData {
  // Feature categories for organized display
  static const Map<String, List<String>> featureCategories = {
    'Patient Demographics': [
      'Age',
      'BMI',
      'Ethnicity',
      'Waist Circumference',
      'Birth Weight',
    ],
    'Medical History': [
      'Target',
      'Genetic Markers',
      'Autoantibodies',
      'Family History',
      'History of PCOS',
      'Previous Gestational Diabetes',
      'Pregnancy History',
      'Cystic Fibrosis Diagnosis',
      'Steroid Use History',
      'Early Onset Symptoms',
      'diabetes',
    ],
    'Test Results': [
      'Insulin Levels',
      'Blood Pressure',
      'Cholesterol Levels',
      'Blood Glucose Levels',
      'HbA1c_level',
      'Glucose Tolerance Test',
      'Pancreatic Health',
      'Pulmonary Function',
      'Liver Function Tests',
      'Digestive Enzyme Levels',
      'Urine Test',
      'Genetic Testing',
      'Neurological Assessments',
    ],
    'Lifestyle Factors': [
      'Environmental Factors',
      'Physical Activity',
      'Dietary Habits',
      'Smoking Status',
      'Alcohol Consumption',
      'Weight Gain During Pregnancy',
      'Socioeconomic Factors',
    ],
  };

  // Features List
  static const List<String> features = [
    'Target',
    'Genetic Markers',
    'Autoantibodies',
    'Family History',
    'Environmental Factors',
    'Insulin Levels',
    'Age',
    'BMI',
    'Physical Activity',
    'Dietary Habits',
    'Blood Pressure',
    'Cholesterol Levels',
    'Waist Circumference',
    'Blood Glucose Levels',
    'Ethnicity',
    'Socioeconomic Factors',
    'Smoking Status',
    'Alcohol Consumption',
    'Glucose Tolerance Test',
    'History of PCOS',
    'Previous Gestational Diabetes',
    'Pregnancy History',
    'Weight Gain During Pregnancy',
    'Pancreatic Health',
    'Pulmonary Function',
    'Cystic Fibrosis Diagnosis',
    'Steroid Use History',
    'Genetic Testing',
    'Neurological Assessments',
    'Liver Function Tests',
    'Digestive Enzyme Levels',
    'Urine Test',
    'Birth Weight',
    'Early Onset Symptoms',
    'diabetes',
    'HbA1c_level',
  ];

  // Dropdown options matching React code
  static const Map<String, List<String>> dropdownOptions = {
    'Target': [
      'Type 2 Diabetes',
      'Type 1 Diabetes',
      'Prediabetic',
      'Gestational Diabetes',
      'LADA',
      'MODY',
      'Steroid-Induced Diabetes',
      'Neonatal Diabetes Mellitus (NDM)',
      'Wolfram Syndrome',
      'Wolcott-Rallison Syndrome',
      'Secondary Diabetes',
      'Type 3c Diabetes (Pancreatogenic Diabetes)',
      'Cystic Fibrosis-Related Diabetes (CFRD)',
    ],
    'Genetic Markers': ['Positive', 'Negative'],
    'Autoantibodies': ['Positive', 'Negative'],
    'Family History': ['Yes', 'No'],
    'Environmental Factors': ['Present', 'Absent'],
    'Physical Activity': ['High', 'Moderate', 'Low'],
    'Dietary Habits': ['Healthy', 'Unhealthy'],
    'Ethnicity': ['Low Risk', 'High Risk'],
    'Socioeconomic Factors': ['High', 'Medium', 'Low'],
    'Smoking Status': ['Smoker', 'Non-Smoker'],
    'Alcohol Consumption': ['High', 'Moderate', 'Low'],
    'Glucose Tolerance Test': ['Normal', 'Abnormal'],
    'History of PCOS': ['Yes', 'No'],
    'Previous Gestational Diabetes': ['Yes', 'No'],
    'Pregnancy History': ['Normal', 'Complications'],
    'Cystic Fibrosis Diagnosis': ['Yes', 'No'],
    'Steroid Use History': ['Yes', 'No'],
    'Genetic Testing': ['Positive', 'Negative'],
    'Liver Function Tests': ['Normal', 'Abnormal'],
    'Urine Test': [
      'Normal',
      'Ketones Present',
      'Glucose Present',
      'Protein Present',
    ],
    'Early Onset Symptoms': ['Yes', 'No'],
    'diabetes': ['0', '1'],
  };

  // Icons for each category
  static const Map<String, IconData> categoryIcons = {
    'Patient Demographics': Icons.person_outline_rounded,
    'Medical History': Icons.history_edu_rounded,
    'Test Results': Icons.science_rounded,
    'Lifestyle Factors': Icons.favorite_border_rounded,
    'Dosage': Icons.medication_rounded,
  };

  // Distinct colors for each category - IMPROVED PALETTE
  static const Map<String, Color> categoryColors = {
    'Patient Demographics': Color(0xFF448AFF), // Bright Blue
    'Medical History': Color(0xFFFF5252), // Bright Red
    'Test Results': Color(0xFF69F0AE), // Bright Teal
    'Lifestyle Factors': Color(0xFFFFAB40), // Bright Orange
  };

  // Specific icons for every feature
  static const Map<String, IconData> featureIcons = {
    // Demographics
    'Age': Icons.calendar_today_rounded,
    'Gender': Icons.people_alt_rounded,
    'Ethnicity': Icons.public_rounded,
    'Socioeconomic Factors': Icons.attach_money_rounded,
    'Birth Weight': Icons.monitor_weight_rounded,

    // Medical History
    'Family History': Icons.family_restroom_rounded,
    'Pregnancy History': Icons.pregnant_woman_rounded,
    'History of PCOS': Icons.female_rounded,
    'Pancreatic Health': Icons.health_and_safety_rounded,
    'Cystic Fibrosis Diagnosis': Icons.medical_services_rounded,
    'Genetic Markers': Icons.fingerprint_rounded,
    'Autoantibodies': Icons.shield_rounded,

    // Test Results
    'Blood Glucose Levels': Icons.water_drop_rounded,
    'HbA1c_level': Icons.bloodtype_rounded,
    'Insulin Levels': Icons.opacity_rounded,
    'BMI': Icons.monitor_weight_rounded,
    'Blood Pressure': Icons.speed_rounded,
    'Cholesterol Levels': Icons.fastfood_rounded,
    'Waist Circumference': Icons.accessibility_new_rounded,
    'Liver Function Tests': Icons.science_rounded,
    'Urine Test': Icons.science_rounded,

    // Lifestyle
    'Smoking Status': Icons.smoking_rooms_rounded,
    'Alcohol Consumption': Icons.wine_bar_rounded,
    'Physical Activity': Icons.directions_run_rounded,
    'Dietary Habits': Icons.restaurant_rounded,
    'Environmental Factors': Icons.nature_people_rounded,

    // Dosage
    'diabetes': Icons.coronavirus_rounded,
    'Target': Icons.track_changes_rounded,
  };

  // Colors for gradient
  static const Color primaryColor = Color(0xFF1565C0);

  // Default values matching React code
  static const Map<String, dynamic> defaultValues = {
    'Target': 'Type 2 Diabetes',
    'Genetic Markers': 'Negative',
    'Autoantibodies': 'Negative',
    'Family History': 'No',
    'Environmental Factors': 'Absent',
    'Physical Activity': 'Moderate',
    'Dietary Habits': 'Healthy',
    'Ethnicity': 'Low Risk',
    'Socioeconomic Factors': 'Medium',
    'Smoking Status': 'Non-Smoker',
    'Alcohol Consumption': 'Low',
    'Glucose Tolerance Test': 'Normal',
    'History of PCOS': 'No',
    'Previous Gestational Diabetes': 'No',
    'Pregnancy History': 'Normal',
    'Cystic Fibrosis Diagnosis': 'No',
    'Steroid Use History': 'No',
    'Genetic Testing': 'Negative',
    'Liver Function Tests': 'Normal',
    'Urine Test': 'Normal',
    'Early Onset Symptoms': 'No',
    'diabetes': '0',
    'Insulin Levels': '',
    'Age': '',
    'BMI': '',
    'Blood Pressure': '',
    'Cholesterol Levels': '',
    'Waist Circumference': '',
    'Blood Glucose Levels': '',
    'Weight Gain During Pregnancy': '',
    'Pancreatic Health': '',
    'Pulmonary Function': '',
    'Neurological Assessments': '',
    'Digestive Enzyme Levels': '',
    'Birth Weight': '',
    'HbA1c_level': '',
  };

  static Map<String, dynamic>? getFeatureMeta(String feature) {
    // Check if this feature has predefined dropdown options
    if (dropdownOptions.containsKey(feature)) {
      return {'type': 'categorical', 'options': dropdownOptions[feature]};
    }

    // Return numeric type for known numeric fields
    const numericFields = [
      'Insulin Levels',
      'Age',
      'BMI',
      'Blood Pressure',
      'Cholesterol Levels',
      'Waist Circumference',
      'Blood Glucose Levels',
      'Weight Gain During Pregnancy',
      'Pancreatic Health',
      'Pulmonary Function',
      'Neurological Assessments',
      'Digestive Enzyme Levels',
      'Birth Weight',
      'HbA1c_level',
    ];
    if (numericFields.contains(feature)) {
      return {'type': 'numeric'};
    }

    return null;
  }
}
