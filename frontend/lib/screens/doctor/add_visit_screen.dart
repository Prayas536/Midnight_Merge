import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../services/api_service.dart';
import 'medication_prediction_form.dart';

class AddVisitScreen extends StatefulWidget {
  final String patientId;
  const AddVisitScreen({super.key, required this.patientId});
  @override
  State<AddVisitScreen> createState() => _AddVisitScreenState();
}

class _AddVisitScreenState extends State<AddVisitScreen> {
  final _ageCtrl = TextEditingController();
  final _bmiCtrl = TextEditingController();
  final _hba1cCtrl = TextEditingController();
  final _glucoseCtrl = TextEditingController();
  final _notesCtrl = TextEditingController();
  final _recsCtrl = TextEditingController();

  DateTime _visitDate = DateTime.now();
  final _dateCtrl = TextEditingController();
  bool _fetchingPatient = true;

  String gender = 'Male';
  int hypertension = 0;
  int heartDisease = 0;
  String smoking = 'never';
  bool _isGeneratingNotes = false;
  bool _isPredictingRisk = false;
  bool _savePrediction = true;
  Map<String, dynamic>? _prediction;
  Map<String, dynamic>? _patientData;
  final _formKey = GlobalKey<FormState>();

  @override
  void initState() {
    super.initState();
    _dateCtrl.text = _formatDate(_visitDate);
    _fetchPatientDetails();
  }

  String _formatDate(DateTime d) {
    return "${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}";
  }

  Future<void> _fetchPatientDetails() async {
    try {
      final res = await ApiService().dio.get('/patients/${widget.patientId}');
      if (mounted) {
        final data = res.data['data'];
        setState(() {
          _patientData = data;
          // Auto-fill Gender
          if (data['gender'] != null) {
            final g = data['gender'].toString().toLowerCase();
            if (g == 'male')
              gender = 'Male';
            else if (g == 'female')
              gender = 'Female';
            else
              gender = 'Other';
          }

          // Auto-fill Age from DOB
          if (data['dob'] != null) {
            final dob = DateTime.parse(data['dob']);
            final age = DateTime.now().year - dob.year;
            _ageCtrl.text = age.toString();
          } else if (data['age'] != null) {
            _ageCtrl.text = data['age'].toString();
          }

          _fetchingPatient = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _fetchingPatient = false);
        // Fallback or error handling
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not fetch patient details')),
        );
      }
    }
  }

