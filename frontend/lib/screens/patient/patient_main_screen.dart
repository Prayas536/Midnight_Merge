import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'patient_dashboard.dart';
import 'visits_screen.dart';
import 'patient_settings_screen.dart';
import 'patient_predict_screen.dart';
import 'patient_chat_screen.dart';
import 'package:flutter_animate/flutter_animate.dart';

class PatientMainScreen extends StatefulWidget {
  const PatientMainScreen({super.key});

  @override
  State<PatientMainScreen> createState() => _PatientMainScreenState();
}

class _PatientMainScreenState extends State<PatientMainScreen> {
  int _selectedIndex = 0;

  late final List<Widget> _screens = [
    PatientDashboard(
      onSeeAllVisits: () => _onNavBarTapped(1), // Index 1 is VisitsScreen
    ),
    const VisitsScreen(),
    const PatientSettingsScreen(),
    const PatientPredictScreen(),
  ];

  void _onNavBarTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _screens[_selectedIndex],
      floatingActionButton:
          _selectedIndex == 0 ||
              _selectedIndex ==
                  1 // Show only on Dashboard & Visits
          ? FloatingActionButton.extended(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const PatientChatScreen(),
                  ),
                );
              },
              backgroundColor: const Color(0xFF2E7D32),
              icon: const Icon(Icons.smart_toy_outlined, color: Colors.white),
              label: Text(
                'AI Assistant',
                style: GoogleFonts.poppins(
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                ),
              ),
            ).animate().scale(delay: 500.ms, curve: Curves.elasticOut)
          : null,
      bottomNavigationBar: NavigationBarTheme(
        data: NavigationBarThemeData(
          indicatorColor: const Color(0xFF4CAF50).withOpacity(0.2),
          labelTextStyle: MaterialStateProperty.all(
            GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.w500),
          ),
          iconTheme: MaterialStateProperty.all(const IconThemeData(size: 24)),
        ),
        child: NavigationBar(
          selectedIndex: _selectedIndex,
          onDestinationSelected: _onNavBarTapped,
          backgroundColor: Colors.white,
          elevation: 2,
          shadowColor: Colors.black26,
          destinations: const [
            NavigationDestination(
              icon: Icon(Icons.dashboard_outlined),
              selectedIcon: Icon(Icons.dashboard, color: Color(0xFF4CAF50)),
              label: 'Dashboard',
            ),
            NavigationDestination(
              icon: Icon(Icons.assignment_outlined),
              selectedIcon: Icon(Icons.assignment, color: Color(0xFF4CAF50)),
              label: 'Visits',
            ),
            NavigationDestination(
              icon: Icon(Icons.person_outline),
              selectedIcon: Icon(Icons.person, color: Color(0xFF4CAF50)),
              label: 'Profile',
            ),
            NavigationDestination(
              icon: Icon(Icons.analytics_outlined),
              selectedIcon: Icon(Icons.analytics, color: Color(0xFF4CAF50)),
              label: 'Predict',
            ),
          ],
        ),
      ),
    );
  }
}
