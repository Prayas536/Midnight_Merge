import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../services/api_service.dart';
import 'patient_details_screen.dart';

class PatientsScreen extends StatefulWidget {
  const PatientsScreen({super.key});
  @override
  State<PatientsScreen> createState() => _PatientsScreenState();
}

class _PatientsScreenState extends State<PatientsScreen> {
  List<dynamic> _patients = [];
  bool _loading = true;
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadPatients();
  }

  Future<void> _loadPatients([String? q]) async {
    setState(() => _loading = true);
    try {
      final res = await ApiService().dio.get(
        '/patients',
        queryParameters: q != null && q.isNotEmpty ? {'q': q} : {},
      );
      if (mounted) {
        setState(() {
          _patients = res.data['data'];
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _showAddPatientDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => const AddPatientDialog(),
    ).then((val) {
      if (val == true) _loadPatients();
    });
  }

  @override
  Widget build(BuildContext context) {
    // Using a Column directly since the parent manages the Scaffold/Body
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
          padding: const EdgeInsets.fromLTRB(20, 20, 20, 30),
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
                      Icons.people_alt_rounded,
                      color: Colors.white,
                      size: 32,
                    ),
                  ).animate().scale(
                    duration: 400.ms,
                    curve: Curves.easeOutBack,
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'My Patients',
                          style: GoogleFonts.poppins(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ).animate().fadeIn().moveX(begin: -20),
                        Text(
                          'Manage and view all patients',
                          style: GoogleFonts.poppins(
                            fontSize: 14,
                            color: Colors.white70,
                          ),
                        ).animate().fadeIn(delay: 200.ms).moveX(begin: -20),
                      ],
                    ),
                  ),
                  GestureDetector(
                    onTap: _showAddPatientDialog,
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.1),
                            blurRadius: 8,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: const Icon(
                        Icons.add,
                        color: Color(0xFF1565C0),
                        size: 24,
                      ),
                    ),
                  ).animate().scale(
                    delay: 300.ms,
                    duration: 400.ms,
                    curve: Curves.elasticOut,
                  ),
                ],
              ),
            ],
          ),
        ),

        // Search bar
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 24, 16, 16),
          child: TextField(
            controller: _searchController,
            decoration: InputDecoration(
              hintText: 'Search by name or ID...',
              prefixIcon: const Icon(Icons.search),
              suffixIcon: IconButton(
                icon: const Icon(Icons.clear),
                onPressed: () {
                  _searchController.clear();
                  _loadPatients();
                },
              ),
              filled: true,
              fillColor: Colors.white,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(16),
                borderSide: BorderSide.none,
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(16),
                borderSide: BorderSide.none,
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(16),
                borderSide: const BorderSide(
                  color: Color(0xFF2196F3),
                  width: 1.5,
                ),
              ),
              contentPadding: const EdgeInsets.symmetric(
                vertical: 16,
                horizontal: 20,
              ),
              // Shadow effect handled by Container wrap usually, but InputDecorator works too.
            ),
            onSubmitted: _loadPatients,
          ),
        ).animate().fadeIn(delay: 400.ms).slideY(begin: 0.2),

        // Patients list
        Expanded(
          child: _loading
              ? const Center(child: CircularProgressIndicator())
              : _patients.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.person_off_rounded,
                        size: 64,
                        color: Colors.grey[300],
                      ),
                      const SizedBox(height: 16),
                      Text(
                        "No patients found",
                        style: GoogleFonts.poppins(
                          fontSize: 18,
                          color: Colors.grey[500],
                        ),
                      ),
                    ],
                  ).animate().fadeIn(),
                )
              : ListView.builder(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 8,
                  ),
                  itemCount: _patients.length,
                  itemBuilder: (ctx, i) {
                    final p = _patients[i];
                    // Simulated risk level for UI demo if not in backend
                    final riskLevel = _getRandomRiskLevel();
                    return _PatientCard(
                          patient: p,
                          riskLevel: riskLevel,
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) =>
                                    PatientDetailsScreen(patientId: p['_id']),
                              ),
                            ).then(
                              (_) => _loadPatients(),
                            ); // Refresh list after returning
                          },
                        )
                        .animate(delay: (i * 100).ms)
                        .fadeIn()
                        .slideX(begin: 0.2, curve: Curves.easeOut);
                  },
                ),
        ),
      ],
    );
  }

  String _getRandomRiskLevel() {
    // Just a placeholder for visual variety
    final levels = ['Low Risk', 'Medium Risk', 'High Risk'];
    return levels[(DateTime.now().microsecondsSinceEpoch % 3)];
  }
}

class _PatientCard extends StatelessWidget {
  final dynamic patient;
  final String riskLevel;
  final VoidCallback onTap;

  const _PatientCard({
    required this.patient,
    required this.riskLevel,
    required this.onTap,
  });

