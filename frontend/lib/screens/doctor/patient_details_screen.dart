import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../services/api_service.dart';
import 'add_visit_screen.dart';
import 'patient_health_trends_screen.dart';

class PatientDetailsScreen extends StatefulWidget {
  final String patientId;
  const PatientDetailsScreen({super.key, required this.patientId});
  @override
  State<PatientDetailsScreen> createState() => _PatientDetailsScreenState();
}

class _PatientDetailsScreenState extends State<PatientDetailsScreen> {
  Map<String, dynamic>? _patient;
  List<dynamic> _visits = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final pRes = await ApiService().dio.get('/patients/${widget.patientId}');
      final vRes = await ApiService().dio.get(
        '/patients/${widget.patientId}/visits',
      );
      if (mounted) {
        setState(() {
          _patient = pRes.data['data'];
          _visits = vRes.data['data'];
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) Navigator.pop(context);
    }
  }

  Future<void> _deletePatient() async {
    // Show confirmation dialog
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(
          'Delete Patient',
          style: GoogleFonts.poppins(fontWeight: FontWeight.bold),
        ),
        content: Text(
          'Are you sure you want to delete this patient? This action cannot be undone.',
          style: GoogleFonts.poppins(),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: Text('Cancel', style: GoogleFonts.poppins()),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: Text(
              'Delete',
              style: GoogleFonts.poppins(color: Colors.red),
            ),
          ),
        ],
      ),
    );

    if (confirm != true) return;

    try {
      await ApiService().dio.delete('/patients/${widget.patientId}');
      if (mounted) Navigator.pop(context);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('Delete failed')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return Scaffold(
        appBar: AppBar(title: const Text('Loading...')),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FA),
      appBar: AppBar(
        title: Text(
          _patient!['name'],
          style: GoogleFonts.poppins(
            color: Colors.white,
            fontWeight: FontWeight.bold,
          ),
        ),
        backgroundColor: const Color(0xFF1565C0),
        iconTheme: const IconThemeData(color: Colors.white),
        actions: [
          IconButton(
            icon: const Icon(Icons.delete_outline, color: Colors.white),
            onPressed: _deletePatient,
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => AddVisitScreen(patientId: widget.patientId),
          ),
        ).then((_) => _loadData()),
        label: Text(
          'Add Visit',
          style: GoogleFonts.poppins(fontWeight: FontWeight.bold),
        ),
        icon: const Icon(Icons.add_rounded),
        backgroundColor: const Color(0xFF1565C0),
      ).animate().scale(delay: 500.ms),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Patient Info Card
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 15,
                    offset: const Offset(0, 5),
                  ),
                ],
              ),
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: const Color(0xFFE3F2FD),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.person,
                          color: Color(0xFF1565C0),
                          size: 32,
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _patient!['name'],
                              style: GoogleFonts.poppins(
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                                color: Colors.black87,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                            Text(
                              "ID: ${_patient!['patientId']}",
                              style: GoogleFonts.poppins(
                                fontSize: 12,
                                color: Colors.grey[500],
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 20),
                    child: Divider(height: 1),
                  ),
                  Wrap(
                    spacing: 30,
                    runSpacing: 20,
                    children: [
                      _infoChip('Gender', _patient!['gender'], Icons.wc),
                      _infoChip(
                        'Hypertension',
                        _patient!['hypertension'] ? 'Yes' : 'No',
                        Icons.favorite_border,
                      ),
                      _infoChip(
                        'Heart Disease',
                        _patient!['heartDisease'] ? 'Yes' : 'No',
                        Icons.monitor_heart_outlined,
                      ),
                      _infoChip(
                        'Smoking',
                        _patient!['smokingHistory'],
                        Icons.smoke_free,
                      ),
                    ],
                  ),
                ],
              ),
            ).animate().fadeIn().slideY(begin: 0.2),

            const SizedBox(height: 24),

            // View Trends Button
            ElevatedButton.icon(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) =>
                        PatientHealthTrendsScreen(patientId: widget.patientId),
                  ),
                );
              },
              icon: const Icon(Icons.trending_up_rounded),
              label: Text(
                'View Health Trends',
                style: GoogleFonts.poppins(fontWeight: FontWeight.bold),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF2196F3),
                foregroundColor: Colors.white,
                minimumSize: const Size(double.infinity, 56),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
                elevation: 4,
                shadowColor: Colors.blue.withOpacity(0.4),
              ),
            ).animate().fadeIn(delay: 200.ms).slideY(begin: 0.2),

            const SizedBox(height: 32),

            Text(
              "Visits History",
              style: GoogleFonts.poppins(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Colors.black87,
              ),
            ).animate().fadeIn(delay: 300.ms),

            const SizedBox(height: 16),

            if (_visits.isEmpty)
              Center(
                child: Padding(
                  padding: const EdgeInsets.all(40.0),
                  child: Column(
                    children: [
                      Icon(
                        Icons.history_toggle_off_outlined,
                        size: 48,
                        color: Colors.grey[300],
                      ),
                      const SizedBox(height: 16),
                      Text(
                        "No visits recorded yet.",
                        style: GoogleFonts.poppins(color: Colors.grey[500]),
                      ),
                    ],
                  ),
                ),
              ).animate().fadeIn(delay: 400.ms),

            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _visits.length,
              separatorBuilder: (ctx, i) => const SizedBox(height: 12),
              itemBuilder: (ctx, i) {
                final v = _visits[i];
                final risk = v['prediction']?['riskLabel'];
                return Card(
                  elevation: 0,
                  color: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                    side: BorderSide(color: Colors.grey.withOpacity(0.1)),
                  ),
                  child: Theme(
                    data: Theme.of(
                      context,
                    ).copyWith(dividerColor: Colors.transparent),
                    child: ExpansionTile(
                      leading: Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: const Color(0xFFE3F2FD),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(
                          Icons.calendar_today_rounded,
                          color: Color(0xFF1565C0),
                          size: 20,
                        ),
                      ),
                      title: Text(
                        v['visitDate'].toString().split('T')[0],
                        style: GoogleFonts.poppins(fontWeight: FontWeight.w600),
                      ),
                      subtitle: risk != null
                          ? Text(
                              "Risk: $risk",
                              style: GoogleFonts.poppins(
                                color: risk == 'High Risk'
                                    ? Colors.red
                                    : Colors.green,
                                fontWeight: FontWeight.w600,
                                fontSize: 13,
                              ),
                            )
                          : Text(
                              "No Prediction",
                              style: GoogleFonts.poppins(
                                color: Colors.grey,
                                fontSize: 13,
                              ),
                            ),
                      children: [
                        Padding(
                          padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Divider(),
                              const SizedBox(height: 8),
                              _visitDetailRow(
                                Icons.bloodtype,
                                "HbA1c",
                                "${v['metrics']?['HbA1cLevel'] ?? '-'}%",
                              ),
                              const SizedBox(height: 8),
                              _visitDetailRow(
                                Icons.water_drop,
                                "Glucose",
                                "${v['metrics']?['bloodGlucoseLevel'] ?? '-'} mg/dL",
                              ),
                              const SizedBox(height: 8),
                              _visitDetailRow(
                                Icons.speed,
                                "BMI",
                                "${v['metrics']?['bmi'] ?? '-'}",
                              ),
                              const SizedBox(height: 16),
                              if (v['notes'] != null && v['notes'].isNotEmpty)
                                Container(
                                  width: double.infinity,
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: Colors.grey[50],
                                    borderRadius: BorderRadius.circular(10),
                                    border: Border.all(
                                      color: Colors.grey[200]!,
                                    ),
                                  ),
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        "Notes",
                                        style: GoogleFonts.poppins(
                                          fontSize: 12,
                                          fontWeight: FontWeight.bold,
                                          color: Colors.grey[600],
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        v['notes'],
                                        style: GoogleFonts.poppins(
                                          fontSize: 13,
                                          fontStyle: FontStyle.italic,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ).animate().fadeIn(delay: (400 + i * 100).ms).slideX(begin: -0.05);
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _infoChip(String label, String value, IconData icon) {
    return SizedBox(
      width: 100, // Fixed width for proper alignment
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 14, color: Colors.grey[400]),
              const SizedBox(width: 4),
              Expanded(
                child: Text(
                  label,
                  style: GoogleFonts.poppins(
                    fontSize: 11,
                    color: Colors.grey[500],
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: GoogleFonts.poppins(
              fontWeight: FontWeight.w600,
              fontSize: 14,
              color: Colors.black87,
            ),
          ),
        ],
      ),
    );
  }

  Widget _visitDetailRow(IconData icon, String label, String value) {
    return Row(
      children: [
        Icon(icon, size: 16, color: Colors.grey[400]),
        const SizedBox(width: 8),
        Text(
          label,
          style: GoogleFonts.poppins(fontSize: 13, color: Colors.grey[600]),
        ),
        const Spacer(),
        Text(
          value,
          style: GoogleFonts.robotoMono(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: Colors.black87,
          ),
        ),
      ],
    );
  }
}