  Future<void> _generateNotes() async {
    if (!_formKey.currentState!.validate() || _patientData == null) return;

    setState(() => _isGeneratingNotes = true);
    try {
      final res = await ApiService().dio.post(
        '/ai/generate-notes',
        data: {
          'patient_data': {
            ..._patientData!,
            'age': int.tryParse(_ageCtrl.text),
            'gender': gender,
          },
          'current_metrics': {
            'bmi': double.tryParse(_bmiCtrl.text),
            'HbA1cLevel': double.tryParse(_hba1cCtrl.text),
            'bloodGlucoseLevel': int.tryParse(_glucoseCtrl.text),
            'hypertension': hypertension == 1,
            'heartDisease': heartDisease == 1,
            'smokingHistory': smoking,
          },
          'visit_history': [],
        },
      );
      if (mounted) {
        final data = res.data['data'];
        setState(() {
          _notesCtrl.text = data?['notes'] ?? '';
          _recsCtrl.text = data?['recommendations'] ?? '';
          _isGeneratingNotes = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Notes generated successfully!')),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isGeneratingNotes = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to generate notes')),
        );
      }
    }
  }

  // Future<void> _generateNotes() async {
  //   if (!_formKey.currentState!.validate()) return;

  //   setState(() => _loading = true);
  //   try {
  //     final res = await ApiService().dio.post(
  //       '/ai/generate-notes',
  //       data: {
  //         'patientData': {
  //           'age': int.tryParse(_ageCtrl.text),
  //           'gender': gender,
  //         },
  //         'visitData': {
  //           'metrics': {
  //             'bmi': double.tryParse(_bmiCtrl.text),
  //             'HbA1cLevel': double.tryParse(_hba1cCtrl.text),
  //             'bloodGlucoseLevel': int.tryParse(_glucoseCtrl.text),
  //           },
  //         },
  //         'predictionContext': _prediction,
  //       },
  //     );
  //     if (mounted) {
  //       setState(() {
  //         _notesCtrl.text = res.data['notes'] ?? '';
  //         _recsCtrl.text = res.data['recommendations'] ?? '';
  //         _loading = false;
  //       });
  //       ScaffoldMessenger.of(context).showSnackBar(
  //         const SnackBar(content: Text('AI-generated notes added!')),
  //       );
  //     }
  //   } catch (e) {
  //     if (mounted) {
  //       setState(() => _loading = false);
  //       ScaffoldMessenger.of(context).showSnackBar(
  //         const SnackBar(content: Text('Failed to generate notes')),
  //       );
  //     }
  //   }
  // }

  Future<void> _predict() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isPredictingRisk = true);
    _prediction = null;
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
        setState(() {
          _prediction = res.data['data'];
          _isPredictingRisk = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Prediction completed successfully!')),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isPredictingRisk = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Prediction Failed. Please check inputs.'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    try {
      await ApiService().dio.post(
        '/patients/${widget.patientId}/visits',
        data: {
          'visitDate': _formatDate(_visitDate),
          'metrics': {
            'gender': gender,
            'age': int.tryParse(_ageCtrl.text),
            'hypertension': hypertension,
            'heartDisease': heartDisease,
            'smokingHistory': smoking,
            'bmi': double.tryParse(_bmiCtrl.text),
            'HbA1cLevel': double.tryParse(_hba1cCtrl.text),
            'bloodGlucoseLevel': int.tryParse(_glucoseCtrl.text),
          },
          'notes': _notesCtrl.text,
          'recommendations': _recsCtrl.text,
          'prediction': _savePrediction && _prediction != null
              ? {
                  'riskLabel': _prediction!['riskLabel'],
                  'riskScore': _prediction!['riskScore'],
                  'confidence': _prediction!['confidence'],
                  'modelVersion': _prediction!['modelVersion'],
                  'predictedAt': _prediction!['predictedAt'],
                }
              : null,
        },
      );
      if (mounted) Navigator.pop(context);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('Save Failed')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        title: Text(
          'Add New Visit',
          style: GoogleFonts.outfit(
            color: Colors.white,
            fontWeight: FontWeight.w600,
            fontSize: 22,
          ),
        ),
        backgroundColor: const Color(0xFF1E3A8A), // Deeper modern blue
        iconTheme: const IconThemeData(color: Colors.white),
        elevation: 0,
      ),
      body: _fetchingPatient
          ? const Center(
              child: CircularProgressIndicator(color: Color(0xFF1E3A8A)),
            )
          : SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Visit Details Section
                    Text(
                      'Visit Details',
                      style: GoogleFonts.outfit(
                        fontSize: 22,
                        fontWeight: FontWeight.w700,
                        color: const Color(0xFF111827),
                        letterSpacing: -0.5,
                      ),
                    ).animate().fadeIn().slideX(begin: -0.1),
                    const SizedBox(height: 16),

                    // Visit Date Picker
                    TextFormField(
                      controller: _dateCtrl,
                      readOnly: true,
                      decoration: InputDecoration(
                        labelText: 'Visit Date',
                        prefixIcon: const Icon(
                          Icons.calendar_today,
                          color: Color(0xFF1565C0),
                        ),
                        filled: true,
                        fillColor: Colors.white,
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide(color: Colors.grey[300]!),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: const BorderSide(
                            color: Color(0xFF1565C0),
                            width: 2,
                          ),
                        ),
                      ),
                      onTap: () async {
                        final picked = await showDatePicker(
                          context: context,
                          initialDate: _visitDate,
                          firstDate: DateTime(2000),
                          lastDate: DateTime.now(),
                        );
                        if (picked != null) {
                          setState(() {
                            _visitDate = picked;
                            _dateCtrl.text = _formatDate(picked);
                          });
                        }
                      },
                    ).animate().fadeIn(delay: 50.ms),

                    const SizedBox(height: 32),

                    Text(
                      'Patient Vitals',
                      style: GoogleFonts.outfit(
                        fontSize: 22,
                        fontWeight: FontWeight.w700,
                        color: const Color(0xFF111827),
                        letterSpacing: -0.5,
                      ),
                    ).animate().fadeIn().slideX(begin: -0.1),
                    const SizedBox(height: 16),

                    Row(
                      children: [
                        Expanded(
                          child: _buildTextField(
                            _ageCtrl,
                            'Age',
                            Icons.cake_outlined,
                            'yrs',
                            true, // Read Only
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: IgnorePointer(
                            ignoring: true, // Disable interaction
                            child: _buildDropdown(
                              value: gender,
                              label: 'Gender',
                              items: ['Male', 'Female', 'Other'],
                              onChanged: (v) {},
                              icon: Icons.wc_outlined,
                              isReadOnly: true,
                            ),
                          ),
                        ),
                      ],
                    ).animate().fadeIn(delay: 100.ms),
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
                    ).animate().fadeIn(delay: 200.ms),
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
                    ).animate().fadeIn(delay: 300.ms),
                    const SizedBox(height: 16),

                    _buildTextField(
                      _bmiCtrl,
                      'BMI',
                      Icons.speed_rounded,
                      'kg/m²',
                    ).animate().fadeIn(delay: 400.ms),
                    const SizedBox(height: 16),
                    _buildTextField(
                      _hba1cCtrl,
                      'HbA1c Level',
                      Icons.bloodtype_outlined,
                      '%',
                    ).animate().fadeIn(delay: 500.ms),
                    const SizedBox(height: 16),
                    _buildTextField(
                      _glucoseCtrl,
                      'Blood Glucose',
                      Icons.water_drop_outlined,
                      'mg/dL',
                    ).animate().fadeIn(delay: 600.ms),

                    const SizedBox(height: 32),
                    Text(
                      'Assessment & AI Analysis',
                      style: GoogleFonts.outfit(
                        fontSize: 22,
                        fontWeight: FontWeight.w700,
                        color: const Color(0xFF111827),
                        letterSpacing: -0.5,
                      ),
                    ).animate().fadeIn(delay: 700.ms).slideX(begin: -0.1),
                    const SizedBox(height: 16),

                    TextField(
                      controller: _notesCtrl,
                      maxLines: 5,
                      minLines: 3,
                      decoration: InputDecoration(
                        labelText: 'Visit Notes',
                        prefixIcon: const Icon(
                          Icons.note_alt_outlined,
                          color: Color(0xFF1565C0),
                        ),
                        filled: true,
                        fillColor: Colors.white,
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ).animate().fadeIn(delay: 700.ms),
                    const SizedBox(height: 16),

                    TextField(
                      controller: _recsCtrl,
                      maxLines: 5,
                      minLines: 3,
                      decoration: InputDecoration(
                        labelText: 'Recommendations',
                        prefixIcon: const Icon(
                          Icons.recommend_outlined,
                          color: Color(0xFF1565C0),
                        ),
                        filled: true,
                        fillColor: Colors.white,
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ).animate().fadeIn(delay: 800.ms),

                    const SizedBox(height: 16),

                    // Generate Notes Button
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: _isGeneratingNotes ? null : _generateNotes,
                        icon: _isGeneratingNotes
                            ? const SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  color: Colors.white,
                                ),
                              )
                            : const Icon(Icons.smart_toy_rounded, size: 22),
                        label: Text(
                          _isGeneratingNotes
                              ? 'Generating Notes...'
                              : 'Generate Notes & Recommendations',
                          style: GoogleFonts.inter(
                            fontWeight: FontWeight.w600,
                            fontSize: 16,
                          ),
                        ),
                        style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 20),
                          backgroundColor: const Color(0xFF10B981), // Emerald
                          foregroundColor: Colors.white,
                          elevation: 2,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                        ),
                      ),
                    ).animate().fadeIn(delay: 850.ms),

                    const SizedBox(height: 20),

                    // Run Prediction Button
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: _isPredictingRisk ? null : _predict,
                        icon: _isPredictingRisk
                            ? const SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  color: Colors.white,
                                ),
                              )
                            : const Icon(Icons.auto_graph_rounded, size: 22),
                        label: Text(
                          _isPredictingRisk
                              ? 'Running ML Model...'
                              : 'Run Risk Prediction',
                          style: GoogleFonts.inter(
                            fontWeight: FontWeight.w600,
                            fontSize: 16,
                          ),
                        ),
                        style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 20),
                          backgroundColor: const Color(0xFF3B82F6), // Blue
                          foregroundColor: Colors.white,
                          elevation: 2,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                        ),
                      ),
                    ).animate().fadeIn(delay: 900.ms),

                    const SizedBox(height: 16),

                    // Recommend Medication Button
                    SizedBox(
                      width: double.infinity,
                      child: OutlinedButton.icon(
                        onPressed: _isGeneratingNotes || _isPredictingRisk
                            ? null
                            : () {
                                // Pass current form data to prediction form
                                final initialData = {
                                  'age': int.tryParse(_ageCtrl.text),
                                  'bmi': double.tryParse(_bmiCtrl.text),
                                  'HbA1cLevel': double.tryParse(
                                    _hba1cCtrl.text,
                                  ),
                                  'bloodGlucoseLevel': int.tryParse(
                                    _glucoseCtrl.text,
                                  ),
                                  'smokingHistory': smoking,
                                };
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => MedicationPredictionForm(
                                      initialData: initialData,
                                    ),
                                  ),
                                );
                              },
                        icon: const Icon(
                          Icons.medical_services_outlined,
                          size: 22,
                        ),
                        label: Text(
                          'Recommend Medications',
                          style: GoogleFonts.inter(
                            fontWeight: FontWeight.w600,
                            fontSize: 16,
                          ),
                        ),
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 20),
                          side: const BorderSide(
                            color: Color(0xFF8B5CF6), // Purple
                            width: 2,
                          ),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                          foregroundColor: const Color(0xFF8B5CF6),
                        ),
                      ),
                    ).animate().fadeIn(delay: 950.ms),

                    const SizedBox(height: 16),

                    if (_prediction != null)
                      Container(
                        padding: const EdgeInsets.all(24),
                        width: double.infinity,
                        decoration: BoxDecoration(
                          color: _prediction!['riskLabel'] == 'High Risk'
                              ? const Color(0xFFFEF2F2)
                              : const Color(0xFFEFF6FF),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.fromBorderSide(
                            BorderSide(
                              color: _prediction!['riskLabel'] == 'High Risk'
                                  ? const Color(0xFFEF4444).withOpacity(0.3)
                                  : const Color(0xFF3B82F6).withOpacity(0.3),
                              width: 2,
                            ),
                          ),
                        ),
                        child: Column(
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color:
                                        _prediction!['riskLabel'] == 'High Risk'
                                        ? const Color(
                                            0xFFEF4444,
                                          ).withOpacity(0.15)
                                        : const Color(
                                            0xFF3B82F6,
                                          ).withOpacity(0.15),
                                    shape: BoxShape.circle,
                                  ),
                                  child: Icon(
                                    _prediction!['riskLabel'] == 'High Risk'
                                        ? Icons.warning_rounded
                                        : Icons.health_and_safety_rounded,
                                    color:
                                        _prediction!['riskLabel'] == 'High Risk'
                                        ? const Color(0xFFEF4444)
                                        : const Color(0xFF3B82F6),
                                    size: 32,
                                  ),
                                ),
                                const SizedBox(width: 16),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        "AI Prediction Analysis",
                                        style: GoogleFonts.inter(
                                          fontWeight: FontWeight.w600,
                                          color:
                                              _prediction!['riskLabel'] ==
                                                  'High Risk'
                                              ? const Color(
                                                  0xFFEF4444,
                                                ).withOpacity(0.8)
                                              : const Color(
                                                  0xFF3B82F6,
                                                ).withOpacity(0.8),
                                          fontSize: 14,
                                          letterSpacing: 0.5,
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        "${_prediction!['riskLabel']}",
                                        style: GoogleFonts.outfit(
                                          fontSize: 26,
                                          fontWeight: FontWeight.w800,
                                          color:
                                              _prediction!['riskLabel'] ==
                                                  'High Risk'
                                              ? Colors.red[900]
                                              : Colors.blue[900],
                                          height: 1.1,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 20),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                vertical: 12,
                                horizontal: 16,
                              ),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    "Risk Probability",
                                    style: GoogleFonts.inter(
                                      fontWeight: FontWeight.w600,
                                      color: Colors.grey[700],
                                    ),
                                  ),
                                  Text(
                                    "${(_prediction!['riskScore'] * 100).toStringAsFixed(1)}%",
                                    style: GoogleFonts.inter(
                                      fontSize: 18,
                                      fontWeight: FontWeight.w800,
                                      color:
                                          _prediction!['riskLabel'] ==
                                              'High Risk'
                                          ? const Color(0xFFEF4444)
                                          : const Color(0xFF3B82F6),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ).animate().fadeIn().scale(),

                    if (_prediction != null)
                      Padding(
                        padding: const EdgeInsets.only(top: 8.0),
                        child: CheckboxListTile(
                          title: Text(
                            'Save this prediction with visit record',
                            style: GoogleFonts.poppins(fontSize: 14),
                          ),
                          value: _savePrediction,
                          activeColor: const Color(0xFF1565C0),
                          contentPadding: EdgeInsets.zero,
                          controlAffinity: ListTileControlAffinity.leading,
                          onChanged: (v) =>
                              setState(() => _savePrediction = v!),
                        ),
                      ),

                    const SizedBox(height: 24),

                    // Save Button
                    ElevatedButton.icon(
                      onPressed: _submit,
                      icon: const Icon(Icons.check_circle_rounded, size: 28),
                      label: Text(
                        'Save Visit Record',
                        style: GoogleFonts.outfit(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 0.5,
                        ),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF1E3A8A), // Deeper blue
                        foregroundColor: Colors.white,
                        minimumSize: const Size(double.infinity, 64),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(20),
                        ),
                        elevation: 6,
                        shadowColor: const Color(0xFF1E3A8A).withOpacity(0.5),
                      ),
                    ).animate().fadeIn(delay: 1000.ms).slideY(begin: 0.2),

                    const SizedBox(height: 30),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildTextField(
    TextEditingController controller,
    String label,
    IconData icon, [
    String? suffix,
    bool readOnly = false,
  ]) {
    return TextFormField(
      controller: controller,
      keyboardType: TextInputType.number,
      readOnly: readOnly,
      style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w500),
      validator: (val) => val == null || val.isEmpty ? 'Required' : null,
      decoration: InputDecoration(
        labelText: label,
        suffixText: suffix,
        labelStyle: GoogleFonts.inter(
          color: Colors.grey[600],
          fontWeight: FontWeight.w500,
        ),
        prefixIcon: Icon(
          icon,
          color: readOnly ? Colors.grey[400] : const Color(0xFF3B82F6),
          size: 22,
        ),
        filled: true,
        fillColor: readOnly ? Colors.grey[50] : Colors.white,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: Colors.grey[200]!, width: 1.5),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: Color(0xFF3B82F6), width: 2),
        ),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 20,
          vertical: 18,
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
    bool isReadOnly = false,
  }) {
    return DropdownButtonFormField(
      isExpanded: true,
      value: value,
      dropdownColor: Colors.white,
      icon: Icon(Icons.keyboard_arrow_down_rounded, color: Colors.grey[600]),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: GoogleFonts.inter(
          color: Colors.grey[600],
          fontWeight: FontWeight.w500,
        ),
        prefixIcon: Icon(
          icon,
          color: isReadOnly ? Colors.grey[400] : const Color(0xFF3B82F6),
          size: 22,
        ),
        filled: true,
        fillColor: isReadOnly ? Colors.grey[50] : Colors.white,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: Colors.grey[200]!, width: 1.5),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: Color(0xFF3B82F6), width: 2),
        ),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 20,
          vertical: 18,
        ),
      ),
      items: List.generate(
        items.length,
        (i) => DropdownMenuItem(
          value: items[i],
          child: Text(
            itemLabels?[i] ?? items[i].toString(),
            style: GoogleFonts.poppins(
              color: isReadOnly ? Colors.grey[600] : Colors.black87,
            ),
          ),
        ),
      ),
      onChanged: (v) => onChanged(v),
    );
  }
}
