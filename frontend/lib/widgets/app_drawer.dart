import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';

class AppDrawer extends StatelessWidget {
  const AppDrawer({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final isDoctor = auth.isDoctor;

    return Drawer(
      child: ListView(
        padding: EdgeInsets.zero,
        children: [
          UserAccountsDrawerHeader(
            accountName: Text(auth.user?['name'] ?? 'User'),
            accountEmail: Text(isDoctor ? (auth.user?['email'] ?? '') : (auth.user?['patientId'] ?? '')),
            currentAccountPicture: CircleAvatar(
              backgroundColor: Colors.white,
              child: Text(
                (auth.user?['name'] ?? 'U')[0].toUpperCase(),
                style: const TextStyle(fontSize: 24.0),
              ),
            ),
          ),
          if (isDoctor) ...[
            ListTile(
              leading: const Icon(Icons.dashboard),
              title: const Text('Dashboard'),
              onTap: () => Navigator.pushReplacementNamed(context, '/doctor/dashboard'),
            ),
            ListTile(
              leading: const Icon(Icons.people),
              title: const Text('Patients'),
              onTap: () => Navigator.pushReplacementNamed(context, '/doctor/patients'),
            ),
            ListTile(
              leading: const Icon(Icons.analytics),
              title: const Text('Predict Tool'),
              onTap: () => Navigator.pushReplacementNamed(context, '/doctor/predict'),
            ),
          ] else ...[
             ListTile(
              leading: const Icon(Icons.dashboard),
              title: const Text('Dashboard'),
              onTap: () => Navigator.pushReplacementNamed(context, '/patient/dashboard'),
            ),
            ListTile(
              leading: const Icon(Icons.person),
              title: const Text('Profile'),
              onTap: () => Navigator.pushReplacementNamed(context, '/patient/profile'),
            ),
            ListTile(
              leading: const Icon(Icons.history),
              title: const Text('My Visits'),
              onTap: () => Navigator.pushReplacementNamed(context, '/patient/visits'),
            ),
          ],
          const Divider(),
          ListTile(
            leading: const Icon(Icons.logout, color: Colors.red),
            title: const Text('Logout', style: TextStyle(color: Colors.red)),
            onTap: () {
              auth.logout();
              Navigator.pushNamedAndRemoveUntil(context, '/login', (route) => false);
            },
          ),
        ],
      ),
    );
  }
}