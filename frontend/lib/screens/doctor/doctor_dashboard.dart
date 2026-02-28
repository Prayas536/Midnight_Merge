import 'package:flutter/material.dart';
// import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import '../../services/api_service.dart';
import '../../providers/auth_provider.dart';
import 'patients_screen.dart';

class DoctorDashboard extends StatefulWidget {
  const DoctorDashboard({super.key});
  @override
  State<DoctorDashboard> createState() => _DoctorDashboardState();
}

class _DoctorDashboardState extends State<DoctorDashboard> {
  // Number of total patients to display on the dashboard
  int _patientCount = 0;
  // Indicates if the initial data is still loading
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    // Fetch dashboard statistics when screen initializes
    _loadStats();
  }

  // Fetches patient count from the backend API
  Future<void> _loadStats() async {
    try {
      final res = await ApiService().dio.get('/patients');
      if (mounted) {
        setState(() {
          _patientCount = (res.data['data'] as List).length;
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final doctorName = authProvider.user?['name'] ?? 'Doctor';

    if (_loading) {
      return const Center(child: CircularProgressIndicator());
    }

    return Container(
      color: const Color(0xFFF5F7FA),
      child: CustomScrollView(
        slivers: [
          SliverToBoxAdapter(
            child: Column(
              children: [
                // Header with gradient
                Container(
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      colors: [Color(0xFF1565C0), Color(0xFF2196F3)],
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
                  padding: const EdgeInsets.fromLTRB(20, 60, 20, 40),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
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
                                      '$doctorName! 👋',
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontWeight: FontWeight.bold,
                                        fontSize: 26,
                                      ),
                                      overflow: TextOverflow.ellipsis,
                                      maxLines: 1,
                                    )
                                    .animate()
                                    .fadeIn(delay: 200.ms)
                                    .moveX(begin: -20),
                              ],
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Icon(
                              Icons.notifications_none_rounded,
                              color: Colors.white,
                              size: 26,
                            ),
                          ).animate().scale(
                            delay: 400.ms,
                            curve: Curves.easeOutBack,
                          ),
                        ],
                      ),
                      const SizedBox(height: 30),
                      // Patient Count Card
                      Container(
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(24),
                          border: Border.all(
                            color: Colors.white.withOpacity(0.2),
                          ),
                        ),
                        padding: const EdgeInsets.all(25),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(16),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withOpacity(0.1),
                                    blurRadius: 10,
                                    offset: const Offset(0, 4),
                                  ),
                                ],
                              ),
                              child: const Icon(
                                Icons.people_alt_rounded,
                                color: Color(0xFF1565C0),
                                size: 32,
                              ),
                            ),
                            const SizedBox(width: 20),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Total Patients',
                                  style: const TextStyle(
                                    color: Colors.white70,
                                    fontSize: 14,
                                  ),
                                ),
                                Text(
                                  '$_patientCount',
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 36,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ).animate().fadeIn(delay: 400.ms).slideY(begin: 0.2),
                    ],
                  ),
                ),

                Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    children: [
                      // Quick Stats
                      Row(
                        children: [
                          Expanded(
                            child: _StatCard(
                              icon: Icons.person_add_alt_1_rounded,
                              label: 'New Patient',
                              color: const Color(0xFF43A047),
                              onTap: () {
                                // Dialog to add a new patient without leaving the dashboard
                                showDialog(
                                  context: context,
                                  barrierDismissible: false,
                                  builder: (ctx) => const AddPatientDialog(),
                                ).then((val) {
                                  // Refresh stats if the dialog returns true (patient added)
                                  if (val == true) _loadStats();
                                });
                              },
                            ),
                          ),
                          const SizedBox(width: 15),
                          Expanded(
                            child: _StatCard(
                              icon: Icons.analytics_rounded,
                              label: 'Analytics',
                              color: const Color(0xFFFF9800),
                              onTap: () {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text(
                                      'Analytics feature coming soon!',
                                      style: const TextStyle(),
                                    ),
                                  ),
                                );
                              },
                            ),
                          ),
                        ],
                      ).animate().fadeIn(delay: 600.ms).slideY(begin: 0.2),

                      const SizedBox(height: 25),

                      // Workflow Card
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
                        ),
                        padding: const EdgeInsets.all(24),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(10),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFE3F2FD),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: const Icon(
                                    Icons.tips_and_updates_rounded,
                                    color: Color(0xFF1565C0),
                                    size: 24,
                                  ),
                                ),
                                const SizedBox(width: 15),
                                Text(
                                  'Quick Workflow',
                                  style: const TextStyle(
                                    fontWeight: FontWeight.w600,
                                    fontSize: 18,
                                    color: Color(0xFF333333),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 24),
                            _WorkflowStep(
                              number: 1,
                              title: 'Create a patient profile',
                              subtitle: 'Add personal details in "My Patients"',
                              icon: Icons.person_add_rounded,
                              color: Colors.blue,
                            ),
                            const SizedBox(height: 20),
                            _WorkflowStep(
                              number: 2,
                              title: 'Share Credentials',
                              subtitle: 'Give ID & Password to patient',
                              icon: Icons.vpn_key_rounded,
                              color: Colors.purple,
                            ),
                            const SizedBox(height: 20),
                            _WorkflowStep(
                              number: 3,
                              title: 'Record Vitals',
                              subtitle: 'Add visits & view trends',
                              icon: Icons.monitor_heart_rounded,
                              color: Colors.red,
                            ),
                            const SizedBox(height: 20),
                            _WorkflowStep(
                              number: 4,
                              title: 'Predict Risk',
                              subtitle: 'Use ML for risk analysis',
                              icon: Icons.auto_graph_rounded,
                              color: Colors.orange,
                            ),
                          ],
                        ),
                      ).animate().fadeIn(delay: 800.ms).slideY(begin: 0.2),

                      const SizedBox(
                        height: 120,
                      ), // Space for scrolling under nav bar
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _StatCard({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(20),
        child: Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(
                color: color.withOpacity(0.15),
                blurRadius: 15,
                offset: const Offset(0, 5),
              ),
            ],
            border: Border.all(color: color.withOpacity(0.1)),
          ),
          padding: const EdgeInsets.all(20),
          child: Column(
            children: [
              Container(
                padding: const EdgeInsets.all(15),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(icon, color: color, size: 30),
              ),
              const SizedBox(height: 15),
              Text(
                label,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  color: Color(0xFF333333),
                  fontWeight: FontWeight.w600,
                  fontSize: 14,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _WorkflowStep extends StatelessWidget {
  final int number;
  final String title;
  final String subtitle;
  final IconData icon;
  final Color color;

  const _WorkflowStep({
    required this.number,
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 50,
          height: 50,
          decoration: BoxDecoration(
            color: color.withOpacity(0.1),
            borderRadius: BorderRadius.circular(15),
          ),
          child: Center(
            child: Text(
              '$number',
              style: TextStyle(
                color: color,
                fontWeight: FontWeight.bold,
                fontSize: 20,
              ),
            ),
          ),
        ),
        const SizedBox(width: 15),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF333333),
                ),
              ),
              Text(
                subtitle,
                style: TextStyle(fontSize: 12, color: Colors.grey[600]),
              ),
            ],
          ),
        ),
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: Colors.grey[100],
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, color: Colors.grey[500], size: 18),
        ),
      ],
    );
  }
}
