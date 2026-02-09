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
  int _selectedIndex = 0;

  late final List<Widget> _screens = [
    const DoctorDashboard(),
    const PatientsScreen(),
    const PredictScreen(),
    const DoctorProfileScreen(),
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
      bottomNavigationBar: NavigationBarTheme(
        data: NavigationBarThemeData(
          indicatorColor: const Color(0xFF2196F3).withOpacity(0.2),
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
              selectedIcon: Icon(Icons.dashboard, color: Color(0xFF2196F3)),
              label: 'Dashboard',
            ),
            NavigationDestination(
              icon: Icon(Icons.people_outline),
              selectedIcon: Icon(Icons.people, color: Color(0xFF2196F3)),
              label: 'Patients',
            ),
            NavigationDestination(
              icon: Icon(Icons.analytics_outlined),
              selectedIcon: Icon(Icons.analytics, color: Color(0xFF2196F3)),
              label: 'Predict',
            ),
            NavigationDestination(
              icon: Icon(Icons.person_outline),
              selectedIcon: Icon(Icons.person, color: Color(0xFF2196F3)),
              label: 'Profile',
            ),
          ],
        ),
      ),
    );
  }
}
