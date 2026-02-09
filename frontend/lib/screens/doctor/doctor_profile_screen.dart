import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../providers/auth_provider.dart';
// unused import removed

class DoctorProfileScreen extends StatefulWidget {
  const DoctorProfileScreen({super.key});

  @override
  State<DoctorProfileScreen> createState() => _DoctorProfileScreenState();
}

class _DoctorProfileScreenState extends State<DoctorProfileScreen> {
  // Removed local _profile and _loading since we use AuthProvider

  @override
  void initState() {
    super.initState();
    // Refresh user data when entering profile (optional, but good practice)
    Future.microtask(() => context.read<AuthProvider>().fetchMe());
  }

  void _logout() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text(
          'Logout',
          style: GoogleFonts.poppins(fontWeight: FontWeight.bold),
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
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.redAccent,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
            ),
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
            child: Text(
              'Logout',
              style: GoogleFonts.poppins(color: Colors.white),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final user = auth.user;

    if (auth.isLoading && user == null) {
      return Scaffold(
        body: Center(
          child:
              Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const CircularProgressIndicator(),
                      const SizedBox(height: 16),
                      Text(
                        "Loading Profile...",
                        style: GoogleFonts.poppins(color: Colors.grey),
                      ),
                    ],
                  )
                  .animate(onPlay: (c) => c.repeat())
                  .shimmer(
                    duration: 1200.ms,
                    color: Colors.blue.withOpacity(0.3),
                  ),
        ),
      );
    }

    // deleted unused variable line

    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FA),
      body: CustomScrollView(
        slivers: [
          _buildSliverAppBar(user),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children:
                    [
                          const SizedBox(height: 10),
                          _buildSectionHeader(
                            "Personal Information",
                            Icons.person_outline,
                          ),
                          const SizedBox(height: 15),
                          _buildProfileCard(user),
                          const SizedBox(height: 30),
                          _buildSectionHeader(
                            "Quick Actions",
                            Icons.flash_on_outlined,
                          ),
                          const SizedBox(height: 15),
                          _buildQuickActionsGrid(),
                          const SizedBox(height: 30),
                          _buildSectionHeader(
                            "Account Settings",
                            Icons.settings_outlined,
                          ),
                          const SizedBox(height: 15),
                          _buildSettingsList(),
                          const SizedBox(height: 40),
                          _buildLogoutButton(),
                          const SizedBox(height: 40),
                        ]
                        .animate(interval: 100.ms)
                        .fadeIn(duration: 500.ms)
                        .slideY(begin: 0.2, end: 0, curve: Curves.easeOutQuad),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSliverAppBar(Map<String, dynamic>? user) {
    return SliverAppBar(
      expandedHeight: 280.0,
      floating: false,
      pinned: true,
      stretch: true,
      backgroundColor: const Color(0xFF2196F3),
      flexibleSpace: FlexibleSpaceBar(
        stretchModes: const [
          StretchMode.zoomBackground,
          StretchMode.blurBackground,
        ],
        background: Stack(
          fit: StackFit.expand,
          children: [
            // Background Pattern/Gradient
            Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    Color(0xFF1565C0),
                    Color(0xFF2196F3),
                    Color(0xFF64B5F6),
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
            ),
            // Abstract Circles for design
            Positioned(
              top: -50,
              right: -50,
              child: Container(
                width: 200,
                height: 200,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.white.withOpacity(0.1),
                ),
              ),
            ),
            Positioned(
              bottom: -30,
              left: -30,
              child: Container(
                width: 150,
                height: 150,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.white.withOpacity(0.1),
                ),
              ),
            ),
            // Profile Content
            Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Avatar with pulsing ring
                  Container(
                        width: 110,
                        height: 110,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white, width: 3),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.2),
                              blurRadius: 15,
                              offset: const Offset(0, 5),
                            ),
                          ],
                          gradient: LinearGradient(
                            colors: [
                              Colors.white.withOpacity(0.9),
                              Colors.white,
                            ],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                        ),
                        child: Center(
                          child: Text(
                            user?['name']?[0]?.toUpperCase() ?? 'D',
                            style: GoogleFonts.poppins(
                              fontSize: 40,
                              fontWeight: FontWeight.bold,
                              color: const Color(0xFF1565C0),
                            ),
                          ),
                        ),
                      )
                      .animate(onPlay: (c) => c.repeat(reverse: true))
                      .scaleXY(
                        end: 1.05,
                        duration: 1500.ms,
                        curve: Curves.easeInOut,
                      ),

                  const SizedBox(height: 15),

                  Text(
                    user?['name'] ?? 'Doctor',
                    style: GoogleFonts.poppins(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                      shadows: [
                        Shadow(
                          color: Colors.black26,
                          offset: Offset(0, 2),
                          blurRadius: 4,
                        ),
                      ],
                    ),
                  ).animate().fadeIn(delay: 300.ms).moveY(begin: 20, end: 0),

                  const SizedBox(height: 5),

                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      'Medical Doctor',
                      style: GoogleFonts.poppins(
                        color: Colors.white.withOpacity(0.9),
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ).animate().fadeIn(delay: 500.ms).scale(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title, IconData icon) {
    return Row(
      children: [
        Icon(icon, color: const Color(0xFF1565C0), size: 24),
        const SizedBox(width: 10),
        Text(
          title,
          style: GoogleFonts.poppins(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: const Color(0xFF333333),
          ),
        ),
      ],
    );
  }

  Widget _buildProfileCard(Map<String, dynamic>? user) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 20,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        children: [
          _buildProfileItem(
            Icons.email_outlined,
            "Email",
            user?['email'] ?? "N/A",
            Colors.blue,
          ),
          const Divider(height: 1, indent: 60),
          _buildProfileItem(
            Icons.phone_outlined,
            "Phone",
            user?['mobile'] ?? "Not Provided",
            Colors.green,
          ),
          const Divider(height: 1, indent: 60),
          _buildProfileItem(
            Icons.location_on_outlined,
            "Clinic Location",
            "Main Street Hospital",
            Colors.redAccent,
          ),
        ],
      ),
    );
  }

  Widget _buildProfileItem(
    IconData icon,
    String label,
    String value,
    Color iconColor,
  ) {
    return Padding(
      padding: const EdgeInsets.all(20.0),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: iconColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: iconColor, size: 22),
          ),
          const SizedBox(width: 20),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: GoogleFonts.poppins(
                    fontSize: 12,
                    color: Colors.grey[600],
                  ),
                ),
                Text(
                  value,
                  style: GoogleFonts.poppins(
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                    color: Colors.black87,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActionsGrid() {
    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 2,
      crossAxisSpacing: 15,
      mainAxisSpacing: 15,
      childAspectRatio: 1.1,
      children: [
        _buildActionCard(
          "My Schedule",
          "Manage appointments",
          Icons.calendar_month_outlined,
          const Color(0xFF6C63FF),
          () {},
        ),
        _buildActionCard(
          "Patients",
          "View records",
          Icons.people_alt_outlined,
          const Color(0xFFFF6584),
          () {},
        ),
        _buildActionCard(
          "Analytics",
          "Performance stats",
          Icons.bar_chart_rounded,
          const Color(0xFF38B6FF),
          () {},
        ),
        _buildActionCard(
          "Notifications",
          "Check alerts",
          Icons.notifications_active_outlined,
          const Color(0xFFFFBC58),
          () {},
        ),
      ],
    );
  }

  Widget _buildActionCard(
    String title,
    String subtitle,
    IconData icon,
    Color color,
    VoidCallback onTap,
  ) {
    return Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: () {
              ScaffoldMessenger.of(
                context,
              ).showSnackBar(SnackBar(content: Text("$title coming soon!")));
            },
            borderRadius: BorderRadius.circular(20),
            child: Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: color.withOpacity(0.15),
                    blurRadius: 15,
                    offset: const Offset(0, 8),
                  ),
                ],
                border: Border.all(color: color.withOpacity(0.1)),
              ),
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: color.withOpacity(0.1),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(icon, color: color, size: 24),
                  ),
                  const Spacer(),
                  Text(
                    title,
                    style: GoogleFonts.poppins(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                      color: const Color(0xFF333333),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: GoogleFonts.poppins(
                      fontSize: 10,
                      color: Colors.grey[600],
                    ),
                  ),
                ],
              ),
            ),
          ),
        )
        .animate(onPlay: (c) => c.repeat(reverse: true))
        .shimmer(duration: 3.seconds);
  }

  Widget _buildSettingsList() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          _buildSettingsTile(Icons.lock_outline, "Privacy & Security", true),
          const Divider(height: 1),
          _buildSettingsTile(Icons.help_outline, "Help & Support", false),
          const Divider(height: 1),
          _buildSettingsTile(Icons.info_outline, "About App", false),
        ],
      ),
    );
  }

  Widget _buildSettingsTile(IconData icon, String title, bool showBadge) {
    return ListTile(
      leading: Icon(icon, color: Colors.grey[700]),
      title: Text(
        title,
        style: GoogleFonts.poppins(fontWeight: FontWeight.w500),
      ),
      trailing: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (showBadge)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(
                color: Colors.redAccent,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(
                "New",
                style: GoogleFonts.poppins(
                  color: Colors.white,
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          const SizedBox(width: 8),
          const Icon(Icons.chevron_right, color: Colors.grey),
        ],
      ),
      onTap: () {},
    );
  }

  Widget _buildLogoutButton() {
    return Container(
      width: double.infinity,
      height: 55,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(15),
        gradient: const LinearGradient(
          colors: [Color(0xFFFF512F), Color(0xFFDD2476)],
        ),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFFFF512F).withOpacity(0.3),
            blurRadius: 12,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: _logout,
          borderRadius: BorderRadius.circular(15),
          child: Center(
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.logout, color: Colors.white),
                const SizedBox(width: 10),
                Text(
                  "Logout Securely",
                  style: GoogleFonts.poppins(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
