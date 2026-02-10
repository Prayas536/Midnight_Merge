import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import 'medication_prediction/data/medication_data.dart';
import 'medication_prediction/widgets/medication_widgets.dart';

class MedicationPredictionForm extends StatefulWidget {
  final Map<String, dynamic> initialData;

  const MedicationPredictionForm({super.key, this.initialData = const {}});

  @override
  State<MedicationPredictionForm> createState() =>
      _MedicationPredictionFormState();
}

class _MedicationPredictionFormState extends State<MedicationPredictionForm>
    with SingleTickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  bool _loading = false;
  Map<String, dynamic>? _predictionResult;

  AnimationController? _resultAnimController;
  Animation<double>? _resultScaleAnim;

  final Map<String, TextEditingController> _controllers = {};

  @override
  void initState() {
    super.initState();
    _resultAnimController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );
    _resultScaleAnim = CurvedAnimation(
      parent: _resultAnimController!,
      curve: Curves.elasticOut,
    );
    _initializeControllers();
  }

  @override
  void dispose() {
    _resultAnimController?.dispose();
    for (var c in _controllers.values) {
      c.dispose();
    }
    super.dispose();
  }

  void _initializeControllers() {
    List<String> features = MedicationData.features;

    for (var feature in features) {
      String initialValue = '';

      // Map initial data from patient record
      final mappings = {
        'Age': 'age',
        'BMI': 'bmi',
        'HbA1c_level': 'HbA1cLevel',
        'Blood Glucose Levels': 'bloodGlucoseLevel',
        'Smoking Status': 'smokingHistory',
      };

      // Try invalid initialData from patient record first
      for (var entry in mappings.entries) {
        if (feature == entry.key &&
            widget.initialData.containsKey(entry.value)) {
          initialValue = widget.initialData[entry.value].toString();
          break;
        }
      }

      // Use default values if no patient data available
      if (initialValue.isEmpty &&
          MedicationData.defaultValues.containsKey(feature)) {
        initialValue = MedicationData.defaultValues[feature].toString();
      }

      final meta = MedicationData.getFeatureMeta(feature);
      if (meta != null && meta['type'] == 'categorical') {
        List options = meta['options'] is List ? meta['options'] : [];
        List<String> validOptions = options.map((e) => e.toString()).toList();

        // Handle specific value mapping for Smoking Status
        if (feature == 'Smoking Status' &&
            initialValue.isNotEmpty &&
            !validOptions.contains(initialValue)) {
          if (initialValue.toLowerCase() == 'never')
            initialValue = 'Non-Smoker';
          else if (initialValue.toLowerCase() == 'current')
            initialValue = 'Smoker';
          else if (initialValue.toLowerCase() == 'former')
            initialValue = 'Smoker'; // Simplified mapping
          else if (initialValue.toLowerCase() == 'no info')
            initialValue = 'Non-Smoker';
        }

        // Validate generic value
        if (initialValue.isNotEmpty && !validOptions.contains(initialValue)) {
          // Try default value
          if (MedicationData.defaultValues.containsKey(feature)) {
            String defVal = MedicationData.defaultValues[feature].toString();
            if (validOptions.contains(defVal)) {
              initialValue = defVal;
            } else if (validOptions.isNotEmpty) {
              initialValue = validOptions.first;
            } else {
              initialValue = '';
            }
          } else if (validOptions.isNotEmpty) {
            initialValue = validOptions.first;
          } else {
            initialValue = '';
          }
        }
      }

      _controllers[feature] = TextEditingController(text: initialValue);
    }
  }

  void _onFieldChanged(String feature, String value) {
    if (value.isNotEmpty) {
      setState(() {
        _controllers[feature]?.text = value;
      });
    }
  }

  Future<void> _submitRecommendation() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _loading = true;
      _predictionResult = null;
    });

    try {
      final Map<String, dynamic> apiPayload = {};
      List<String> features = MedicationData.features;

      // List of integer fields based on ML model
      const intFields = ['Age', 'diabetes'];

      for (var feature in features) {
        String val = _controllers[feature]?.text.trim() ?? '';
        final meta = MedicationData.getFeatureMeta(feature);

        // Convert key to match API expectation (spaces to underscores)
        // e.g. "Genetic Markers" -> "Genetic_Markers"
        String apiKey = feature.replaceAll(' ', '_');

        if (meta?['type'] == 'numeric' || feature == 'diabetes') {
          num? numVal = num.tryParse(val);
          // Ensure specific fields are sent as integers
          if (intFields.contains(feature)) {
            apiPayload[apiKey] = numVal?.toInt() ?? 0;
          } else {
            apiPayload[apiKey] = numVal?.toDouble() ?? 0.0;
          }
        } else {
          apiPayload[apiKey] = val;
        }
      }

      final res = await ApiService().dio.post(
        '/medications/predict',
        data: apiPayload,
      );

      if (!mounted) return;

      if (res.statusCode == 200 && res.data['success'] == true) {
        setState(() => _predictionResult = res.data);
        _resultAnimController?.forward(from: 0);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(res.data['message'] ?? 'Prediction failed'),
            backgroundColor: Colors.red.shade400,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: $e'),
            backgroundColor: Colors.red.shade400,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Color(0xFF311B92),
              Color(0xFF6200EA),
              Color(0xFFD500F9),
            ], // Deep Purple to Vivid Violet
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              const MedicationFormHeader(),
              Expanded(child: _buildMainContent()),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMainContent() {
    List<String> features = MedicationData.features;

    // Filter valid categories
    final validCategories = MedicationData.featureCategories.entries.where((
      category,
    ) {
      final categoryFeatures = category.value
          .where((f) => features.contains(f))
          .toList();
      return categoryFeatures.isNotEmpty;
    }).toList();

    // Prepare helper for uncategorized
    final categorizedFeaturesSet = MedicationData.featureCategories.values
        .expand((list) => list)
        .toSet();
    final uncategorized = features
        .where((f) => !categorizedFeaturesSet.contains(f))
        .toList();

    // Total items count: categories + (uncategorized if any) + 3 (Spacing, Submit Button, Bottom Padding) + (2 if result: spacing + card)
    // Actually simplicity:
    // list = [...categories]
    // if (uncategorized) list.add(uncategorized)
    // list.add(SizedBox(30))
    // list.add(Button)
    // if (result) { list.add(SizedBox(30)); list.add(Result); }
    // list.add(SizedBox(50))

    // We can build the structural list just for indices logic, but item builder is cleaner if we map indices.
    // Let's use a method to build the data list for the ListView, it's cheap.

    return Container(
      margin: const EdgeInsets.only(top: 10),
      decoration: BoxDecoration(
        color: const Color(0xFFF0F4F8), // Lighter, cleaner background
        borderRadius: const BorderRadius.only(
          topLeft: Radius.circular(40),
          topRight: Radius.circular(40),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.25),
            blurRadius: 30,
            offset: const Offset(0, -10),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: const BorderRadius.only(
          topLeft: Radius.circular(40),
          topRight: Radius.circular(40),
        ),
        child: Form(
          key: _formKey,
          child: ListView.builder(
            padding: const EdgeInsets.fromLTRB(24, 32, 24, 40),
            physics: const BouncingScrollPhysics(),
            itemCount:
                validCategories.length +
                (uncategorized.isNotEmpty ? 1 : 0) +
                1 +
                1 +
                (_predictionResult != null ? 2 : 0) +
                1,
            // Categories + Uncategorized + Spacing + Button + (Spacing + Result) + FooterSpacing
            itemBuilder: (context, index) {
              int current = 0;

              // 1. Categories
              if (index < validCategories.length) {
                final category = validCategories[index];
                final categoryFeatures = category.value
                    .where((f) => features.contains(f))
                    .toList();
                return MedicationCategorySection(
                  title: category.key,
                  categoryFeatures: categoryFeatures,
                  icon:
                      MedicationData.categoryIcons[category.key] ??
                      Icons.category,
                  controllers: _controllers,
                  onFieldChanged: _onFieldChanged,
                );
              }
              current += validCategories.length;

              // 2. Uncategorized
              if (uncategorized.isNotEmpty) {
                if (index == current) {
                  return MedicationCategorySection(
                    title: 'Other Parameters',
                    categoryFeatures: uncategorized,
                    icon: Icons.tune,
                    controllers: _controllers,
                    onFieldChanged: _onFieldChanged,
                  );
                }
                current++;
              }

              // 3. Spacing
              if (index == current) return const SizedBox(height: 30);
              current++;

              // 4. Submit Button
              if (index == current) return _buildSubmitButton();
              current++;

              // 5. Result
              if (_predictionResult != null) {
                if (index == current) return const SizedBox(height: 30);
                current++;
                if (index == current) {
                  return PredictionResultCard(
                    result: _predictionResult!,
                    scaleAnimation:
                        _resultScaleAnim ?? const AlwaysStoppedAnimation(1.0),
                  );
                }
                current++;
              }

              // 6. Footer Spacing
              return const SizedBox(height: 50);
            },
          ),
        ),
      ),
    );
  }

  Widget _buildSubmitButton() {
    return Container(
      height: 64,
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [
            Color(0xFF651FFF),
            Color(0xFFC51162),
          ], // Vivid deep purple to pink
          begin: Alignment.centerLeft,
          end: Alignment.centerRight,
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF651FFF).withOpacity(0.5),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: ElevatedButton(
        onPressed: _loading ? null : _submitRecommendation,
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.transparent,
          shadowColor: Colors.transparent,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
          ),
          elevation: 0,
        ),
        child: _loading
            ? const SizedBox(
                width: 28,
                height: 28,
                child: CircularProgressIndicator(
                  color: Colors.white,
                  strokeWidth: 3,
                ),
              )
            : Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(
                    Icons.auto_awesome_rounded,
                    color: Colors.white,
                    size: 26,
                  ),
                  const SizedBox(width: 14),
                  Flexible(
                    child: const Text(
                      'Get ML Recommendation',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                        letterSpacing: 1.0,
                      ),
                      overflow: TextOverflow.ellipsis,
                      textAlign: TextAlign.center,
                    ),
                  ),
                ],
              ),
      ),
    );
  }
}
