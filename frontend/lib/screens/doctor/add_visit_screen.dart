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
  bool _loading = false;
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

    setState(() => _loading = true);
    try {
      final res = await ApiService().dio.post(
        '/ai/generate-notes',
        data: {
          'patientData': {
            ..._patientData!,
            'age': int.tryParse(_ageCtrl.text),
            'gender': gender,
            'hypertension': hypertension,
            'heart_disease': heartDisease,
            'smoking_history': smoking,
          },
          'visitData': {
            'metrics': {
              'bmi': double.tryParse(_bmiCtrl.text),
              'HbA1cLevel': double.tryParse(_hba1cCtrl.text),
              'bloodGlucoseLevel': int.tryParse(_glucoseCtrl.text),
            },
          },
          'predictionContext': _prediction,
        },
      );
      if (mounted) {
        final data = res.data;
        setState(() {
          _notesCtrl.text = data['notes'] ?? '';
          _recsCtrl.text = data['recommendations'] ?? '';
          _loading = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Notes generated successfully!')),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _loading = false);
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

    setState(() => _loading = true);
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
          _loading = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Prediction completed successfully!')),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _loading = false);
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
      appBar: AppBar(
        title: Text(
          'Add New Visit',
          style: GoogleFonts.poppins(color: Colors.white),
        ),
        backgroundColor: const Color(0xFF1565C0),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: _fetchingPatient
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Visit Details',
                      style: GoogleFonts.poppins(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Colors.black87,
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

                    const SizedBox(height: 24),

                    Text(
                      'Patient Vitals',
                      style: GoogleFonts.poppins(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Colors.black87,
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

                    const SizedBox(height: 24),
                    Text(
                      'Assessment',
                      style: GoogleFonts.poppins(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Colors.black87,
                      ),
                    ).animate().fadeIn(delay: 700.ms).slideX(begin: -0.1),
                    const SizedBox(height: 16),

                    TextField(
                      controller: _notesCtrl,
                      maxLines: 2,
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
                      maxLines: 2,
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
                      child: OutlinedButton.icon(
                        onPressed: _loading ? null : _generateNotes,
                        icon: _loading
                            ? const SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                ),
                              )
                            : const Icon(Icons.smart_toy_rounded),
                        label: Text(
                          _loading
                              ? 'Generating Notes...'
                              : 'Generate Notes & Recommendations (AI)',
                        ),
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          side: const BorderSide(color: Color(0xFF4CAF50)),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                      ),
                    ).animate().fadeIn(delay: 850.ms),

                    const SizedBox(height: 20),

                    // Run Prediction Button
                    SizedBox(
                      width: double.infinity,
                      child: OutlinedButton.icon(
                        onPressed: _loading ? null : _predict,
                        icon: _loading
                            ? const SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                ),
                              )
                            : const Icon(Icons.auto_graph_rounded),
                        label: Text(
                          _loading
                              ? 'Running ML Model...'
                              : 'Run Risk Prediction (AI)',
                        ),
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          side: const BorderSide(color: Color(0xFF1565C0)),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                      ),
                    ).animate().fadeIn(delay: 900.ms),

                    const SizedBox(height: 16),

                    // Recommend Medication Button
                    SizedBox(
                      width: double.infinity,
                      child: OutlinedButton.icon(
                        onPressed: _loading
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
                                  // Add others if mapped
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
                        icon: const Icon(Icons.medical_services_outlined),
                        label: const Text('Recommend Medications (AI)'),
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          side: const BorderSide(
                            color: Color(0xFF9C27B0),
                          ), // Purple
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          foregroundColor: const Color(0xFF9C27B0),
                        ),
                      ),
                    ).animate().fadeIn(delay: 950.ms),

                    const SizedBox(height: 16),

                    if (_prediction != null)
                      Container(
                        padding: const EdgeInsets.all(16),
                        width: double.infinity,
                        decoration: BoxDecoration(
                          color: _prediction!['riskLabel'] == 'High Risk'
                              ? Colors.red.shade50
                              : Colors.blue.shade50,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: _prediction!['riskLabel'] == 'High Risk'
                                ? Colors.red.withOpacity(0.3)
                                : Colors.blue.withOpacity(0.3),
                          ),
                        ),
                        child: Column(
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  _prediction!['riskLabel'] == 'High Risk'
                                      ? Icons.warning_rounded
                                      : Icons.check_circle_rounded,
                                  color:
                                      _prediction!['riskLabel'] == 'High Risk'
                                      ? Colors.red
                                      : Colors.blue,
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  "AI Prediction Result",
                                  style: GoogleFonts.poppins(
                                    fontWeight: FontWeight.bold,
                                    color:
                                        _prediction!['riskLabel'] == 'High Risk'
                                        ? Colors.red[900]
                                        : Colors.blue[900],
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Text(
                              "${_prediction!['riskLabel']} (${(_prediction!['riskScore'] * 100).toStringAsFixed(1)}%)",
                              style: GoogleFonts.poppins(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
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
                      icon: const Icon(Icons.save_rounded),
                      label: Text(
                        'Save Visit Record',
                        style: GoogleFonts.poppins(fontWeight: FontWeight.bold),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF1565C0),
                        foregroundColor: Colors.white,
                        minimumSize: const Size(double.infinity, 56),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                        elevation: 4,
                        shadowColor: Colors.blue.withOpacity(0.4),
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
      validator: (val) => val == null || val.isEmpty ? 'Required' : null,
      decoration: InputDecoration(
        labelText: label,
        suffixText: suffix,
        prefixIcon: Icon(
          icon,
          color: readOnly ? Colors.grey : const Color(0xFF1565C0),
          size: 20,
        ),
        filled: true,
        fillColor: readOnly ? Colors.grey[100] : Colors.white, // Visual cue
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.grey[300]!),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(
            color: readOnly
                ? Colors.grey
                : const Color(0xFF1565C0), // Visual cue
            width: 2,
          ),
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
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(
          icon,
          color: isReadOnly ? Colors.grey : const Color(0xFF1565C0),
          size: 20,
        ),
        filled: true,
        fillColor: isReadOnly ? Colors.grey[100] : Colors.white,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.grey[300]!),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(
            color: isReadOnly ? Colors.grey : const Color(0xFF1565C0),
            width: 2,
          ),
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
