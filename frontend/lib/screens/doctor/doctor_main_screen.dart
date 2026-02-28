import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'doctor_dashboard.dart';
import 'patients_screen.dart';
import 'predict_screen.dart';
import 'doctor_profile_screen.dart';

class DoctorMainScreen extends StatefulWidget {
  const DoctorMainScreen({super.key});

  @override
  State<DoctorMainScreen> createState() => _DoctorMainScreenState();
}

class _DoctorMainScreenState extends State<DoctorMainScreen> {
  // Tracks the currently active tab in the bottom navigation bar
  int _selectedIndex = 0;

  // List of screens corresponding to each navigation tab
  late final List<Widget> _screens = [
    const DoctorDashboard(),
    const PatientsScreen(),
    const PredictScreen(),
    const DoctorProfileScreen(),
  ];

  // Updates the state to switch the active navigation tab
  void _onNavBarTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBody: true, // Ensures content scrolls behind the floating nav bar
      body: _screens[_selectedIndex],
      bottomNavigationBar: Container(
        margin: const EdgeInsets.only(left: 16, right: 16, bottom: 16),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(30),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(
                0.15,
              ), // Dark shadow that pops vs white
              blurRadius: 25,
              offset: const Offset(0, 15),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(30),
          child: BackdropFilter(
            // Increased sigma for a much stronger blur effect
            filter: ImageFilter.blur(sigmaX: 15, sigmaY: 15),
            child: Container(
              height: 65, // Slightly taller to accommodate the text
              decoration: BoxDecoration(
                // Off-white with some transparency to show blur
                color: Colors.white.withOpacity(0.85),
                borderRadius: BorderRadius.circular(30),
                border: Border.all(
                  color: Colors.grey.withOpacity(0.2), // Light border
                  width: 1.5,
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  _buildNavItem(
                    0,
                    Icons.dashboard_outlined,
                    Icons.dashboard,
                    'Dashboard',
                    Colors.blue[700]!,
                  ),
                  _buildNavItem(
                    1,
                    Icons.people_outline,
                    Icons.people,
                    'Patients',
                    Colors.orange[700]!,
                  ),
                  _buildNavItem(
                    2,
                    Icons.analytics_outlined,
                    Icons.analytics,
                    'Predict',
                    Colors.purple[700]!,
                  ),
                  _buildNavItem(
                    3,
                    Icons.person_outline,
                    Icons.person,
                    'Profile',
                    Colors.green[700]!,
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(
    int index,
    IconData icon,
    IconData activeIcon,
    String label,
    Color activeColor,
  ) {
    final isSelected = _selectedIndex == index;
    // Use the active color when selected, otherwise dark black
    final color = isSelected ? activeColor : Colors.black87;

    return GestureDetector(
      onTap: () => _onNavBarTapped(index),
      behavior: HitTestBehavior.opaque,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        curve: Curves.fastOutSlowIn,
        padding: const EdgeInsets.symmetric(
          horizontal: 8,
          vertical: 4,
        ), // Reduced vertical padding
        decoration: BoxDecoration(
          // Subtle background for the active item
          color: isSelected ? activeColor.withOpacity(0.1) : Colors.transparent,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Bouncing animated icon
            AnimatedScale(
              scale: isSelected ? 1.15 : 1.0,
              duration: const Duration(milliseconds: 300),
              curve: Curves.elasticOut,
              child: Icon(
                isSelected ? activeIcon : icon,
                color: color,
                size: 24, // Slightly smaller icon
              ),
            ),
            const SizedBox(height: 4),
            // Always visible label
            Text(
              label,
              style: GoogleFonts.outfit(
                color: color,
                // Bold when selected, normal when not
                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                fontSize: 12,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
