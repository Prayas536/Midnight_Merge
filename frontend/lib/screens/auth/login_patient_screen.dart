import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:dio/dio.dart';
// import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/animated_info_cards.dart';

class LoginPatientScreen extends StatefulWidget {
  const LoginPatientScreen({super.key});
  @override
  State<LoginPatientScreen> createState() => _LoginPatientScreenState();
}

class _LoginPatientScreenState extends State<LoginPatientScreen> {
  final _idController = TextEditingController();
  final _passController = TextEditingController();
  bool _loading = false;
  bool _obscurePassword = true;

  @override
  void dispose() {
    _idController.dispose();
    _passController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_idController.text.trim().isEmpty || _passController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enter ID and password'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    setState(() => _loading = true);
    try {
      await Provider.of<AuthProvider>(
        context,
        listen: false,
      ).loginPatient(_idController.text.trim(), _passController.text);
      if (mounted) Navigator.pushReplacementNamed(context, '/patient/home');
    } on DioException catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(e.response?.data['message'] ?? 'Login failed'),
          backgroundColor: Colors.red.shade400,
        ),
      );
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Color(0xFF1B5E20), // Deep Green
              Color(0xFF2E7D32), // Standard Green
              Color(0xFF66BB6A), // Light Green
            ],
            stops: [0.2, 0.6, 1.0],
          ),
        ),
        child: SingleChildScrollView(
          child: SafeArea(
            child: Column(
              children: [
                const SizedBox(height: 20),
                // Header Section
                Column(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.15),
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: Colors.white.withOpacity(0.3),
                          width: 2,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.1),
                            blurRadius: 10,
                            spreadRadius: 2,
                          ),
                        ],
                      ),
                      child: const Icon(
                        Icons.health_and_safety_rounded,
                        size: 40,
                        color: Colors.white,
                      ),
                    ).animate().scale(
                      duration: 600.ms,
                      curve: Curves.easeOutBack,
                    ),

                    const SizedBox(height: 16),
                    Text(
                      'Patient Portal',
                      style: const TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                        letterSpacing: 0.5,
                      ),
                    ).animate().fadeIn().slideY(begin: 0.3, end: 0),

                    const SizedBox(height: 8),
                    Text(
                      'Your Health, Our Priority',
                      style: TextStyle(
                        fontSize: 15,
                        color: Colors.white.withOpacity(0.9),
                        letterSpacing: 0.3,
                      ),
                    ).animate().fadeIn(delay: 200.ms),
                  ],
                ),

                const SizedBox(height: 30),

                // Improved Slider Integration
                const AnimatedInfoCardsSlider().animate().fadeIn(delay: 300.ms),

                const SizedBox(height: 30),

                // Login Form Card
                Container(
                  margin: const EdgeInsets.symmetric(
                    horizontal: 24,
                    vertical: 10,
                  ),
                  padding: const EdgeInsets.symmetric(
                    horizontal: 28,
                    vertical: 32,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(30),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.2),
                        blurRadius: 25,
                        offset: const Offset(0, 10),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Text(
                        'Secure Access',
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF2E7D32),
                        ),
                      ),
                      const SizedBox(height: 30),

                      // Patient ID Field
                      TextFormField(
                        controller: _idController,
                        style: const TextStyle(),
                        decoration: InputDecoration(
                          labelText: 'Patient ID',
                          labelStyle: TextStyle(color: Colors.grey[600]),
                          prefixIcon: const Icon(
                            Icons.badge_outlined,
                            color: Color(0xFF2E7D32),
                          ),
                          filled: true,
                          fillColor: Colors.grey[50],
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(16),
                            borderSide: BorderSide.none,
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(16),
                            borderSide: BorderSide(color: Colors.grey[200]!),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(16),
                            borderSide: const BorderSide(
                              color: Color(0xFF2E7D32),
                              width: 1.5,
                            ),
                          ),
                          contentPadding: const EdgeInsets.symmetric(
                            vertical: 18,
                          ),
                        ),
                      ),
                      const SizedBox(height: 20),

                      // Password Field
                      TextFormField(
                        controller: _passController,
                        style: const TextStyle(),
                        obscureText: _obscurePassword,
                        decoration: InputDecoration(
                          labelText: 'Password',
                          labelStyle: TextStyle(color: Colors.grey[600]),
                          prefixIcon: const Icon(
                            Icons.lock_outline_rounded,
                            color: Color(0xFF2E7D32),
                          ),
                          suffixIcon: IconButton(
                            icon: Icon(
                              _obscurePassword
                                  ? Icons.visibility_off_outlined
                                  : Icons.visibility_outlined,
                              color: Colors.grey[600],
                            ),
                            onPressed: () => setState(
                              () => _obscurePassword = !_obscurePassword,
                            ),
                          ),
                          filled: true,
                          fillColor: Colors.grey[50],
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(16),
                            borderSide: BorderSide.none,
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(16),
                            borderSide: BorderSide(color: Colors.grey[200]!),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(16),
                            borderSide: const BorderSide(
                              color: Color(0xFF2E7D32),
                              width: 1.5,
                            ),
                          ),
                          contentPadding: const EdgeInsets.symmetric(
                            vertical: 18,
                          ),
                        ),
                      ),
                      const SizedBox(height: 30),

                      // Login Button
                      Container(
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [Color(0xFF2E7D32), Color(0xFF66BB6A)],
                            begin: Alignment.centerLeft,
                            end: Alignment.centerRight,
                          ),
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0xFF2E7D32).withOpacity(0.35),
                              blurRadius: 18,
                              offset: const Offset(0, 6),
                            ),
                          ],
                        ),
                        child: Material(
                          color: Colors.transparent,
                          child: InkWell(
                            onTap: _loading ? null : _submit,
                            borderRadius: BorderRadius.circular(16),
                            child: Padding(
                              padding: const EdgeInsets.symmetric(vertical: 18),
                              child: _loading
                                  ? const Center(
                                      child: SizedBox(
                                        height: 22,
                                        width: 22,
                                        child: CircularProgressIndicator(
                                          strokeWidth: 2.5,
                                          valueColor:
                                              AlwaysStoppedAnimation<Color>(
                                                Colors.white,
                                              ),
                                        ),
                                      ),
                                    )
                                  : Text(
                                      'LOGIN',
                                      textAlign: TextAlign.center,
                                      style: const TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.bold,
                                        color: Colors.white,
                                        letterSpacing: 1.2,
                                      ),
                                    ),
                            ),
                          ),
                        ),
                      ).animate().scale(
                        delay: 100.ms,
                        begin: const Offset(0.95, 0.95),
                      ),

                      const SizedBox(height: 24),

                      // Navigation Links
                      Center(
                        child: TextButton(
                          onPressed: () =>
                              Navigator.pushReplacementNamed(context, '/login'),
                          child: Text(
                            'Doctor Login',
                            style: const TextStyle(
                              color: Color(0xFF1976D2),
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ).animate().fadeIn(delay: 500.ms).slideY(begin: 0.2),

                const SizedBox(height: 20),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
