import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../services/api_service.dart';

class PatientSettingsScreen extends StatefulWidget {
  const PatientSettingsScreen({super.key});

  @override
  State<PatientSettingsScreen> createState() => _PatientSettingsScreenState();
}

class _PatientSettingsScreenState extends State<PatientSettingsScreen> {
  Map<String, dynamic>? _profile;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    try {
      final res = await ApiService().dio.get('/my/profile');
      if (mounted) {
        setState(() {
          _profile = res.data['data'];
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _logout() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            const Icon(Icons.logout, color: Colors.red),
            const SizedBox(width: 10),
            Text(
              'Logout',
              style: GoogleFonts.poppins(fontWeight: FontWeight.bold),
            ),
          ],
        ),
        content: Text(
          'Are you sure you want to logout?',
          style: GoogleFonts.poppins(),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text(
              'Cancel',
              style: GoogleFonts.poppins(color: Colors.grey),
            ),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(ctx);
              await context.read<AuthProvider>().logout();
              if (mounted) {
                Navigator.pushNamedAndRemoveUntil(
                  context,
                  '/login',
                  (route) => false,
                );
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
            ),
            child: Text('Logout', style: GoogleFonts.poppins()),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Center(child: CircularProgressIndicator());
    }

    return Column(
      children: [
        // Header
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
          padding: const EdgeInsets.fromLTRB(20, 20, 20, 40),
          width: double.infinity,
          child: Column(
            children: [
              const SizedBox(height: 10),
              Container(
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white, width: 3),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.2),
                      blurRadius: 10,
                      offset: const Offset(0, 5),
                    ),
                  ],
                ),
                child: CircleAvatar(
                  radius: 50,
                  backgroundColor: Colors.green.shade100,
                  child: Text(
                    _profile?['name']?[0]?.toUpperCase() ?? 'P',
                    style: GoogleFonts.poppins(
                      fontSize: 40,
                      fontWeight: FontWeight.bold,
                      color: Colors.green[800],
                    ),
                  ),
                ),
              ).animate().scale(duration: 500.ms, curve: Curves.easeOutBack),
              const SizedBox(height: 16),
              Text(
                _profile?['name'] ?? 'Patient',
                style: GoogleFonts.poppins(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ).animate().fadeIn(delay: 200.ms).slideY(begin: 0.2),
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 6,
                ),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  'ID: ${_profile?['patientId'] ?? 'N/A'}',
                  style: GoogleFonts.robotoMono(
                    fontSize: 14,
                    color: Colors.white,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ).animate().fadeIn(delay: 400.ms).slideY(begin: 0.2),
            ],
          ),
        ),

        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Profile Information
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.grey.withOpacity(0.1),
                        blurRadius: 10,
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
                          Icon(
                            Icons.person_outline_rounded,
                            color: Colors.green[700],
                          ),
                          const SizedBox(width: 10),
                          Text(
                            'Profile Information',
                            style: GoogleFonts.poppins(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: Colors.black87,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),
                      _infoRow('Name', _profile?['name'] ?? 'N/A'),
                      const Divider(height: 24),
                      _infoRow('Gender', _profile?['gender'] ?? 'N/A'),
                      const Divider(height: 24),
                      _infoRow(
                        'Date of Birth',
                        _profile?['dob']?.toString().split('T')[0] ?? 'N/A',
                      ),
                      const Divider(height: 24),
                      _infoRow(
                        'Hypertension',
                        _profile?['hypertension'] == true ? 'Yes' : 'No',
                        valueColor: _profile?['hypertension'] == true
                            ? Colors.red
                            : Colors.green,
                      ),
                      const Divider(height: 24),
                      _infoRow(
                        'Heart Disease',
                        _profile?['heartDisease'] == true ? 'Yes' : 'No',
                        valueColor: _profile?['heartDisease'] == true
                            ? Colors.red
                            : Colors.green,
                      ),
                      const Divider(height: 24),
                      _infoRow(
                        'Smoking History',
                        _profile?['smokingHistory'] ?? 'N/A',
                      ),
                    ],
                  ),
                ).animate().fadeIn(delay: 500.ms).slideX(begin: 0.1),

                const SizedBox(height: 24),

                // Action Buttons
                _buildActionButton(
                  icon: Icons.settings_outlined,
                  label: 'Preferences',
                  onTap: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(
                          'Settings page coming soon',
                          style: GoogleFonts.poppins(),
                        ),
                      ),
                    );
                  },
                  delay: 600,
                ),
                const SizedBox(height: 12),
                _buildActionButton(
                  icon: Icons.help_outline_rounded,
                  label: 'Help & Support',
                  onTap: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(
                          'Help & Support coming soon',
                          style: GoogleFonts.poppins(),
                        ),
                      ),
                    );
                  },
                  delay: 700,
                ),
                const SizedBox(height: 24),

                // Logout Button
                ElevatedButton.icon(
                  onPressed: _logout,
                  icon: const Icon(Icons.logout_rounded),
                  label: const Text('Logout'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.red[50], // Light red background
                    foregroundColor: Colors.red,
                    elevation: 0,
                    minimumSize: const Size(double.infinity, 56),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                      side: BorderSide(color: Colors.red.withOpacity(0.2)),
                    ),
                  ),
                ).animate().fadeIn(delay: 800.ms).slideY(begin: 0.2),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _infoRow(String label, String value, {Color? valueColor}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: GoogleFonts.poppins(color: Colors.grey[600], fontSize: 14),
        ),
        Text(
          value,
          style: GoogleFonts.poppins(
            fontWeight: FontWeight.w600,
            fontSize: 15,
            color: valueColor ?? Colors.black87,
          ),
        ),
      ],
    );
  }

  Widget _buildActionButton({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
    int delay = 0,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.08),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: ListTile(
        onTap: onTap,
        leading: Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: Colors.green.withOpacity(0.1),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: Colors.green[700], size: 22),
        ),
        title: Text(
          label,
          style: GoogleFonts.poppins(fontWeight: FontWeight.w500),
        ),
        trailing: Icon(
          Icons.arrow_forward_ios_rounded,
          size: 16,
          color: Colors.grey[400],
        ),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      ),
    ).animate().fadeIn(delay: delay.ms).slideX(begin: 0.1);
  }
}
