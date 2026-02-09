import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:dio/dio.dart';
// import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/animated_info_cards.dart';

class RegisterDoctorScreen extends StatefulWidget {
  const RegisterDoctorScreen({super.key});
  @override
  State<RegisterDoctorScreen> createState() => _RegisterDoctorScreenState();
}

class _RegisterDoctorScreenState extends State<RegisterDoctorScreen> {
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passController = TextEditingController();
  final _licenseController = TextEditingController();
  final _specializationController = TextEditingController();
  bool _loading = false;
  bool _obscurePassword = true;

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passController.dispose();
    _licenseController.dispose();
    _specializationController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final name = _nameController.text.trim();
    final email = _emailController.text.trim();
    final password = _passController.text;
    final medicalLicense = _licenseController.text.trim();
    final specialization = _specializationController.text.trim();

    if (name.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enter your name'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }
    if (medicalLicense.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enter your medical license number'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }
    if (specialization.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enter your specialization'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }
    if (email.isEmpty || !email.contains('@')) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enter a valid email'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }
    if (password.isEmpty || password.length < 6) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Password must be at least 6 characters'),
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
      ).registerDoctor(name, email, password, medicalLicense, specialization);
      if (mounted) Navigator.pushReplacementNamed(context, '/doctor/home');
    } on DioException catch (e) {
      String errorMsg = 'Registration failed';
      if (e.response != null) {
        errorMsg =
            e.response?.data['message'] ??
            e.response?.statusMessage ??
            errorMsg;
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
                        Icons.person_add_rounded,
                        size: 40,
                        color: Colors.white,
                      ),
                    ).animate().scale(
                      duration: 600.ms,
                      curve: Curves.easeOutBack,
                    ),

                    const SizedBox(height: 16),
                    Text(
                      'Join DPMS',
                      style: const TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                        letterSpacing: 0.5,
                      ),
                    ).animate().fadeIn().slideY(begin: 0.3, end: 0),

                    const SizedBox(height: 8),
                    Text(
                      'Create Your Doctor Account',
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

                // Registration Form Card
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
                        'Get Started',
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF1565C0),
                        ),
                      ),
                      const SizedBox(height: 30),

                      // Full Name Field
                      TextFormField(
                        controller: _nameController,
                        style: const TextStyle(),
                        decoration: InputDecoration(
                          labelText: 'Full Name',
                          labelStyle: TextStyle(color: Colors.grey[600]),
                          prefixIcon: const Icon(
                            Icons.person_outline,
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

                      // Medical License Field
                      TextFormField(
                        controller: _licenseController,
                        style: const TextStyle(),
                        decoration: InputDecoration(
                          labelText: 'Medical License Number',
                          labelStyle: TextStyle(color: Colors.grey[600]),
                          prefixIcon: const Icon(
                            Icons.verified_user_outlined,
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

                      // Specialization Field
                      TextFormField(
                        controller: _specializationController,
                        style: const TextStyle(),
                        decoration: InputDecoration(
                          labelText: 'Specialization (e.g., Cardiologist)',
                          labelStyle: TextStyle(color: Colors.grey[600]),
                          prefixIcon: const Icon(
                            Icons.work_outline,
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

                      // Register Button
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
                                      'CREATE ACCOUNT',
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

                      // Back to Login Link
                      Center(
                        child: TextButton(
                          onPressed: () =>
                              Navigator.pushReplacementNamed(context, '/login'),
                          child: Text(
                            'Already have an account? Login',
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
