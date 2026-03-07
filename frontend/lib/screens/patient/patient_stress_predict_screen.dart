import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../services/api_service.dart';

class PatientStressPredictScreen extends StatefulWidget {
  const PatientStressPredictScreen({super.key});

  @override
  State<PatientStressPredictScreen> createState() =>
      _PatientStressPredictScreenState();
}

class _PatientStressPredictScreenState
    extends State<PatientStressPredictScreen> {
  final _ageCtrl = TextEditingController();
  final _sleepDurationCtrl = TextEditingController();
  final _sleepQualityCtrl = TextEditingController();
  final _physicalActivityCtrl = TextEditingController();
  final _bloodPressureCtrl = TextEditingController();
  final _heartRateCtrl = TextEditingController();
  final _dailyStepsCtrl = TextEditingController();
  final _reflectionCtrl = TextEditingController();

  String gender = 'Male';
  String occupation = 'Software Engineer';
  String bmiCategory = 'Normal';
  String sleepDisorder = 'None';

  bool _loading = false;
  Map<String, dynamic>? _result;
  final _formKey = GlobalKey<FormState>();

  final List<String> _occupations = [
    'Software Engineer',
    'Doctor',
    'Sales Representative',
    'Teacher',
    'Nurse',
    'Engineer',
    'Accountant',
    'Scientist',
    'Lawyer',
    'Salesperson',
    'Manager',
  ];

  // 1) Submits the health inputs to the ML backend for numerical prediction
  Future<void> _predictML() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _loading = true);
    _result = null;
    try {
      final res = await ApiService().dio.post(
        '/stress/predict', // Hits the purely numerical endpoint
        data: {
          'gender': gender,
          'age': int.tryParse(_ageCtrl.text),
          'occupation': occupation,
          'sleep_duration': double.tryParse(_sleepDurationCtrl.text),
          'quality_of_sleep': int.tryParse(_sleepQualityCtrl.text),
          'physical_activity_level': int.tryParse(_physicalActivityCtrl.text),
          'bmi_category': bmiCategory,
          'blood_pressure': _bloodPressureCtrl.text,
          'heart_rate': int.tryParse(_heartRateCtrl.text),
          'daily_steps': int.tryParse(_dailyStepsCtrl.text),
          'sleep_disorder': sleepDisorder,
        },
      );
      if (mounted) {
        setState(() => _result = res.data['data']);
        // Do not show dialog yet, just update the state
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Prediction Failed. Please check inputs or backend connection.',
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

  // 2) Submits the ML score and text reflection to Groq AI
  Future<void> _getAIAdvice() async {
    if (_result == null || _result!['stress_level'] == null) return;

    setState(() => _loading = true);
    final numericalScore = _result!['stress_level'];

    try {
      final res = await ApiService().dio.post(
        '/stress/ai_stress_advice',
        data: {
          // Sending the raw inputs + message, the Python backend will use Groq
          'gender': gender,
          'age': int.tryParse(_ageCtrl.text),
          'occupation': occupation,
          'sleep_duration': double.tryParse(_sleepDurationCtrl.text),
          'quality_of_sleep': int.tryParse(_sleepQualityCtrl.text),
          'physical_activity_level': int.tryParse(_physicalActivityCtrl.text),
          'bmi_category': bmiCategory,
          'blood_pressure': _bloodPressureCtrl.text,
          'heart_rate': int.tryParse(_heartRateCtrl.text),
          'daily_steps': int.tryParse(_dailyStepsCtrl.text),
          'sleep_disorder': sleepDisorder,
          'message': _reflectionCtrl.text,
        },
      );
      if (mounted) {
        setState(() {
          // Combine the ML result with the AI result
          _result = {'stress_level': numericalScore, ...res.data['data']};
        });
        _showResultDialog();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'AI Advice Failed. Please try again.',
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

  void _showResultDialog() {
    if (_result == null) return;

    final stressLevel = _result!['stress_level'];
    final mood = _result!['mood'] ?? 'Neutral';
    final recommendations = _result!['recommendations'] as List? ?? [];

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        backgroundColor: Colors.white,
        contentPadding: EdgeInsets.zero,
        content: Container(
          width: double.maxFinite,
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(vertical: 24),
                  decoration: const BoxDecoration(
                    color: Color(0xFF1976D2),
                    borderRadius: BorderRadius.only(
                      topLeft: Radius.circular(24),
                      topRight: Radius.circular(24),
                    ),
                  ),
                  child: Column(
                    children: [
                      const Icon(
                        Icons.psychology_outlined,
                        color: Colors.white,
                        size: 56,
                      ),
                      const SizedBox(height: 12),
                      Text(
                        'AI Analysis Complete',
                        style: GoogleFonts.poppins(
                          color: Colors.white,
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    children: [
                      _buildResultItem(
                        'Stress Score',
                        '${stressLevel.toStringAsFixed(1)} / 10',
                        Icons.analytics,
                      ),
                      if (mood != "Neutral" && _result!['ai_message'] != null)
                        _buildResultItem(
                          'Detected Mood',
                          mood,
                          Icons.sentiment_satisfied_alt,
                        ),
                      if (_result!['ai_message'] != null) ...[
                        const SizedBox(height: 12),
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.blue[50],
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: Colors.blue[200]!),
                          ),
                          child: Text(
                            _result!['ai_message'],
                            style: GoogleFonts.poppins(
                              fontSize: 14,
                              color: Colors.blue[900],
                              height: 1.5,
                              fontStyle: FontStyle.italic,
                            ),
                          ),
                        ),
                      ],
                      const SizedBox(height: 20),
                      Text(
                        'AI Recommendations',
                        style: GoogleFonts.poppins(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Colors.blue[900],
                        ),
                      ),
                      const SizedBox(height: 12),
                      ...recommendations.map(
                        (rec) => Padding(
                          padding: const EdgeInsets.only(bottom: 8),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Icon(
                                Icons.check_circle_outline,
                                color: Colors.green,
                                size: 18,
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Text(
                                  rec,
                                  style: GoogleFonts.poppins(
                                    fontSize: 14,
                                    color: Colors.black87,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),
                      SizedBox(
                        width: double.infinity,
                        height: 50,
                        child: ElevatedButton(
                          onPressed: () => Navigator.pop(ctx),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF1976D2),
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          child: Text(
                            'Close',
                            style: GoogleFonts.poppins(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildResultItem(String label, String value, IconData icon) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          Icon(icon, color: Colors.blue[700], size: 20),
          const SizedBox(width: 12),
          Text(
            label,
            style: GoogleFonts.poppins(color: Colors.grey[600], fontSize: 14),
          ),
          const Spacer(),
          Text(
            value,
            style: GoogleFonts.poppins(
              fontWeight: FontWeight.bold,
              color: Colors.black87,
              fontSize: 16,
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text(''), // Empty title, or anything
        backgroundColor: const Color(0xFF1976D2),
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: Column(
        children: [
          // Header with gradient
          Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  Color(0xFF1976D2), // Blue 700
                  Color(0xFF0D47A1), // Blue 900
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
                        Icons.spa_outlined,
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
                            'Stress Level Predictor',
                            style: GoogleFonts.poppins(
                              fontSize: 22,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ).animate().fadeIn().moveX(begin: -20),
                          Text(
                            'AI-powered stress assessment',
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
                        border: Border.all(color: Colors.blue.withOpacity(0.3)),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.info_outline, color: Colors.blue),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              "Check your stress level by providing sleep and lifestyle details.",
                              style: GoogleFonts.poppins(
                                color: Colors.blue[900],
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
                      'Demographics & Lifestyle',
                      style: GoogleFonts.poppins(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Colors.blue[900],
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
                            isNumeric: true,
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
                    _buildDropdown(
                      value: occupation,
                      label: 'Occupation',
                      items: _occupations,
                      onChanged: (v) =>
                          setState(() => occupation = v.toString()),
                      icon: Icons.work_outline,
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Expanded(
                          child: _buildDropdown(
                            value: bmiCategory,
                            label: 'BMI Category',
                            items: [
                              'Normal',
                              'Normal Weight',
                              'Overweight',
                              'Obese',
                            ],
                            onChanged: (v) =>
                                setState(() => bmiCategory = v.toString()),
                            icon: Icons.monitor_weight_outlined,
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 30),

                    Text(
                      'Sleep & Activity Metrics',
                      style: GoogleFonts.poppins(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Colors.blue[900],
                      ),
                    ),
                    const SizedBox(height: 16),

                    Row(
                      children: [
                        Expanded(
                          child: _buildTextField(
                            _sleepDurationCtrl,
                            'Sleep Duration',
                            Icons.bedtime_outlined,
                            'hrs',
                            isNumeric: true,
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: _buildTextField(
                            _sleepQualityCtrl,
                            'Sleep Quality',
                            Icons.star_border,
                            '/10',
                            isNumeric: true,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    _buildDropdown(
                      value: sleepDisorder,
                      label: 'Sleep Disorder',
                      items: ['None', 'Sleep Apnea', 'Insomnia'],
                      onChanged: (v) =>
                          setState(() => sleepDisorder = v.toString()),
                      icon: Icons.sick_outlined,
                    ),
                    const SizedBox(height: 16),
                    _buildTextField(
                      _physicalActivityCtrl,
                      'Physical Activity',
                      Icons.directions_run,
                      'mins/day',
                      isNumeric: true,
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Expanded(
                          child: _buildTextField(
                            _heartRateCtrl,
                            'Heart Rate',
                            Icons.favorite_border,
                            'bpm',
                            isNumeric: true,
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: _buildTextField(
                            _dailyStepsCtrl,
                            'Daily Steps',
                            Icons.directions_walk,
                            'steps',
                            isNumeric: true,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    _buildTextField(
                      _bloodPressureCtrl,
                      'Blood Pressure (Sys/Dia)',
                      Icons.bloodtype_outlined,
                      'mmHg',
                      isNumeric: false,
                      hint: 'e.g. 120/80',
                    ),

                    const SizedBox(height: 24),

                    // Daily Reflection Section
                    Text(
                      'Daily Reflection (Optional)',
                      style: GoogleFonts.poppins(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Colors.blue[900],
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      "Tell us how your day was to help AI understand your stress level better.",
                      style: GoogleFonts.poppins(
                        fontSize: 13,
                        color: Colors.grey[600],
                      ),
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _reflectionCtrl,
                      maxLines: 4,
                      style: GoogleFonts.poppins(),
                      decoration: InputDecoration(
                        hintText: "E.g. Today was quite busy with meetings...",
                        hintStyle: GoogleFonts.poppins(
                          color: Colors.grey[400],
                          fontSize: 14,
                        ),
                        filled: true,
                        fillColor: Colors.white,
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
                          borderSide: const BorderSide(
                            color: Color(0xFF1976D2),
                            width: 2,
                          ),
                        ),
                      ),
                    ),

                    const SizedBox(height: 32),

                    // 1st Button: Predict ML Stress Score
                    if (_result == null || _result!['stress_level'] == null)
                      SizedBox(
                        width: double.infinity,
                        height: 56,
                        child: ElevatedButton.icon(
                          onPressed: _loading ? null : _predictML,
                          icon: _loading
                              ? const SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: CircularProgressIndicator(
                                    color: Colors.white,
                                    strokeWidth: 2,
                                  ),
                                )
                              : const Icon(Icons.analytics_outlined),
                          label: Text(
                            _loading ? 'Analyzing...' : 'PREDICT STRESS SCORE',
                            style: GoogleFonts.poppins(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF1976D2),
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                            ),
                            elevation: 4,
                            shadowColor: Colors.blue.withOpacity(0.4),
                          ),
                        ),
                      ).animate().scale(
                        delay: 400.ms,
                        begin: const Offset(0.95, 0.95),
                      ),

                    // Results Banner & 2nd Button (Appears if ML score is predicted)
                    if (_result != null && _result!['stress_level'] != null)
                      Column(
                        children: [
                          Container(
                            width: double.infinity,
                            padding: const EdgeInsets.symmetric(vertical: 20),
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                colors: [Colors.blue[50]!, Colors.blue[100]!],
                              ),
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: Colors.blue[300]!),
                            ),
                            child: Column(
                              children: [
                                Text(
                                  "Your Predicted Stress Score",
                                  style: GoogleFonts.poppins(
                                    color: Colors.blue[800],
                                    fontWeight: FontWeight.w600,
                                    fontSize: 14,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  "${_result!['stress_level'].toStringAsFixed(1)} / 10",
                                  style: GoogleFonts.poppins(
                                    fontSize: 32,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.blue[900],
                                  ),
                                ),
                              ],
                            ),
                          ).animate().fadeIn().slideY(begin: 0.1),
                          const SizedBox(height: 20),
                          SizedBox(
                            width: double.infinity,
                            height: 56,
                            child: ElevatedButton.icon(
                              onPressed: _loading ? null : _getAIAdvice,
                              icon: _loading
                                  ? const SizedBox(
                                      width: 20,
                                      height: 20,
                                      child: CircularProgressIndicator(
                                        color: Colors.white,
                                        strokeWidth: 2,
                                      ),
                                    )
                                  : const Icon(Icons.auto_awesome),
                              label: Text(
                                _loading
                                    ? 'Getting Advice...'
                                    : 'GET AI ADVICE',
                                style: GoogleFonts.poppins(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.amber[700],
                                foregroundColor: Colors.white,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(16),
                                ),
                                elevation: 4,
                                shadowColor: Colors.amber.withOpacity(0.4),
                              ),
                            ),
                          ).animate().scale(
                            delay: 200.ms,
                            begin: const Offset(0.95, 0.95),
                          ),
                          const SizedBox(height: 16),
                          TextButton.icon(
                            onPressed: () {
                              setState(() {
                                _result = null;
                                _reflectionCtrl.clear();
                              });
                            },
                            icon: const Icon(Icons.refresh),
                            label: Text(
                              "Retake Test",
                              style: GoogleFonts.poppins(),
                            ),
                          ),
                        ],
                      ),

                    const SizedBox(height: 120),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTextField(
    TextEditingController controller,
    String label,
    IconData icon,
    String suffix, {
    required bool isNumeric,
    String? hint,
  }) {
    return TextFormField(
      controller: controller,
      keyboardType: isNumeric ? TextInputType.number : TextInputType.text,
      style: GoogleFonts.poppins(),
      validator: (val) => val == null || val.isEmpty ? 'Required' : null,
      decoration: InputDecoration(
        labelText: label,
        hintText: hint,
        hintStyle: GoogleFonts.poppins(color: Colors.grey[400], fontSize: 13),
        suffixText: suffix,
        // Using prefixIconConstraints to ensure icon size doesn't stretch input
        prefixIcon: Icon(icon, color: Colors.blue[700], size: 22),
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
          borderSide: const BorderSide(color: Color(0xFF1976D2), width: 2),
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
        prefixIcon: Icon(icon, color: Colors.blue[700], size: 22),
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
          borderSide: const BorderSide(color: Color(0xFF1976D2), width: 2),
        ),
      ),
      items: List.generate(
        items.length,
        (i) => DropdownMenuItem(
          value: items[i],
          child: Text(
            itemLabels?[i] ?? items[i].toString(),
            style: GoogleFonts.poppins(fontSize: 14),
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ),
      onChanged: (v) => onChanged(v),
    );
  }

  @override
  void dispose() {
    _ageCtrl.dispose();
    _sleepDurationCtrl.dispose();
    _sleepQualityCtrl.dispose();
    _physicalActivityCtrl.dispose();
    _bloodPressureCtrl.dispose();
    _heartRateCtrl.dispose();
    _dailyStepsCtrl.dispose();
    _reflectionCtrl.dispose();
    super.dispose();
  }
}
