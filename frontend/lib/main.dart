import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
// import 'package:google_fonts/google_fonts.dart';
import 'providers/auth_provider.dart';
import 'screens/auth/login_doctor_screen.dart';
import 'screens/auth/login_patient_screen.dart';
import 'screens/auth/register_doctor_screen.dart';
import 'screens/doctor/doctor_main_screen.dart';
import 'screens/patient/patient_main_screen.dart';

Future<void> main() async {
  // <--- Changed to Future<void> and async
  // 1. Ensure Flutter bindings are initialized before async code
  WidgetsFlutterBinding.ensureInitialized();

  // 2. Load the environment variables
  await dotenv.load(fileName: ".env");

  runApp(
    MultiProvider(
      providers: [ChangeNotifierProvider(create: (_) => AuthProvider())],
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'DPMS',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF2196F3),
          primary: const Color(0xFF2196F3),
          secondary: const Color(0xFF1565C0),
          tertiary: const Color(0xFF03A9F4),
          background: const Color(0xFFF5F7FA),
          surface: Colors.white,
        ),
        scaffoldBackgroundColor: const Color(0xFFF5F7FA),
        // textTheme: GoogleFonts.poppinsTextTheme(Theme.of(context).textTheme),
        appBarTheme: AppBarTheme(
          backgroundColor: const Color(0xFFF5F7FA),
          elevation: 0,
          centerTitle: true,
          titleTextStyle: const TextStyle(
            color: Colors.black87,
            fontSize: 20,
            fontWeight: FontWeight.w600,
          ),
          iconTheme: const IconThemeData(color: Colors.black87),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF2196F3),
            foregroundColor: Colors.white,
            elevation: 2,
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
            ),
            textStyle: const TextStyle(
              fontWeight: FontWeight.w600,
              fontSize: 16,
            ),
          ),
        ),
        textButtonTheme: TextButtonThemeData(
          style: TextButton.styleFrom(
            foregroundColor: const Color(0xFF2196F3),
            textStyle: const TextStyle(fontWeight: FontWeight.w600),
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: Colors.white,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: BorderSide(color: Colors.grey.shade300),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: BorderSide(color: Colors.grey.shade200),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: const BorderSide(color: Color(0xFF2196F3), width: 2),
          ),
          errorBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: const BorderSide(color: Colors.redAccent),
          ),
          contentPadding: const EdgeInsets.symmetric(
            horizontal: 20,
            vertical: 18,
          ),
          labelStyle: const TextStyle(color: Colors.grey),
          hintStyle: const TextStyle(color: Colors.grey),
        ),
        cardTheme: CardThemeData(
          elevation: 2,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          color: Colors.white,
          surfaceTintColor: Colors.white,
          shadowColor: Colors.black.withOpacity(0.1),
        ),
      ),
      home: const AuthWrapper(),
      routes: {
        '/login': (ctx) => const LoginDoctorScreen(),
        '/patient-login': (ctx) => const LoginPatientScreen(),
        '/register-doctor': (ctx) => const RegisterDoctorScreen(),
        '/doctor/home': (ctx) => const DoctorMainScreen(),
        '/patient/home': (ctx) => const PatientMainScreen(),
      },
    );
  }
}

class AuthWrapper extends StatelessWidget {
  const AuthWrapper({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);

    if (auth.isLoading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    if (auth.user == null) {
      return const LoginDoctorScreen();
    }

    if (auth.isDoctor) {
      return const DoctorMainScreen();
    } else {
      return const PatientMainScreen();
    }
  }
}