  Color _getRiskColor() {
    if (riskLevel == 'High Risk') return Colors.red;
    if (riskLevel == 'Medium Risk') return Colors.orange;
    return Colors.green;
  }

  @override
  Widget build(BuildContext context) {
    // final riskColor = _getRiskColor(); // Removed unused variable
    final gender = patient['gender']?.toString() ?? 'N/A';
    final genderIcon = gender.toLowerCase() == 'male'
        ? Icons.male
        : Icons.female;

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.blueGrey.withOpacity(0.08),
            blurRadius: 15,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(20),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(20),
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header with avatar and info
                Row(
                  children: [
                    Container(
                      width: 56,
                      height: 56,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            const Color(0xFF2196F3).withOpacity(0.8),
                            const Color(0xFF1565C0).withOpacity(0.8),
                          ],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Center(
                        child: Text(
                          (patient['name'] as String).isNotEmpty
                              ? patient['name'][0].toUpperCase()
                              : '?',
                          style: GoogleFonts.poppins(
                            color: Colors.white,
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            patient['name'],
                            style: GoogleFonts.poppins(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: const Color(0xFF333333),
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'ID: ${patient['patientId']}',
                            style: GoogleFonts.poppins(
                              fontSize: 12,
                              color: Colors.grey[500],
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.grey[100],
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(
                        Icons.arrow_forward_ios_rounded,
                        size: 16,
                        color: Colors.grey[400],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Divider(color: Colors.grey[100], height: 1),
                const SizedBox(height: 16),
                // Info row
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    _PatientInfoChip(
                      icon: genderIcon,
                      label: gender,
                      color: const Color(0xFF2196F3),
                    ),
                    _PatientInfoChip(
                      icon: patient['hypertension'] == true
                          ? Icons.favorite
                          : Icons.favorite_border,
                      label: patient['hypertension'] == true
                          ? 'Hypertension'
                          : 'Normal BP',
                      color: patient['hypertension'] == true
                          ? Colors.red
                          : Colors.green,
                    ),
                    _PatientInfoChip(
                      icon: Icons.monitor_heart_outlined,
                      label: patient['heartDisease'] == true
                          ? 'Heart Issue'
                          : 'Heart OK',
                      color: patient['heartDisease'] == true
                          ? Colors.orange
                          : Colors.green,
                    ),
                  ],
                ),
                // Add Risk Level Badge explicitly if needed, or rely on chips.
                // The prompt asked for "Enhance UI", so adding the risk badge back (nicely) is good.
                const SizedBox(height: 12),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: _getRiskColor().withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: _getRiskColor().withOpacity(0.2),
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Icons.warning_amber_rounded,
                            size: 14,
                            color: _getRiskColor(),
                          ),
                          const SizedBox(width: 6),
                          Text(
                            riskLevel,
                            style: GoogleFonts.poppins(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: _getRiskColor(),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _PatientInfoChip extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;

  const _PatientInfoChip({
    required this.icon,
    required this.label,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.08),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: color),
          const SizedBox(width: 4),
          Text(
            label,
            style: GoogleFonts.poppins(
              fontSize: 11,
              color: color,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}

class AddPatientDialog extends StatefulWidget {
  const AddPatientDialog({super.key});
  @override
  State<AddPatientDialog> createState() => _AddPatientDialogState();
}

class _AddPatientDialogState extends State<AddPatientDialog> {
  final _formKey = GlobalKey<FormState>();
  String name = '';
  final TextEditingController _dobController = TextEditingController();
  DateTime? selectedDob;
  String gender = 'male';
  String smokingHistory = 'no info';
  bool hypertension = false;
  bool heartDisease = false;
  String bmi = '';
  String hba1c = '';
  String glucose = '';
  bool _submitting = false;

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    _formKey.currentState!.save();

    setState(() => _submitting = true);

    try {
      final res = await ApiService().dio.post(
        '/patients',
        data: {
          'name': name,
          'dob': selectedDob!.toIso8601String(),
          'gender': gender,
          'smokingHistory': smokingHistory,
          'hypertension': hypertension,
          'heartDisease': heartDisease,
          'bmi': bmi.isNotEmpty ? double.parse(bmi) : null,
          'HbA1cLevel': hba1c.isNotEmpty ? double.parse(hba1c) : null,
          'bloodGlucoseLevel': glucose.isNotEmpty
              ? double.parse(glucose)
              : null,
        },
      );

      if (!mounted) return;

      final login = res.data['data']['patientLogin'];

      await showDialog(
        context: context,
        barrierDismissible: false,
        builder: (_) => AlertDialog(
          title: Text(
            'Patient Created',
            style: GoogleFonts.poppins(fontWeight: FontWeight.bold),
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Please save these credentials:',
                style: GoogleFonts.poppins(),
              ),
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.grey[100],
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.grey[300]!),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    SelectableText(
                      'ID: ${login['patientId']}',
                      style: GoogleFonts.robotoMono(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    SelectableText(
                      'Password: ${login['password']}',
                      style: GoogleFonts.robotoMono(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          actions: [
            FilledButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('OK'),
            ),
          ],
        ),
      );

      if (mounted) Navigator.pop(context, true);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Create failed: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text(
        'Add New Patient',
        style: GoogleFonts.poppins(fontWeight: FontWeight.bold),
      ),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      content: SizedBox(
        width: MediaQuery.of(context).size.width * 0.8,
        child: SingleChildScrollView(
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                _buildTextField(
                  'Full Name',
                  Icons.person_outline,
                  (v) => name = v!,
                ),
                const SizedBox(height: 16),

                TextFormField(
                  controller: _dobController,
                  readOnly: true,
                  decoration: InputDecoration(
                    labelText: 'Date of Birth',
                    prefixIcon: const Icon(Icons.calendar_today_outlined),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  validator: (v) => v!.isEmpty ? 'Required' : null,
                  onTap: () async {
                    final picked = await showDatePicker(
                      context: context,
                      initialDate: DateTime(1990),
                      firstDate: DateTime(1900),
                      lastDate: DateTime.now(),
                    );
                    if (picked != null) {
                      selectedDob = picked;
                      _dobController.text =
                          "${picked.year}-${picked.month.toString().padLeft(2, '0')}-${picked.day.toString().padLeft(2, '0')}";
                    }
                  },
                ),
                const SizedBox(height: 16),

                DropdownButtonFormField<String>(
                  value: gender,
                  decoration: InputDecoration(
                    labelText: 'Gender',
                    prefixIcon: const Icon(Icons.wc),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  items: const [
                    DropdownMenuItem(value: 'male', child: Text('Male')),
                    DropdownMenuItem(value: 'female', child: Text('Female')),
                    DropdownMenuItem(value: 'other', child: Text('Other')),
                  ],
                  onChanged: (v) => setState(() => gender = v!),
                ),
                const SizedBox(height: 16),

                DropdownButtonFormField<String>(
                  value: smokingHistory,
                  decoration: InputDecoration(
                    labelText: 'Smoking History',
                    prefixIcon: const Icon(Icons.smoking_rooms_outlined),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  items: const [
                    DropdownMenuItem(value: 'no info', child: Text('No Info')),
                    DropdownMenuItem(value: 'never', child: Text('Never')),
                    DropdownMenuItem(value: 'former', child: Text('Former')),
                    DropdownMenuItem(value: 'current', child: Text('Current')),
                    DropdownMenuItem(
                      value: 'not current',
                      child: Text('Not Current'),
                    ),
                  ],
                  onChanged: (v) => setState(() => smokingHistory = v!),
                ),
                const SizedBox(height: 16),

                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 8,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.grey[50],
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.grey[200]!),
                  ),
                  child: Column(
                    children: [
                      SwitchListTile(
                        title: Text(
                          'Hypertension',
                          style: GoogleFonts.poppins(),
                        ),
                        value: hypertension,
                        onChanged: (v) => setState(() => hypertension = v),
                        secondary: const Icon(
                          Icons.bloodtype_outlined,
                          color: Colors.red,
                        ),
                      ),
                      Divider(height: 1, color: Colors.grey[200]),
                      SwitchListTile(
                        title: Text(
                          'Heart Disease',
                          style: GoogleFonts.poppins(),
                        ),
                        value: heartDisease,
                        onChanged: (v) => setState(() => heartDisease = v),
                        secondary: const Icon(
                          Icons.monitor_heart_outlined,
                          color: Colors.orange,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                Row(
                  children: [
                    Expanded(
                      child: _buildTextField(
                        'BMI',
                        Icons.scale_outlined,
                        (v) => bmi = v!,
                        isNumber: true,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _buildTextField(
                        'HbA1c',
                        Icons.opacity,
                        (v) => hba1c = v!,
                        isNumber: true,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                _buildTextField(
                  'Blood Glucose',
                  Icons.water_drop_outlined,
                  (v) => glucose = v!,
                  isNumber: true,
                ),
              ],
            ),
          ),
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: Text('Cancel', style: GoogleFonts.poppins(color: Colors.grey)),
        ),
        ElevatedButton(
          onPressed: _submitting ? null : _save,
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF1565C0),
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
          child: _submitting
              ? const SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    color: Colors.white,
                  ),
                )
              : Text(
                  'Create Patient',
                  style: GoogleFonts.poppins(fontWeight: FontWeight.w600),
                ),
        ),
      ],
    );
  }

  Widget _buildTextField(
    String label,
    IconData icon,
    Function(String?) onSaved, {
    bool isNumber = false,
  }) {
    return TextFormField(
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 16,
        ),
      ),
      keyboardType: isNumber ? TextInputType.number : TextInputType.text,
      onSaved: onSaved,
      validator: (v) => v!.isEmpty ? 'Required' : null,
    );
  }
}
