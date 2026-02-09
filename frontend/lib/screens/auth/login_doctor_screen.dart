import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:dio/dio.dart';
// import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/animated_info_cards.dart';

class LoginDoctorScreen extends StatefulWidget {
  const LoginDoctorScreen({super.key});
  @override
  State<LoginDoctorScreen> createState() => _LoginDoctorScreenState();
}

class _LoginDoctorScreenState extends State<LoginDoctorScreen> {
  final _emailController = TextEditingController();
  final _passController = TextEditingController();
  bool _loading = false;
  bool _obscurePassword = true;

  @override
  void dispose() {
    _emailController.dispose();
    _passController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final email = _emailController.text.trim();
    final password = _passController.text;

    if (email.isEmpty || !email.contains('@')) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enter a valid email'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }
    if (password.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enter your password'),
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
      ).loginDoctor(email, password);
      if (mounted) Navigator.pushReplacementNamed(context, '/doctor/home');
    } on DioException catch (e) {
      String errorMsg = 'Login failed';
      if (e.response != null) {
        final data = e.response?.data;
        if (data is Map && data['message'] != null) {
          errorMsg = data['message'];
        } else if (data is String && data.isNotEmpty) {
          // Limit length in case of HTML response
          errorMsg = data.length > 100 ? data.substring(0, 100) : data;
        } else {
          errorMsg = e.response?.statusMessage ?? errorMsg;
        }
      }
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(errorMsg),
            backgroundColor: Colors.red.shade400,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: ${e.toString()}'),
            backgroundColor: Colors.red.shade400,
          ),
        );
      }
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
              Color(0xFF0D47A1), // Deep Blue
              Color(0xFF1976D2), // Lighter Blue
              Color(0xFF42A5F5), // Accent Blue
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
                        Icons.medical_services_rounded,
                        size: 40,
                        color: Colors.white,
                      ),
                    ).animate().scale(
                      duration: 600.ms,
                      curve: Curves.easeOutBack,
                    ),

                    const SizedBox(height: 16),
                    Text(
                      'Doctor Portal',
                      style: const TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                        letterSpacing: 0.5,
                      ),
                    ).animate().fadeIn().slideY(begin: 0.3, end: 0),

                    const SizedBox(height: 8),
                    Text(
                      'Welcome back to DPMS',
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
                        'Secure Login',
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF1565C0),
                        ),
                      ),
                      const SizedBox(height: 30),

                      // Email Field
                      TextFormField(
                        controller: _emailController,
                        style: const TextStyle(),
                        decoration: InputDecoration(
                          labelText: 'Email Address',
                          labelStyle: TextStyle(color: Colors.grey[600]),
                          prefixIcon: const Icon(
                            Icons.email_outlined,
                            color: Color(0xFF1565C0),
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
                              color: Color(0xFF1565C0),
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
                            color: Color(0xFF1565C0),
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
                              color: Color(0xFF1565C0),
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
                            colors: [Color(0xFF1565C0), Color(0xFF42A5F5)],
                            begin: Alignment.centerLeft,
                            end: Alignment.centerRight,
                          ),
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0xFF1565C0).withOpacity(0.35),
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

                      // Links
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          TextButton(
                            onPressed: () => Navigator.pushReplacementNamed(
                              context,
                              '/register-doctor',
                            ),
                            child: Text(
                              'Create Account',
                              style: const TextStyle(
                                color: Color(0xFF1976D2),
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                          TextButton(
                            onPressed: () => Navigator.pushReplacementNamed(
                              context,
                              '/patient-login',
                            ),
                            child: Text(
                              'Patient Login',
                              style: TextStyle(
                                color: Colors.grey[600],
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                        ],
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
