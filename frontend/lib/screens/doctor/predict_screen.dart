import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../services/api_service.dart';

class PredictScreen extends StatefulWidget {
  const PredictScreen({super.key});
  @override
  State<PredictScreen> createState() => _PredictScreenState();
}

class _PredictScreenState extends State<PredictScreen> {
  // Reuse logic from AddVisit but simplified
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
      if (mounted) setState(() => _result = res.data['data']);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Prediction Failed', style: GoogleFonts.poppins()),
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
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
                Color(0xFF1565C0), // Doctor Blue
                Color(0xFF2196F3),
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
                      Icons.analytics_rounded,
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
                          'Risk Prediction',
                          style: GoogleFonts.poppins(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ).animate().fadeIn().moveX(begin: -20),
                        Text(
                          'ML-based diabetes risk assessment',
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
                      color: const Color(0xFFE3F2FD),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: const Color(0xFF2196F3).withOpacity(0.2),
                      ),
                    ),
                    child: Row(
                      children: [
                        const Icon(
                          Icons.info_outline_rounded,
                          color: Color(0xFF1976D2),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            "Enter patient details to get an ML-based diabetes risk assessment.",
                            style: GoogleFonts.poppins(
                              color: const Color(0xFF1565C0),
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
                    'Patient Information',
                    style: GoogleFonts.poppins(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Colors.black87,
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Form fields
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
                          icon: Icons.favorite_border_rounded,
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
                      color: Colors.black87,
                    ),
                  ),
                  const SizedBox(height: 16),

                  _buildTextField(
                    _bmiCtrl,
                    'BMI',
                    Icons.speed_rounded,
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

                  // Submit button
                  SizedBox(
                    width: double.infinity,
                    height: 56,
                    child: ElevatedButton.icon(
                      onPressed: _loading ? null : _submit,
                      icon: _loading
                          ? const SizedBox(
                              width: 24,
                              height: 24,
                              child: CircularProgressIndicator(
                                color: Colors.white,
                                strokeWidth: 2,
                              ),
                            )
                          : const Icon(Icons.analytics_rounded),
                      label: Text(
                        _loading ? 'Analyzing...' : 'PREDICT RISK',
                        style: GoogleFonts.poppins(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF1565C0), // Doctor Blue
                        foregroundColor: Colors.white,
                        elevation: 4,
                        shadowColor: Colors.blue.withOpacity(0.4),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                      ),
                    ),
                  ).animate().fadeIn(delay: 500.ms).slideY(begin: 0.2),

                  // Result card
                  if (_result != null)
                    Padding(
                      padding: const EdgeInsets.only(top: 24),
                      child: _buildResultCard(),
                    ).animate().fadeIn().slideY(begin: 0.1),

                  const SizedBox(
                    height: 120,
                  ), // Padding to clear the navigation bar
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
        // Ensure icon size doesn't stretch input
        prefixIcon: Icon(icon, color: const Color(0xFF1565C0), size: 22),
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
          borderSide: const BorderSide(color: Color(0xFF1565C0), width: 2),
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
        prefixIcon: Icon(icon, color: const Color(0xFF1565C0), size: 22),
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
          borderSide: const BorderSide(color: Color(0xFF1565C0), width: 2),
        ),
      ),
      items: List.generate(
        items.length,
        (i) => DropdownMenuItem(
          value: items[i],
          child: Text(
            itemLabels?[i] ?? items[i].toString(),
            style: GoogleFonts.poppins(),
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
                      'Result',
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
}
