import 'package:flutter/material.dart';
// import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../services/api_service.dart';
import 'patient_my_health_trends_screen.dart';
import 'widgets/last_visit_modal.dart';

class PatientDashboard extends StatefulWidget {
  final VoidCallback? onSeeAllVisits;
  const PatientDashboard({super.key, this.onSeeAllVisits});

  @override
  State<PatientDashboard> createState() => _PatientDashboardState();
}

class _PatientDashboardState extends State<PatientDashboard> {
  Map<String, dynamic>? _profile;
  List<dynamic> _visits = [];
  bool _loading = true;
  static bool hasShownWelcomeModal = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final p = await ApiService().dio.get('/my/profile');
      final v = await ApiService().dio.get('/my/visits');

      if (mounted) {
        setState(() {
          _profile = p.data['data'];
          _visits = v.data['data'];
          _loading = false;
        });

        // Show Last Visit Modal if not shown yet
        if (!hasShownWelcomeModal) {
          hasShownWelcomeModal = true;
          // Small delay to let UI build first
          Future.delayed(const Duration(milliseconds: 500), () {
            if (mounted) _showLastVisitModal();
          });
        }
      }
    } catch (e) {
      // Silent error or basic handling
      if (mounted) setState(() => _loading = false);
    }
  }

  void _showLastVisitModal() {
    // Find the latest visit if any
    Map<String, dynamic>? lastVisit;
    if (_visits.isNotEmpty) {
      // Assuming visits are returned in some order, but let's sort to be safe or take the first one
      // If the API returns them sorted desc, taking first is fine.
      // Let's assume standard behavior or just take the first one.
      // Ideally we sort by date descending.
      // For now, let's just take the first one from the list as "latest"
      lastVisit = _visits.first;
    }

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => LastVisitModal(
        lastVisit: lastVisit,
        onSeeAllVisits: () {
          widget.onSeeAllVisits?.call();
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: CircularProgressIndicator());

    return SingleChildScrollView(
      child: Column(
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
            padding: const EdgeInsets.fromLTRB(25, 40, 25, 50),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Welcome back,',
                            style: const TextStyle(
                              color: Colors.white70,
                              fontSize: 16,
                            ),
                          ).animate().fadeIn().moveX(begin: -20),
                          Text(
                            (_profile?['name'] ?? 'Patient') + '!',
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 26,
                            ),
                            overflow: TextOverflow.ellipsis,
                            maxLines: 1,
                          ).animate().fadeIn(delay: 200.ms).moveX(begin: -20),
                        ],
                      ),
                    ),
                    const Spacer(),
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(
                        Icons.notifications_outlined,
                        color: Colors.white,
                      ),
                    ).animate().scale(delay: 400.ms, curve: Curves.easeOutBack),
                  ],
                ),
              ],
            ),
          ),

          Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Patient ID Card
                Container(
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [
                        Color(0xFF66BB6A), // Light Green
                        Color(0xFF43A047),
                      ],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(24),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF4CAF50).withOpacity(0.3),
                        blurRadius: 15,
                        offset: const Offset(0, 8),
                      ),
                    ],
                  ),
                  padding: const EdgeInsets.all(24),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.25),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: const Icon(
                          Icons.badge_outlined,
                          color: Colors.white,
                          size: 32,
                        ),
                      ),
                      const SizedBox(width: 20),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Patient ID',
                              style: const TextStyle(
                                color: Colors.white70,
                                fontSize: 13,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              _profile!['patientId'] ?? 'N/A',
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 18,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ).animate().fadeIn(delay: 200.ms).slideY(begin: 0.2),

                const SizedBox(height: 20),

                // Stats Grid
                Row(
                  children: [
                    Expanded(
                      child: _StatCard(
                        title: 'Visits',
                        value: '${_visits.length}',
                        icon: Icons.calendar_month_outlined,
                        color: Colors.blueAccent,
                        delay: 300,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: _StatCard(
                        title: 'Health Score',
                        value: 'Good', // Placeholder
                        icon: Icons.health_and_safety_outlined,
                        color: Colors.orangeAccent,
                        delay: 400,
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 24),

                // Health Status Card
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(24),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.grey.withOpacity(0.08),
                        blurRadius: 20,
                        offset: const Offset(0, 5),
                      ),
                    ],
                    border: Border.all(color: Colors.grey.shade100),
                  ),
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: Colors.green.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: const Icon(
                              Icons.favorite_outline,
                              color: Colors.green,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Text(
                            'Health Overview',
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: Colors.black87,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),
                      _HealthInfoRow(
                        label: 'Gender',
                        value: _profile!['gender'] ?? 'N/A',
                        icon: Icons.wc,
                      ),
                      const SizedBox(height: 16), // Increased spacing
                      _HealthInfoRow(
                        label: 'Hypertension',
                        value: _profile!['hypertension'] == true ? 'Yes' : 'No',
                        icon: Icons.bloodtype_outlined,
                        valueColor: _profile!['hypertension'] == true
                            ? Colors.red
                            : Colors.green,
                      ),
                      const SizedBox(height: 16),
                      _HealthInfoRow(
                        label: 'Heart Disease',
                        value: _profile!['heartDisease'] == true ? 'Yes' : 'No',
                        icon: Icons.monitor_heart_outlined,
                        valueColor: _profile!['heartDisease'] == true
                            ? Colors.red
                            : Colors.green,
                      ),
                    ],
                  ),
                ).animate().fadeIn(delay: 500.ms).slideY(begin: 0.1),

                const SizedBox(height: 30),

                // View Health Trends Button
                Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF43A047).withOpacity(0.3),
                        blurRadius: 12,
                        offset: const Offset(0, 5),
                      ),
                    ],
                  ),
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => const PatientMyHealthTrendsScreen(),
                        ),
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF43A047),
                      foregroundColor: Colors.white,
                      minimumSize: const Size(double.infinity, 56),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                      elevation: 0,
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.show_chart_rounded),
                        const SizedBox(width: 10),
                        Text(
                          'View My Health Trends',
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                ).animate().scale(
                  delay: 600.ms,
                  begin: const Offset(0.95, 0.95),
                ),
                const SizedBox(
                  height: 120,
                ), // Padding to clear the navigation bar
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final Color color;
  final int delay;

  const _StatCard({
    required this.title,
    required this.value,
    required this.icon,
    required this.color,
    this.delay = 0,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: color.withOpacity(0.1),
            blurRadius: 15,
            offset: const Offset(0, 5),
          ),
        ],
        border: Border.all(color: color.withOpacity(0.1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: color, size: 24),
          ),
          const SizedBox(height: 16),
          Text(
            value,
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: Color(0xFF333333),
            ),
          ),
          Text(title, style: TextStyle(fontSize: 13, color: Colors.grey[600])),
        ],
      ),
    ).animate().fadeIn(delay: delay.ms).slideX(begin: 0.2);
  }
}

class _HealthInfoRow extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color? valueColor;

  const _HealthInfoRow({
    required this.label,
    required this.value,
    required this.icon,
    this.valueColor,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: Colors.grey[50],
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: Colors.grey[600], size: 18),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            label,
            style: TextStyle(fontSize: 14, color: Colors.grey[700]),
            overflow: TextOverflow.ellipsis,
          ),
        ),
        const SizedBox(width: 8),
        Text(
          value,
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: valueColor ?? const Color(0xFF333333),
          ),
          overflow: TextOverflow.ellipsis,
        ),
      ],
    );
  }
}
