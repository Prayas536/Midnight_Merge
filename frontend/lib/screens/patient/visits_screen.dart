import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../services/api_service.dart';
import 'visit_analysis_screen.dart';

class VisitsScreen extends StatefulWidget {
  const VisitsScreen({super.key});
  @override
  State<VisitsScreen> createState() => _VisitsScreenState();
}

class _VisitsScreenState extends State<VisitsScreen> {
  List<dynamic>? visits;
  bool loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final res = await ApiService().dio.get('/my/visits');
      if (mounted)
        setState(() {
          visits = res.data['data'];
          loading = false;
        });
    } catch (e) {
      if (mounted) setState(() => loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (loading) return const Center(child: CircularProgressIndicator());

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
                      Icons.history_edu_rounded,
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
                          'My Visits',
                          style: GoogleFonts.poppins(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ).animate().fadeIn().moveX(begin: -20),
                        Text(
                          'View your medical visit history',
                          style: GoogleFonts.poppins(
                            color: Colors.white70,
                            fontSize: 14,
                          ),
                        ).animate().fadeIn(delay: 200.ms).moveX(begin: -20),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              // AI Analysis Card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.white.withOpacity(0.2)),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: const BoxDecoration(
                        color: Colors.white,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.auto_awesome,
                        color: Color(0xFF2E7D32),
                        size: 20,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'AI Health Analysis',
                            style: GoogleFonts.poppins(
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                              fontSize: 14,
                            ),
                          ),
                          Text(
                            'Get personalized insights from your history',
                            style: GoogleFonts.poppins(
                              color: Colors.white70,
                              fontSize: 11,
                            ),
                          ),
                        ],
                      ),
                    ),
                    ElevatedButton(
                      onPressed: () {
                        if (visits == null || visits!.isEmpty) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text('No visits to analyze yet.'),
                            ),
                          );
                          return;
                        }

                        // Get patient name safely
                        String name = 'Patient';
                        try {
                          final auth = Provider.of<AuthProvider>(
                            context,
                            listen: false,
                          );
                          name = auth.user?['name'] ?? 'Patient';
                        } catch (e) {
                          // fallback
                        }

                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => VisitAnalysisScreen(
                              visits: visits!,
                              patientName: name,
                            ),
                          ),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: const Color(0xFF2E7D32),
                        elevation: 0,
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 8,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                      child: Text(
                        'Analyze',
                        style: GoogleFonts.poppins(
                          fontWeight: FontWeight.w600,
                          fontSize: 12,
                        ),
                      ),
                    ),
                  ],
                ),
              ).animate().fadeIn(delay: 300.ms).slideY(begin: 0.2),
            ],
          ),
        ),

        // Visits list
        Expanded(
          child: visits == null || visits!.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.folder_open_rounded,
                        size: 64,
                        color: Colors.grey[300],
                      ),
                      const SizedBox(height: 16),
                      Text(
                        "No visits found",
                        style: GoogleFonts.poppins(
                          color: Colors.grey[500],
                          fontSize: 16,
                        ),
                      ),
                    ],
                  ).animate().fadeIn(),
                )
              : ListView.builder(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 12,
                  ),
                  itemCount: visits!.length,
                  itemBuilder: (ctx, i) {
                    final v = visits![i];
                    final riskLabel = v['prediction']?['riskLabel'] ?? 'N/A';
                    final riskColor = _getRiskColor(riskLabel);

                    return Container(
                      margin: const EdgeInsets.only(bottom: 16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.blueGrey.withOpacity(0.08),
                            blurRadius: 15,
                            offset: const Offset(0, 5),
                          ),
                        ],
                      ),
                      child: Theme(
                        data: Theme.of(
                          context,
                        ).copyWith(dividerColor: Colors.transparent),
                        child: ExpansionTile(
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                            side: BorderSide.none,
                          ),
                          collapsedShape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                            side: BorderSide.none,
                          ),
                          backgroundColor: Colors.transparent,
                          collapsedBackgroundColor: Colors.transparent,
                          tilePadding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 8,
                          ),
                          title: Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(10),
                                decoration: BoxDecoration(
                                  color: riskColor.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Icon(
                                  Icons.calendar_today_rounded,
                                  color: riskColor,
                                  size: 20,
                                ),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      v['visitDate'].toString().split('T')[0],
                                      style: GoogleFonts.poppins(
                                        fontWeight: FontWeight.bold,
                                        fontSize: 16,
                                        color: Colors.black87,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 8,
                                        vertical: 2,
                                      ),
                                      decoration: BoxDecoration(
                                        color: riskColor.withOpacity(0.1),
                                        borderRadius: BorderRadius.circular(6),
                                        border: Border.all(
                                          color: riskColor.withOpacity(0.2),
                                        ),
                                      ),
                                      child: Text(
                                        riskLabel,
                                        style: GoogleFonts.poppins(
                                          fontSize: 11,
                                          fontWeight: FontWeight.w600,
                                          color: riskColor,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          children: [
                            Padding(
                              padding: const EdgeInsets.fromLTRB(16, 0, 16, 20),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Divider(color: Colors.grey[100]),
                                  const SizedBox(height: 12),
                                  Text(
                                    'Health Metrics',
                                    style: GoogleFonts.poppins(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 14,
                                      color: Colors.grey[800],
                                    ),
                                  ),
                                  const SizedBox(height: 12),
                                  _buildMetricItem(
                                    'HbA1c',
                                    v['metrics']['HbA1cLevel'],
                                    '%',
                                    const Color(0xFFFF9800),
                                  ),
                                  const SizedBox(height: 8),
                                  _buildMetricItem(
                                    'Glucose',
                                    v['metrics']['bloodGlucoseLevel'],
                                    'mg/dL',
                                    const Color(0xFF4CAF50),
                                  ),
                                  const SizedBox(height: 8),
                                  _buildMetricItem(
                                    'BMI',
                                    v['metrics']['bmi'],
                                    'kg/m²',
                                    const Color(0xFF9C27B0),
                                  ),
                                  const SizedBox(height: 16),

                                  Text(
                                    'Doctor Notes',
                                    style: GoogleFonts.poppins(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 14,
                                      color: Colors.grey[800],
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  Container(
                                    width: double.infinity,
                                    padding: const EdgeInsets.all(12),
                                    decoration: BoxDecoration(
                                      color: Colors.grey[50],
                                      borderRadius: BorderRadius.circular(12),
                                      border: Border.all(
                                        color: Colors.grey[200]!,
                                      ),
                                    ),
                                    child: Text(
                                      v['notes'] ?? 'No notes provided.',
                                      style: GoogleFonts.poppins(
                                        color: Colors.grey[700],
                                        height: 1.5,
                                        fontSize: 13,
                                      ),
                                    ),
                                  ),

                                  const SizedBox(height: 16),
                                  Text(
                                    'Recommendations',
                                    style: GoogleFonts.poppins(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 14,
                                      color: Colors.grey[800],
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  Container(
                                    width: double.infinity,
                                    padding: const EdgeInsets.all(12),
                                    decoration: BoxDecoration(
                                      color: const Color(
                                        0xFF4CAF50,
                                      ).withOpacity(0.08),
                                      borderRadius: BorderRadius.circular(12),
                                      border: Border.all(
                                        color: const Color(
                                          0xFF4CAF50,
                                        ).withOpacity(0.2),
                                      ),
                                    ),
                                    child: Text(
                                      v['recommendations'] ??
                                          'No recommendations.',
                                      style: GoogleFonts.poppins(
                                        color: Colors.green[900],
                                        height: 1.5,
                                        fontSize: 13,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ).animate(delay: (i * 100).ms).fadeIn().slideX(begin: 0.1);
                  },
                ),
        ),
        const SizedBox(height: 120), // Padding to clear the navigation bar
      ],
    );
  }

  Color _getRiskColor(String riskLabel) {
    if (riskLabel == 'High Risk') return Colors.red;
    if (riskLabel == 'Medium Risk') return Colors.orange;
    return Colors.green;
  }

  Widget _buildMetricItem(
    String label,
    dynamic value,
    String unit,
    Color color,
  ) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: color.withOpacity(0.05),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: GoogleFonts.poppins(
              color: Colors.grey[600],
              fontWeight: FontWeight.w500,
              fontSize: 13,
            ),
          ),
          Text(
            '${value?.toString() ?? '-'} $unit',
            style: GoogleFonts.robotoMono(
              fontWeight: FontWeight.bold,
              fontSize: 14,
              color: color,
            ),
          ),
        ],
      ),
    );
  }
}
