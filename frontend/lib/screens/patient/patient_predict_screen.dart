import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../services/api_service.dart';
import 'prediction_chat_screen.dart';

class PatientPredictScreen extends StatefulWidget {
  const PatientPredictScreen({super.key});

  @override
  State<PatientPredictScreen> createState() => _PatientPredictScreenState();
}

class _PatientPredictScreenState extends State<PatientPredictScreen> {
  final _ageCtrl = TextEditingController();
  final _bmiCtrl = TextEditingController();
  final _hba1cCtrl = TextEditingController();
  final _glucoseCtrl = TextEditingController();

  String gender = 'Male';
  int hypertension = 0;
  int heartDisease = 0;
  String smoking = 'never';
  bool _loading = false;
  Map<String, dynamic>? _result;
  final _formKey = GlobalKey<FormState>();

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _loading = true);
    _result = null;
    try {
      final res = await ApiService().dio.post(
        '/predictions',
        data: {
          'gender': gender,
          'age': int.tryParse(_ageCtrl.text),
          'hypertension': hypertension,
          'heart_disease': heartDisease,
          'smoking_history': smoking,
          'bmi': double.tryParse(_bmiCtrl.text),
          'HbA1c_level': double.tryParse(_hba1cCtrl.text),
          'blood_glucose_level': int.tryParse(_glucoseCtrl.text),
        },
      );
      if (mounted) {
        setState(() => _result = res.data['data']);
        // Show dialog to discuss with AI
        _showChatDialog();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Prediction Failed. Please check inputs.',
              style: GoogleFonts.poppins(),
            ),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _showChatDialog() {
    if (_result == null) return;

    final riskLabel = _result!['riskLabel'];
    final isHighRisk = riskLabel == 'High Risk';

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        backgroundColor: Colors.white,
        contentPadding: const EdgeInsets.all(24),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: isHighRisk
                    ? Colors.red.withOpacity(0.1)
                    : Colors.green.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(
                isHighRisk ? Icons.warning_rounded : Icons.check_circle_rounded,
                color: isHighRisk ? Colors.red : Colors.green,
                size: 48,
              ),
            ),
            const SizedBox(height: 16),
            Text(
              'Prediction Complete!',
              style: GoogleFonts.poppins(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Colors.black87,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Your result: $riskLabel',
              style: GoogleFonts.poppins(
                fontSize: 14,
                color: isHighRisk ? Colors.red : Colors.green,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 16),
            Text(
              'Would you like to discuss your results with our AI Health Assistant?',
              textAlign: TextAlign.center,
              style: GoogleFonts.poppins(
                fontSize: 14,
                color: Colors.grey[600],
                height: 1.5,
              ),
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => Navigator.pop(ctx),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      side: BorderSide(color: Colors.grey[300]!),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: Text(
                      'Later',
                      style: GoogleFonts.poppins(
                        color: Colors.grey[600],
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () {
                      Navigator.pop(ctx);
                      _navigateToChat();
                    },
                    icon: const Icon(Icons.smart_toy_rounded, size: 20),
                    label: Text(
                      'Chat Now',
                      style: GoogleFonts.poppins(fontWeight: FontWeight.w600),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF43A047),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _navigateToChat() {
    // Build prediction context from current form data
    final predictionContext = {
      'prediction': _result!['riskLabel'] == 'High Risk' ? 1 : 0,
      'risk_percent': (_result!['riskScore'] * 100),
      'patient_data': {
        'age': int.tryParse(_ageCtrl.text),
        'gender': gender,
        'bmi': double.tryParse(_bmiCtrl.text),
        'HbA1c_level': double.tryParse(_hba1cCtrl.text),
        'blood_glucose_level': int.tryParse(_glucoseCtrl.text),
        'hypertension': hypertension,
        'heart_disease': heartDisease,
        'smoking_history': smoking,
      },
      'riskLabel': _result!['riskLabel'],
      'confidence': _result!['confidence'],
    };

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) =>
            PredictionChatScreen(predictionContext: predictionContext),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Header with gradient
        Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              colors: [
                Color(0xFF43A047), // Green 600
                Color(0xFF2E7D32), // Green 800
              ],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.only(
              bottomLeft: Radius.circular(30),
              bottomRight: Radius.circular(30),
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black12,
                blurRadius: 10,
                offset: Offset(0, 5),
              ),
            ],
          ),
          padding: const EdgeInsets.fromLTRB(20, 20, 20, 40),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 10),
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: const Icon(
                      Icons.health_and_safety_outlined,
                      color: Colors.white,
                      size: 32,
                    ),
                  ).animate().scale(
                    duration: 500.ms,
                    curve: Curves.easeOutBack,
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Diabetes Risk Check',
                          style: GoogleFonts.poppins(
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ).animate().fadeIn().moveX(begin: -20),
                        Text(
                          'Get your based assessment',
                          style: GoogleFonts.poppins(
                            fontSize: 14,
                            color: Colors.white70,
                          ),
                        ).animate().fadeIn(delay: 200.ms).moveX(begin: -20),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),

        // Content
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Info card
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFFE8F5E9),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.green.withOpacity(0.3)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.info_outline, color: Colors.green),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            "Check your diabetes risk by entering your health details. Get an ML-based assessment.",
                            style: GoogleFonts.poppins(
                              color: Colors.green[900],
                              fontSize: 13,
                              height: 1.5,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ).animate().fadeIn(delay: 300.ms).slideY(begin: 0.1),

                  const SizedBox(height: 24),

                  Text(
                    'Personal Information',
                    style: GoogleFonts.poppins(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Colors.green[900],
                    ),
                  ),
                  const SizedBox(height: 16),

                  Row(
                    children: [
                      Expanded(
                        child: _buildTextField(
                          _ageCtrl,
                          'Age',
                          Icons.cake_outlined,
                          'yrs',
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: _buildDropdown(
                          value: gender,
                          label: 'Gender',
                          items: ['Male', 'Female', 'Other'],
                          onChanged: (v) =>
                              setState(() => gender = v.toString()),
                          icon: Icons.wc_outlined,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: _buildDropdown(
                          value: hypertension,
                          label: 'Hypertension',
                          items: const [0, 1],
                          itemLabels: const ['No', 'Yes'],
                          onChanged: (v) =>
                              setState(() => hypertension = v as int),
                          icon: Icons.favorite_border,
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: _buildDropdown(
                          value: heartDisease,
                          label: 'Heart Disease',
                          items: const [0, 1],
                          itemLabels: const ['No', 'Yes'],
                          onChanged: (v) =>
                              setState(() => heartDisease = v as int),
                          icon: Icons.monitor_heart_outlined,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  _buildDropdown(
                    value: smoking,
                    label: 'Smoking History',
                    items: [
                      'never',
                      'former',
                      'current',
                      'not current',
                      'No Info',
                      'ever',
                    ],
                    onChanged: (v) => setState(() => smoking = v.toString()),
                    icon: Icons.smoke_free_outlined,
                  ),

                  const SizedBox(height: 30),

                  Text(
                    'Health Metrics',
                    style: GoogleFonts.poppins(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Colors.green[900],
                    ),
                  ),
                  const SizedBox(height: 16),

                  _buildTextField(
                    _bmiCtrl,
                    'BMI',
                    Icons.speed_outlined,
                    'kg/m²',
                  ),
                  const SizedBox(height: 16),
                  _buildTextField(
                    _hba1cCtrl,
                    'HbA1c Level',
                    Icons.bloodtype_outlined,
                    '%',
                  ),
                  const SizedBox(height: 16),
                  _buildTextField(
                    _glucoseCtrl,
                    'Blood Glucose',
                    Icons.water_drop_outlined,
                    'mg/dL',
                  ),

                  const SizedBox(height: 32),

                  // Submit Button
                  SizedBox(
                    width: double.infinity,
                    height: 56,
                    child: ElevatedButton.icon(
                      onPressed: _loading ? null : _submit,
                      icon: _loading
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                color: Colors.white,
                                strokeWidth: 2,
                              ),
                            )
                          : const Icon(Icons.check_circle_outline),
                      label: Text(
                        _loading ? 'Analyzing...' : 'CHECK RISK',
                        style: GoogleFonts.poppins(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF43A047),
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                        elevation: 4,
                        shadowColor: Colors.green.withOpacity(0.4),
                      ),
                    ),
                  ).animate().scale(
                    delay: 400.ms,
                    begin: const Offset(0.95, 0.95),
                  ),

                  // Result card
                  if (_result != null)
                    Padding(
                      padding: const EdgeInsets.only(top: 24),
                      child: _buildResultCard(),
                    ).animate().fadeIn().slideY(begin: 0.1),

                  const SizedBox(height: 40),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildTextField(
    TextEditingController controller,
    String label,
    IconData icon,
    String suffix,
  ) {
    return TextFormField(
      controller: controller,
      keyboardType: TextInputType.number,
      style: GoogleFonts.poppins(),
      validator: (val) => val == null || val.isEmpty ? 'Required' : null,
      decoration: InputDecoration(
        labelText: label,
        suffixText: suffix,
        // Using prefixIconConstraints to ensure icon size doesn't stretch input
        prefixIcon: Icon(icon, color: Colors.green[700], size: 22),
        filled: true,
        fillColor: Colors.white,
        contentPadding: const EdgeInsets.symmetric(
          vertical: 16,
          horizontal: 20,
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: Colors.grey[200]!),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: Colors.grey[200]!),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: Color(0xFF43A047), width: 2),
        ),
      ),
    );
  }

  Widget _buildDropdown({
    required dynamic value,
    required String label,
    required List items,
    List<String>? itemLabels,
    required Function(dynamic) onChanged,
    required IconData icon,
  }) {
    return DropdownButtonFormField(
      isExpanded: true,
      value: value,
      dropdownColor: Colors.white,
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon, color: Colors.green[700], size: 22),
        filled: true,
        fillColor: Colors.white,
        contentPadding: const EdgeInsets.symmetric(
          vertical: 16,
          horizontal: 20,
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: Colors.grey[200]!),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: Colors.grey[200]!),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: Color(0xFF43A047), width: 2),
        ),
      ),
      items: List.generate(
        items.length,
        (i) => DropdownMenuItem(
          value: items[i],
          child: Text(
            itemLabels?[i] ?? items[i].toString(),
            style: GoogleFonts.poppins(),
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ),
      onChanged: (v) => onChanged(v),
    );
  }

  Widget _buildResultCard() {
    final riskLabel = _result!['riskLabel'];
    final riskScore = _result!['riskScore'];
    final confidence = _result!['confidence'];

    Color statusColor = Colors.green;
    IconData statusIcon = Icons.check_circle_rounded;

    if (riskLabel == 'High Risk') {
      statusColor = Colors.red;
      statusIcon = Icons.warning_rounded;
    } else if (riskLabel == 'Medium Risk') {
      statusColor = Colors.orange;
      statusIcon = Icons.info_rounded;
    }

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: statusColor.withOpacity(0.1)),
        boxShadow: [
          BoxShadow(
            color: statusColor.withOpacity(0.1),
            blurRadius: 15,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(statusIcon, color: statusColor, size: 32),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Assessment Result',
                      style: GoogleFonts.poppins(
                        fontSize: 13,
                        color: Colors.grey[600],
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    Text(
                      riskLabel,
                      style: GoogleFonts.poppins(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: statusColor,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          Row(
            children: [
              Expanded(
                child: _buildScoreMetric(
                  'Risk Score',
                  '${(riskScore * 100).toStringAsFixed(1)}%',
                  statusColor,
                ),
              ),
              Container(width: 1, height: 40, color: Colors.grey[200]),
              Expanded(
                child: _buildScoreMetric(
                  'Confidence',
                  '${(confidence * 100).toStringAsFixed(1)}%',
                  statusColor,
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF2196F3).withOpacity(0.08),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: const Color(0xFF2196F3).withOpacity(0.2),
              ),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(
                  Icons.medical_services_outlined,
                  color: Color(0xFF1976D2),
                  size: 20,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    'Please consult with your doctor to discuss these results and take appropriate preventive measures.',
                    style: GoogleFonts.poppins(
                      fontSize: 13,
                      color: const Color(0xFF1976D2),
                      height: 1.5,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildScoreMetric(String label, String value, Color color) {
    return Column(
      children: [
        Text(
          label,
          style: GoogleFonts.poppins(fontSize: 12, color: Colors.grey[600]),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: GoogleFonts.poppins(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
      ],
    );
  }

  @override
  void dispose() {
    _ageCtrl.dispose();
    _bmiCtrl.dispose();
    _hba1cCtrl.dispose();
    _glucoseCtrl.dispose();
    super.dispose();
  }
}
