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

  // Returns mood-based color for the dialog header
  Color _getMoodColor(String mood) {
    switch (mood.toLowerCase()) {
      case 'very happy':
        return const Color(0xFF2E7D32); // Deep green
      case 'happy':
        return const Color(0xFF43A047); // Green
      case 'neutral':
        return const Color(0xFFFFA726); // Orange
      case 'stressed':
        return const Color(0xFFE53935); // Red
      case 'very stressed':
        return const Color(0xFFB71C1C); // Dark red
      case 'overwhelmed':
        return const Color(0xFF880E4F); // Deep pink
      default:
        return const Color(0xFF1976D2); // Blue fallback
    }
  }

  // Returns a secondary lighter shade for backgrounds
  Color _getMoodBgColor(String mood) {
    switch (mood.toLowerCase()) {
      case 'very happy':
        return const Color(0xFFE8F5E9);
      case 'happy':
        return const Color(0xFFF1F8E9);
      case 'neutral':
        return const Color(0xFFFFF3E0);
      case 'stressed':
        return const Color(0xFFFFEBEE);
      case 'very stressed':
        return const Color(0xFFFFCDD2);
      case 'overwhelmed':
        return const Color(0xFFFCE4EC);
      default:
        return const Color(0xFFE3F2FD);
    }
  }

  // Returns mood emoji
  String _getMoodEmoji(String mood) {
    switch (mood.toLowerCase()) {
      case 'very happy':
        return '😄';
      case 'happy':
        return '😊';
      case 'neutral':
        return '😐';
      case 'stressed':
        return '😟';
      case 'very stressed':
        return '😰';
      case 'overwhelmed':
        return '😵';
      default:
        return '🧠';
    }
  }

  void _showResultDialog() {
    if (_result == null) return;

    final stressLevel = _result!['stress_level'];
    final mood = _result!['mood'] ?? 'Neutral';
    final recommendations = _result!['recommendations'] as List? ?? [];
    final moodColor = _getMoodColor(mood);
    final moodBgColor = _getMoodBgColor(mood);
    final moodEmoji = _getMoodEmoji(mood);

    showDialog(
      context: context,
      builder: (ctx) {
        final screenHeight = MediaQuery.of(ctx).size.height;
        return AlertDialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(24),
          ),
          backgroundColor: Colors.white,
          contentPadding: EdgeInsets.zero,
          insetPadding: const EdgeInsets.symmetric(
            horizontal: 20,
            vertical: 24,
          ),
          content: ConstrainedBox(
            constraints: BoxConstraints(
              maxHeight: screenHeight * 0.8,
              maxWidth: 400,
            ),
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // ── Header: mood-based color, full width ──
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(
                      vertical: 28,
                      horizontal: 20,
                    ),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [moodColor, moodColor.withOpacity(0.85)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: const BorderRadius.only(
                        topLeft: Radius.circular(24),
                        topRight: Radius.circular(24),
                      ),
                    ),
                    child: Column(
                      children: [
                        Text(moodEmoji, style: const TextStyle(fontSize: 48)),
                        const SizedBox(height: 10),
                        Text(
                          'AI Analysis Complete',
                          textAlign: TextAlign.center,
                          style: GoogleFonts.poppins(
                            color: Colors.white,
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Based on your health metrics & reflection',
                          textAlign: TextAlign.center,
                          style: GoogleFonts.poppins(
                            color: Colors.white70,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ),

                  // ── Results table section ──
                  Padding(
                    padding: const EdgeInsets.fromLTRB(20, 20, 20, 8),
                    child: Container(
                      decoration: BoxDecoration(
                        color: Colors.grey[50],
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: Colors.grey[200]!),
                      ),
                      child: Column(
                        children: [
                          // Stress Score row
                          _buildTableRow(
                            icon: Icons.analytics_outlined,
                            iconColor: moodColor,
                            label: 'Stress Score',
                            value: '${stressLevel.toStringAsFixed(1)} / 10',
                            valueColor: moodColor,
                            isFirst: true,
                          ),
                          Divider(height: 1, color: Colors.grey[200]),
                          // Mood row
                          _buildTableRow(
                            icon: Icons.sentiment_satisfied_alt,
                            iconColor: moodColor,
                            label: 'Detected Mood',
                            value: '$moodEmoji $mood',
                            valueColor: moodColor,
                            isFirst: false,
                          ),
                        ],
                      ),
                    ),
                  ),

                  // ── AI Message ──
                  if (_result!['ai_message'] != null)
                    Padding(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 20,
                        vertical: 10,
                      ),
                      child: Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: moodBgColor,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: moodColor.withOpacity(0.3)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Icon(
                                  Icons.auto_awesome,
                                  color: moodColor,
                                  size: 18,
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  'AI Insight',
                                  style: GoogleFonts.poppins(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w600,
                                    color: moodColor,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 10),
                            Text(
                              _result!['ai_message'],
                              style: GoogleFonts.poppins(
                                fontSize: 13,
                                color: Colors.black87,
                                height: 1.6,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),

                  // ── Recommendations ──
                  if (recommendations.isNotEmpty) ...[
                    Padding(
                      padding: const EdgeInsets.fromLTRB(20, 10, 20, 8),
                      child: Text(
                        '💡 Recommendations',
                        style: GoogleFonts.poppins(
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                          color: Colors.grey[800],
                        ),
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 20),
                      child: Column(
                        children: List.generate(recommendations.length, (i) {
                          return Container(
                            width: double.infinity,
                            margin: const EdgeInsets.only(bottom: 8),
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: Colors.grey[200]!),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withOpacity(0.03),
                                  blurRadius: 4,
                                  offset: const Offset(0, 2),
                                ),
                              ],
                            ),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Container(
                                  width: 26,
                                  height: 26,
                                  decoration: BoxDecoration(
                                    color: moodColor.withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Center(
                                    child: Text(
                                      '${i + 1}',
                                      style: GoogleFonts.poppins(
                                        fontSize: 12,
                                        fontWeight: FontWeight.bold,
                                        color: moodColor,
                                      ),
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Text(
                                    recommendations[i].toString(),
                                    style: GoogleFonts.poppins(
                                      fontSize: 13,
                                      color: Colors.black87,
                                      height: 1.4,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          );
                        }),
                      ),
                    ),
                  ],

                  // ── Close button ──
                  Padding(
                    padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
                    child: SizedBox(
                      width: double.infinity,
                      height: 50,
                      child: ElevatedButton(
                        onPressed: () => Navigator.pop(ctx),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: moodColor,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14),
                          ),
                          elevation: 2,
                        ),
                        child: Text(
                          'Close',
                          style: GoogleFonts.poppins(
                            fontWeight: FontWeight.bold,
                            fontSize: 15,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  // Table-like row widget for results
  Widget _buildTableRow({
    required IconData icon,
    required Color iconColor,
    required String label,
    required String value,
    required Color valueColor,
    required bool isFirst,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      child: Row(
        children: [
          Icon(icon, color: iconColor, size: 22),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              label,
              style: GoogleFonts.poppins(color: Colors.grey[700], fontSize: 14),
              overflow: TextOverflow.ellipsis,
            ),
          ),
          const SizedBox(width: 8),
          Flexible(
            child: Text(
              value,
              style: GoogleFonts.poppins(
                fontWeight: FontWeight.bold,
                color: valueColor,
                fontSize: 15,
              ),
              textAlign: TextAlign.right,
              overflow: TextOverflow.ellipsis,
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
