import os

# Define the directory structure and file contents
files = {
    "lib/main.dart": r"""
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'providers/auth_provider.dart';
import 'screens/auth/login_doctor_screen.dart';
import 'screens/auth/login_patient_screen.dart';
import 'screens/auth/register_doctor_screen.dart';
import 'screens/doctor/doctor_dashboard.dart';
import 'screens/doctor/patients_screen.dart';
import 'screens/doctor/predict_screen.dart';
import 'screens/patient/patient_dashboard.dart';
import 'screens/patient/profile_screen.dart';
import 'screens/patient/visits_screen.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
      ],
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
        primarySwatch: Colors.blue,
        useMaterial3: true,
        inputDecorationTheme: const InputDecorationTheme(
          border: OutlineInputBorder(),
          contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        ),
      ),
      home: const AuthWrapper(),
      routes: {
        '/login': (ctx) => const LoginDoctorScreen(),
        '/patient-login': (ctx) => const LoginPatientScreen(),
        '/register-doctor': (ctx) => const RegisterDoctorScreen(),
        '/doctor/dashboard': (ctx) => const DoctorDashboard(),
        '/doctor/patients': (ctx) => const PatientsScreen(),
        '/doctor/predict': (ctx) => const PredictScreen(),
        '/patient/dashboard': (ctx) => const PatientDashboard(),
        '/patient/profile': (ctx) => const ProfileScreen(),
        '/patient/visits': (ctx) => const VisitsScreen(),
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
      return const DoctorDashboard();
    } else {
      return const PatientDashboard();
    }
  }
}
""",

    "lib/services/api_service.dart": r"""
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiService {
  // Use 10.0.2.2 for Android Emulator, localhost for iOS Simulator/Web
  // If testing on a real device, use your PC's local IP (e.g., http://192.168.1.5:5000/api)
  static const String baseUrl = 'http://10.0.2.2:5000/api'; 
  
  final Dio _dio = Dio(BaseOptions(
    baseUrl: baseUrl,
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 10),
  ));
  
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  ApiService() {
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await _storage.read(key: 'dpms_token');
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
    ));
  }

  Dio get dio => _dio;
  FlutterSecureStorage get storage => _storage;
}
""",

    "lib/providers/auth_provider.dart": r"""
import 'package:flutter/material.dart';
import '../services/api_service.dart';

class AuthProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  Map<String, dynamic>? _user;
  bool _isLoading = true;

  Map<String, dynamic>? get user => _user;
  bool get isLoading => _isLoading;
  bool get isDoctor => _user?['userType'] == 'doctor';

  AuthProvider() {
    _init();
  }

  Future<void> _init() async {
    final token = await _apiService.storage.read(key: 'dpms_token');
    if (token != null) {
      await fetchMe();
    } else {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchMe() async {
    try {
      final res = await _apiService.dio.get('/auth/me');
      _user = res.data['data']['user'];
    } catch (e) {
      _user = null;
      await _apiService.storage.delete(key: 'dpms_token');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> loginDoctor(String email, String password) async {
    final res = await _apiService.dio.post('/auth/login', data: {
      'email': email,
      'password': password,
    });
    await _handleAuthResponse(res);
  }

  Future<void> loginPatient(String patientId, String password) async {
    final res = await _apiService.dio.post('/auth/login-patient', data: {
      'patientId': patientId,
      'password': password,
    });
    await _handleAuthResponse(res);
  }

  Future<void> registerDoctor(String name, String email, String password) async {
    final res = await _apiService.dio.post('/auth/register-doctor', data: {
      'name': name,
      'email': email,
      'password': password,
    });
    await _handleAuthResponse(res);
  }

  Future<void> _handleAuthResponse(dynamic res) async {
    final token = res.data['data']['token'];
    if (token != null) {
      await _apiService.storage.write(key: 'dpms_token', value: token);
      await fetchMe();
    }
  }

  Future<void> logout() async {
    try {
      await _apiService.dio.post('/auth/logout');
    } catch (_) {}
    await _apiService.storage.delete(key: 'dpms_token');
    _user = null;
    notifyListeners();
  }
}
""",

    "lib/widgets/app_drawer.dart": r"""
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
""",

    "lib/screens/auth/login_doctor_screen.dart": r"""
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:dio/dio.dart';
import '../../providers/auth_provider.dart';

class LoginDoctorScreen extends StatefulWidget {
  const LoginDoctorScreen({super.key});
  @override
  State<LoginDoctorScreen> createState() => _LoginDoctorScreenState();
}

class _LoginDoctorScreenState extends State<LoginDoctorScreen> {
  final _emailController = TextEditingController();
  final _passController = TextEditingController();
  bool _loading = false;

  Future<void> _submit() async {
    setState(() => _loading = true);
    try {
      await Provider.of<AuthProvider>(context, listen: false)
          .loginDoctor(_emailController.text, _passController.text);
    } on DioException catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.response?.data['message'] ?? 'Login failed')),
      );
    } finally {
      if(mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Doctor Login')),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Icon(Icons.medical_services, size: 80, color: Colors.blue),
              const SizedBox(height: 32),
              TextField(controller: _emailController, decoration: const InputDecoration(labelText: 'Email', prefixIcon: Icon(Icons.email))),
              const SizedBox(height: 16),
              TextField(controller: _passController, decoration: const InputDecoration(labelText: 'Password', prefixIcon: Icon(Icons.lock)), obscureText: true),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: _loading ? null : _submit,
                style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16)),
                child: _loading ? const CircularProgressIndicator() : const Text('LOGIN'),
              ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  TextButton(onPressed: () => Navigator.pushReplacementNamed(context, '/register-doctor'), child: const Text('Register')),
                  TextButton(onPressed: () => Navigator.pushReplacementNamed(context, '/patient-login'), child: const Text('Patient Login')),
                ],
              )
            ],
          ),
        ),
      ),
    );
  }
}
""",

    "lib/screens/auth/login_patient_screen.dart": r"""
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:dio/dio.dart';
import '../../providers/auth_provider.dart';

class LoginPatientScreen extends StatefulWidget {
  const LoginPatientScreen({super.key});
  @override
  State<LoginPatientScreen> createState() => _LoginPatientScreenState();
}

class _LoginPatientScreenState extends State<LoginPatientScreen> {
  final _idController = TextEditingController();
  final _passController = TextEditingController();
  bool _loading = false;

  Future<void> _submit() async {
    setState(() => _loading = true);
    try {
      await Provider.of<AuthProvider>(context, listen: false)
          .loginPatient(_idController.text, _passController.text);
    } on DioException catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.response?.data['message'] ?? 'Login failed')),
      );
    } finally {
      if(mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Patient Login')),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Icon(Icons.person, size: 80, color: Colors.green),
              const SizedBox(height: 32),
              TextField(controller: _idController, decoration: const InputDecoration(labelText: 'Patient ID', prefixIcon: Icon(Icons.badge))),
              const SizedBox(height: 16),
              TextField(controller: _passController, decoration: const InputDecoration(labelText: 'Password', prefixIcon: Icon(Icons.lock)), obscureText: true),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: _loading ? null : _submit,
                style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16), backgroundColor: Colors.green, foregroundColor: Colors.white),
                child: _loading ? const CircularProgressIndicator() : const Text('LOGIN'),
              ),
              const SizedBox(height: 16),
              TextButton(onPressed: () => Navigator.pushReplacementNamed(context, '/login'), child: const Text('Doctor Login')),
            ],
          ),
        ),
      ),
    );
  }
}
""",

    "lib/screens/auth/register_doctor_screen.dart": r"""
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:dio/dio.dart';
import '../../providers/auth_provider.dart';

class RegisterDoctorScreen extends StatefulWidget {
  const RegisterDoctorScreen({super.key});
  @override
  State<RegisterDoctorScreen> createState() => _RegisterDoctorScreenState();
}

class _RegisterDoctorScreenState extends State<RegisterDoctorScreen> {
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passController = TextEditingController();
  bool _loading = false;

  Future<void> _submit() async {
    setState(() => _loading = true);
    try {
      await Provider.of<AuthProvider>(context, listen: false)
          .registerDoctor(_nameController.text, _emailController.text, _passController.text);
      if(mounted) Navigator.pushReplacementNamed(context, '/doctor/dashboard');
    } on DioException catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.response?.data['message'] ?? 'Registration failed')),
      );
    } finally {
      if(mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Register Doctor')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          children: [
            TextField(controller: _nameController, decoration: const InputDecoration(labelText: 'Full Name', prefixIcon: Icon(Icons.person))),
            const SizedBox(height: 16),
            TextField(controller: _emailController, decoration: const InputDecoration(labelText: 'Email', prefixIcon: Icon(Icons.email))),
            const SizedBox(height: 16),
            TextField(controller: _passController, decoration: const InputDecoration(labelText: 'Password', prefixIcon: Icon(Icons.lock)), obscureText: true),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _loading ? null : _submit,
                style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16)),
                child: _loading ? const CircularProgressIndicator() : const Text('REGISTER'),
              ),
            ),
            const SizedBox(height: 16),
            TextButton(onPressed: () => Navigator.pushReplacementNamed(context, '/login'), child: const Text('Back to Login')),
          ],
        ),
      ),
    );
  }
}
""",

    "lib/screens/doctor/doctor_dashboard.dart": r"""
import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import '../../widgets/app_drawer.dart';

class DoctorDashboard extends StatefulWidget {
  const DoctorDashboard({super.key});
  @override
  State<DoctorDashboard> createState() => _DoctorDashboardState();
}

class _DoctorDashboardState extends State<DoctorDashboard> {
  int _patientCount = 0;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadStats();
  }

  Future<void> _loadStats() async {
    try {
      final res = await ApiService().dio.get('/patients');
      if (mounted) {
        setState(() {
          _patientCount = (res.data['data'] as List).length;
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Doctor Dashboard')),
      drawer: const AppDrawer(),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Card(
                    elevation: 4,
                    color: Colors.blue.shade50,
                    child: Padding(
                      padding: const EdgeInsets.all(24.0),
                      child: Column(
                        children: [
                          const Text('Total Patients', style: TextStyle(fontSize: 18, color: Colors.blueGrey)),
                          const SizedBox(height: 8),
                          Text('$_patientCount', style: const TextStyle(fontSize: 48, fontWeight: FontWeight.bold, color: Colors.blue)),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                  const Card(
                    elevation: 2,
                    child: Padding(
                      padding: EdgeInsets.all(20.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(children: [Icon(Icons.info_outline), SizedBox(width: 8), Text('Workflow', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold))]),
                          Divider(),
                          ListTile(leading: CircleAvatar(child: Text('1'), radius: 12), title: Text('Create a patient')),
                          ListTile(leading: CircleAvatar(child: Text('2'), radius: 12), title: Text('Copy the generated Patient ID + password')),
                          ListTile(leading: CircleAvatar(child: Text('3'), radius: 12), title: Text('Add visits & view trends')),
                          ListTile(leading: CircleAvatar(child: Text('4'), radius: 12), title: Text('Use Predict page for ML risk score')),
                        ],
                      ),
                    ),
                  )
                ],
              ),
            ),
    );
  }
}
""",

    "lib/screens/doctor/patients_screen.dart": r"""
import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import '../../widgets/app_drawer.dart';
import 'patient_details_screen.dart';

class PatientsScreen extends StatefulWidget {
  const PatientsScreen({super.key});
  @override
  State<PatientsScreen> createState() => _PatientsScreenState();
}

class _PatientsScreenState extends State<PatientsScreen> {
  List<dynamic> _patients = [];
  bool _loading = true;
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadPatients();
  }

  Future<void> _loadPatients([String? q]) async {
    setState(() => _loading = true);
    try {
      final res = await ApiService().dio.get('/patients', queryParameters: q != null && q.isNotEmpty ? {'q': q} : {});
      if (mounted) {
        setState(() {
          _patients = res.data['data'];
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _showAddPatientDialog() {
    showDialog(context: context, builder: (ctx) => const AddPatientDialog()).then((val) {
      if (val == true) _loadPatients();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Patients'),
        actions: [
          IconButton(icon: const Icon(Icons.person_add), onPressed: _showAddPatientDialog)
        ],
      ),
      drawer: const AppDrawer(),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(12.0),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Search by name or ID...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: IconButton(icon: const Icon(Icons.clear), onPressed: () {
                  _searchController.clear();
                  _loadPatients();
                }),
              ),
              onSubmitted: _loadPatients,
            ),
          ),
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : _patients.isEmpty 
                  ? const Center(child: Text("No patients found"))
                  : ListView.builder(
                    itemCount: _patients.length,
                    itemBuilder: (ctx, i) {
                      final p = _patients[i];
                      return Card(
                        margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                        child: ListTile(
                          leading: CircleAvatar(child: Text(p['name'][0].toUpperCase())),
                          title: Text(p['name']),
                          subtitle: Text('ID: ${p['patientId']} | ${p['gender']}'),
                          trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(builder: (_) => PatientDetailsScreen(patientId: p['_id'])),
                            );
                          },
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}

class AddPatientDialog extends StatefulWidget {
  const AddPatientDialog({super.key});
  @override
  State<AddPatientDialog> createState() => _AddPatientDialogState();
}

class _AddPatientDialogState extends State<AddPatientDialog> {
  final _formKey = GlobalKey<FormState>();
  String name = '';
  String dob = '';
  String gender = 'male';
  String smokingHistory = 'no info';
  bool hypertension = false;
  bool heartDisease = false;
  String bmi = '';
  String hba1c = '';
  String glucose = '';

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    _formKey.currentState!.save();
    try {
      final res = await ApiService().dio.post('/patients', data: {
        'name': name,
        'dob': dob,
        'gender': gender,
        'smokingHistory': smokingHistory,
        'hypertension': hypertension,
        'heartDisease': heartDisease,
        'bmi': bmi.isNotEmpty ? double.parse(bmi) : null,
        'HbA1cLevel': hba1c.isNotEmpty ? double.parse(hba1c) : null,
        'bloodGlucoseLevel': glucose.isNotEmpty ? double.parse(glucose) : null,
      });
      
      final login = res.data['data']['patientLogin'];
      if(!mounted) return;
      Navigator.pop(context, true);
      
      showDialog(context: context, builder: (_) => AlertDialog(
        title: const Text('Patient Created'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Please save these credentials (shown once):'),
            const SizedBox(height: 10),
            SelectableText('ID: ${login['patientId']}', style: const TextStyle(fontWeight: FontWeight.bold)),
            SelectableText('Password: ${login['password']}', style: const TextStyle(fontWeight: FontWeight.bold)),
          ],
        ),
        actions: [TextButton(onPressed: () => Navigator.pop(context), child: const Text('OK'))],
      ));
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Create failed')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Add Patient'),
      content: SingleChildScrollView(
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextFormField(decoration: const InputDecoration(labelText: 'Name'), onSaved: (v) => name = v!, validator: (v) => v!.isEmpty ? 'Required' : null),
              const SizedBox(height: 8),
              TextFormField(
                decoration: const InputDecoration(labelText: 'DOB (YYYY-MM-DD)', hintText: '1990-01-01'),
                onSaved: (v) => dob = v!,
                validator: (v) => v!.isEmpty ? 'Required' : null,
              ),
              const SizedBox(height: 8),
              DropdownButtonFormField(
                value: gender,
                decoration: const InputDecoration(labelText: 'Gender'),
                items: ['male', 'female', 'other'].map((e) => DropdownMenuItem(value: e, child: Text(e))).toList(),
                onChanged: (v) => setState(() => gender = v.toString()),
              ),
              const SizedBox(height: 8),
               DropdownButtonFormField(
                value: smokingHistory,
                decoration: const InputDecoration(labelText: 'Smoking History'),
                items: ['no info', 'never', 'former', 'current', 'not current'].map((e) => DropdownMenuItem(value: e, child: Text(e))).toList(),
                onChanged: (v) => setState(() => smokingHistory = v.toString()),
              ),
              CheckboxListTile(title: const Text('Hypertension'), value: hypertension, onChanged: (v) => setState(() => hypertension = v!)),
              CheckboxListTile(title: const Text('Heart Disease'), value: heartDisease, onChanged: (v) => setState(() => heartDisease = v!)),
              TextFormField(decoration: const InputDecoration(labelText: 'BMI'), keyboardType: TextInputType.number, onSaved: (v) => bmi = v!),
              TextFormField(decoration: const InputDecoration(labelText: 'HbA1c'), keyboardType: TextInputType.number, onSaved: (v) => hba1c = v!),
              TextFormField(decoration: const InputDecoration(labelText: 'Blood Glucose'), keyboardType: TextInputType.number, onSaved: (v) => glucose = v!),
            ],
          ),
        ),
      ),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
        ElevatedButton(onPressed: _save, child: const Text('Create')),
      ],
    );
  }
}
""",

    "lib/screens/doctor/patient_details_screen.dart": r"""
import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../services/api_service.dart';
import 'add_visit_screen.dart';

class PatientDetailsScreen extends StatefulWidget {
  final String patientId;
  const PatientDetailsScreen({super.key, required this.patientId});
  @override
  State<PatientDetailsScreen> createState() => _PatientDetailsScreenState();
}

class _PatientDetailsScreenState extends State<PatientDetailsScreen> {
  Map<String, dynamic>? _patient;
  List<dynamic> _visits = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final pRes = await ApiService().dio.get('/patients/${widget.patientId}');
      final vRes = await ApiService().dio.get('/patients/${widget.patientId}/visits');
      if (mounted) {
        setState(() {
          _patient = pRes.data['data'];
          _visits = vRes.data['data'];
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) Navigator.pop(context);
    }
  }

  Future<void> _deletePatient() async {
    try {
        await ApiService().dio.delete('/patients/${widget.patientId}');
        if(mounted) Navigator.pop(context);
    } catch(e) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Delete failed')));
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Scaffold(body: Center(child: CircularProgressIndicator()));

    return Scaffold(
      appBar: AppBar(
        title: Text(_patient!['name']),
        actions: [
            IconButton(icon: const Icon(Icons.delete, color: Colors.red), onPressed: _deletePatient)
        ]
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => AddVisitScreen(patientId: widget.patientId))).then((_) => _loadData()),
        label: const Text('Add Visit'),
        icon: const Icon(Icons.add),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text("Patient ID: ${_patient!['patientId']}", style: Theme.of(context).textTheme.titleMedium),
                    const Divider(),
                    Wrap(
                      spacing: 20,
                      runSpacing: 10,
                      children: [
                        _infoChip('Gender', _patient!['gender']),
                        _infoChip('Hypertension', _patient!['hypertension'] ? 'Yes' : 'No'),
                        _infoChip('Heart Disease', _patient!['heartDisease'] ? 'Yes' : 'No'),
                        _infoChip('Smoking', _patient!['smokingHistory']),
                      ],
                    )
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),
            Text("Visits History", style: Theme.of(context).textTheme.headlineSmall),
            const SizedBox(height: 10),
            if (_visits.isEmpty) const Text("No visits recorded yet."),
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _visits.length,
              itemBuilder: (ctx, i) {
                final v = _visits[i];
                final risk = v['prediction']?['riskLabel'];
                return Card(
                  child: ExpansionTile(
                    title: Text(v['visitDate'].toString().split('T')[0]),
                    subtitle: risk != null 
                        ? Text("Risk: $risk", style: TextStyle(color: risk == 'High Risk' ? Colors.red : Colors.green, fontWeight: FontWeight.bold))
                        : const Text("No Prediction"),
                    children: [
                        Padding(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                    Text("HbA1c: ${v['metrics']?['HbA1cLevel'] ?? '-'}"),
                                    Text("Glucose: ${v['metrics']?['bloodGlucoseLevel'] ?? '-'}"),
                                    Text("BMI: ${v['metrics']?['bmi'] ?? '-'}"),
                                    const SizedBox(height: 8),
                                    Text("Notes: ${v['notes'] ?? '-'}", style: const TextStyle(fontStyle: FontStyle.italic)),
                                ]
                            ),
                        )
                    ],
                  ),
                );
              },
            )
          ],
        ),
      ),
    );
  }

  Widget _infoChip(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 12, color: Colors.grey)),
        Text(value, style: const TextStyle(fontWeight: FontWeight.bold)),
      ],
    );
  }
}
""",

    "lib/screens/doctor/add_visit_screen.dart": r"""
import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import 'package:dio/dio.dart';

class AddVisitScreen extends StatefulWidget {
  final String patientId;
  const AddVisitScreen({super.key, required this.patientId});
  @override
  State<AddVisitScreen> createState() => _AddVisitScreenState();
}

class _AddVisitScreenState extends State<AddVisitScreen> {
  final _ageCtrl = TextEditingController();
  final _bmiCtrl = TextEditingController();
  final _hba1cCtrl = TextEditingController();
  final _glucoseCtrl = TextEditingController();
  final _notesCtrl = TextEditingController();
  final _recsCtrl = TextEditingController();
  
  String gender = 'Male';
  int hypertension = 0;
  int heartDisease = 0;
  String smoking = 'never';
  bool _loading = false;
  bool _savePrediction = true;
  Map<String, dynamic>? _prediction;

  Future<void> _predict() async {
    setState(() => _loading = true);
    try {
      final res = await ApiService().dio.post('/predictions', data: {
        'gender': gender,
        'age': int.tryParse(_ageCtrl.text),
        'hypertension': hypertension,
        'heart_disease': heartDisease,
        'smoking_history': smoking,
        'bmi': double.tryParse(_bmiCtrl.text),
        'HbA1c_level': double.tryParse(_hba1cCtrl.text),
        'blood_glucose_level': int.tryParse(_glucoseCtrl.text),
      });
      setState(() {
        _prediction = res.data['data'];
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Prediction Failed')));
    }
  }

  Future<void> _submit() async {
    try {
      await ApiService().dio.post('/patients/${widget.patientId}/visits', data: {
        'visitDate': DateTime.now().toIso8601String().split('T')[0],
        'metrics': {
          'gender': gender,
          'age': int.tryParse(_ageCtrl.text),
          'hypertension': hypertension,
          'heartDisease': heartDisease,
          'smokingHistory': smoking,
          'bmi': double.tryParse(_bmiCtrl.text),
          'HbA1cLevel': double.tryParse(_hba1cCtrl.text),
          'bloodGlucoseLevel': int.tryParse(_glucoseCtrl.text),
        },
        'notes': _notesCtrl.text,
        'recommendations': _recsCtrl.text,
        'prediction': _savePrediction && _prediction != null ? {
          'riskLabel': _prediction!['riskLabel'],
          'riskScore': _prediction!['riskScore'],
          'confidence': _prediction!['confidence'],
          'modelVersion': _prediction!['modelVersion'],
          'predictedAt': _prediction!['predictedAt'],
        } : null,
      });
      if (mounted) Navigator.pop(context);
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Save Failed')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Add Visit')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Row(children: [
                Expanded(child: TextField(controller: _ageCtrl, decoration: const InputDecoration(labelText: 'Age'), keyboardType: TextInputType.number)),
                const SizedBox(width: 10),
                Expanded(child: DropdownButtonFormField(value: gender, items: ['Male', 'Female', 'Other'].map((e) => DropdownMenuItem(value: e, child: Text(e))).toList(), onChanged: (v) => gender = v.toString())),
            ]),
            const SizedBox(height: 10),
            Row(children: [
                Expanded(child: DropdownButtonFormField(value: hypertension, decoration: const InputDecoration(labelText: 'Hypertension'), items: const [DropdownMenuItem(value: 0, child: Text("No")), DropdownMenuItem(value: 1, child: Text("Yes"))], onChanged: (v) => hypertension = v as int)),
                const SizedBox(width: 10),
                Expanded(child: DropdownButtonFormField(value: heartDisease, decoration: const InputDecoration(labelText: 'Heart Disease'), items: const [DropdownMenuItem(value: 0, child: Text("No")), DropdownMenuItem(value: 1, child: Text("Yes"))], onChanged: (v) => heartDisease = v as int)),
            ]),
            const SizedBox(height: 10),
             DropdownButtonFormField(value: smoking, decoration: const InputDecoration(labelText: 'Smoking History'), items: ['never', 'former', 'current', 'not current', 'No Info', 'ever'].map((e) => DropdownMenuItem(value: e, child: Text(e))).toList(), onChanged: (v) => smoking = v.toString()),
             const SizedBox(height: 10),
             TextField(controller: _bmiCtrl, decoration: const InputDecoration(labelText: 'BMI'), keyboardType: TextInputType.number),
             const SizedBox(height: 10),
             TextField(controller: _hba1cCtrl, decoration: const InputDecoration(labelText: 'HbA1c Level'), keyboardType: TextInputType.number),
             const SizedBox(height: 10),
             TextField(controller: _glucoseCtrl, decoration: const InputDecoration(labelText: 'Blood Glucose'), keyboardType: TextInputType.number),
            
             const SizedBox(height: 20),
             TextField(controller: _notesCtrl, decoration: const InputDecoration(labelText: 'Notes'), maxLines: 2),
             const SizedBox(height: 10),
             TextField(controller: _recsCtrl, decoration: const InputDecoration(labelText: 'Recommendations'), maxLines: 2),

            const SizedBox(height: 20),
            if (_prediction != null) 
              Container(
                padding: const EdgeInsets.all(16),
                width: double.infinity,
                decoration: BoxDecoration(color: Colors.blue[50], borderRadius: BorderRadius.circular(8)),
                child: Column(children: [
                    Text("Prediction Result", style: TextStyle(fontWeight: FontWeight.bold, color: Colors.blue[900])),
                    Text("Risk: ${_prediction!['riskLabel']} (${(_prediction!['riskScore']*100).toStringAsFixed(1)}%)", style: const TextStyle(fontSize: 18)),
                ]),
              ),
            
            const SizedBox(height: 20),
            Row(
              children: [
                Expanded(child: OutlinedButton(onPressed: _loading ? null : _predict, child: const Text('Run Prediction'))),
                const SizedBox(width: 10),
                Expanded(child: ElevatedButton(onPressed: _submit, child: const Text('Save Visit'))),
              ],
            ),
             CheckboxListTile(title: const Text('Save prediction with visit'), value: _savePrediction, onChanged: (v) => setState(() => _savePrediction = v!)),
          ],
        ),
      ),
    );
  }
}
""",

    "lib/screens/doctor/predict_screen.dart": r"""
import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import '../../widgets/app_drawer.dart';

class PredictScreen extends StatefulWidget {
  const PredictScreen({super.key});
  @override
  State<PredictScreen> createState() => _PredictScreenState();
}

class _PredictScreenState extends State<PredictScreen> {
  // Reuse logic from AddVisit but simplified
  final _ageCtrl = TextEditingController();
  final _bmiCtrl = TextEditingController();
  final _hba1cCtrl = TextEditingController();
  final _glucoseCtrl = TextEditingController();
  
  String gender = 'Male';
  int hypertension = 0;
  int heartDisease = 0;
  String smoking = 'never';
  bool _loading = false;
  Map<String, dynamic>? _result;

  Future<void> _submit() async {
    setState(() => _loading = true);
    _result = null;
    try {
      final res = await ApiService().dio.post('/predictions', data: {
        'gender': gender,
        'age': int.tryParse(_ageCtrl.text),
        'hypertension': hypertension,
        'heart_disease': heartDisease,
        'smoking_history': smoking,
        'bmi': double.tryParse(_bmiCtrl.text),
        'HbA1c_level': double.tryParse(_hba1cCtrl.text),
        'blood_glucose_level': int.tryParse(_glucoseCtrl.text),
      });
      setState(() => _result = res.data['data']);
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Prediction Failed')));
    } finally {
        setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Predict Tool')),
      drawer: const AppDrawer(),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            const Card(
                color: Colors.blueAccent,
                child: Padding(
                    padding: EdgeInsets.all(16),
                    child: Text("Enter patient details to get an ML-based diabetes risk assessment.", style: TextStyle(color: Colors.white)),
                ),
            ),
            const SizedBox(height: 20),
            // Form Fields (simplified for brevity, assume similar layout to AddVisit)
             Row(children: [
                Expanded(child: TextField(controller: _ageCtrl, decoration: const InputDecoration(labelText: 'Age'), keyboardType: TextInputType.number)),
                const SizedBox(width: 10),
                Expanded(child: DropdownButtonFormField(value: gender, items: ['Male', 'Female', 'Other'].map((e) => DropdownMenuItem(value: e, child: Text(e))).toList(), onChanged: (v) => gender = v.toString())),
            ]),
            const SizedBox(height: 10),
            Row(children: [
                Expanded(child: DropdownButtonFormField(value: hypertension, decoration: const InputDecoration(labelText: 'Hypertension'), items: const [DropdownMenuItem(value: 0, child: Text("No")), DropdownMenuItem(value: 1, child: Text("Yes"))], onChanged: (v) => hypertension = v as int)),
                const SizedBox(width: 10),
                Expanded(child: DropdownButtonFormField(value: heartDisease, decoration: const InputDecoration(labelText: 'Heart Disease'), items: const [DropdownMenuItem(value: 0, child: Text("No")), DropdownMenuItem(value: 1, child: Text("Yes"))], onChanged: (v) => heartDisease = v as int)),
            ]),
             const SizedBox(height: 10),
             DropdownButtonFormField(value: smoking, decoration: const InputDecoration(labelText: 'Smoking'), items: ['never', 'former', 'current', 'not current', 'No Info', 'ever'].map((e) => DropdownMenuItem(value: e, child: Text(e))).toList(), onChanged: (v) => smoking = v.toString()),
             const SizedBox(height: 10),
             TextField(controller: _bmiCtrl, decoration: const InputDecoration(labelText: 'BMI'), keyboardType: TextInputType.number),
             const SizedBox(height: 10),
             TextField(controller: _hba1cCtrl, decoration: const InputDecoration(labelText: 'HbA1c'), keyboardType: TextInputType.number),
             const SizedBox(height: 10),
             TextField(controller: _glucoseCtrl, decoration: const InputDecoration(labelText: 'Glucose'), keyboardType: TextInputType.number),
            
            const SizedBox(height: 20),
            SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                    onPressed: _loading ? null : _submit, 
                    style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16)),
                    child: _loading ? const CircularProgressIndicator() : const Text("PREDICT RISK")
                )
            ),

            if (_result != null)
                Card(
                    margin: const EdgeInsets.only(top: 24),
                    color: _result!['riskLabel'] == 'High Risk' ? Colors.red.shade50 : Colors.green.shade50,
                    child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(children: [
                            Text(_result!['riskLabel'], style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                            Text("Risk Score: ${(_result!['riskScore']*100).toStringAsFixed(2)}%"),
                            const SizedBox(height: 10),
                             Text("Confidence: ${(_result!['confidence']*100).toStringAsFixed(2)}%"),
                        ]),
                    ),
                )
          ],
        ),
      ),
    );
  }
}
""",

    "lib/screens/patient/patient_dashboard.dart": r"""
import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import '../../widgets/app_drawer.dart';

class PatientDashboard extends StatefulWidget {
  const PatientDashboard({super.key});
  @override
  State<PatientDashboard> createState() => _PatientDashboardState();
}

class _PatientDashboardState extends State<PatientDashboard> {
  Map<String, dynamic>? _profile;
  List<dynamic> _visits = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final p = await ApiService().dio.get('/my/profile');
      final v = await ApiService().dio.get('/my/visits');
      if (mounted) {
        setState(() {
          _profile = p.data['data'];
          _visits = v.data['data'];
          _loading = false;
        });
      }
    } catch (e) {
       // Handle error
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Scaffold(body: Center(child: CircularProgressIndicator()));
    
    return Scaffold(
      appBar: AppBar(title: const Text('My Dashboard')),
      drawer: const AppDrawer(),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
             Card(
               elevation: 4,
               child: Padding(
                 padding: const EdgeInsets.all(24),
                 child: Column(
                   children: [
                     const Text('Welcome back,', style: TextStyle(color: Colors.grey)),
                     Text(_profile!['name'], style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                     const SizedBox(height: 10),
                     Container(
                         padding: const EdgeInsets.all(8),
                         decoration: BoxDecoration(color: Colors.grey[200], borderRadius: BorderRadius.circular(4)),
                         child: Text('Patient ID: ${_profile!['patientId']}', style: const TextStyle(fontFamily: 'monospace')),
                     )
                   ],
                 ),
               ),
             ),
             const SizedBox(height: 20),
             Card(
               color: Colors.blue.shade50,
               child: Padding(
                 padding: const EdgeInsets.all(24),
                 child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                   children: [
                     const Text('Total Visits', style: TextStyle(fontSize: 18)),
                     Text('${_visits.length}', style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: Colors.blue)),
                   ],
                 ),
               ),
             )
          ],
        ),
      ),
    );
  }
}
""",

    "lib/screens/patient/profile_screen.dart": r"""
import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import '../../widgets/app_drawer.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});
  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  Map<String, dynamic>? p;
  bool loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
        final res = await ApiService().dio.get('/my/profile');
        setState(() { p = res.data['data']; loading = false; });
    } catch(e) { 
        setState(() => loading = false); 
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(title: const Text('My Profile')),
        drawer: const AppDrawer(),
        body: loading 
            ? const Center(child: CircularProgressIndicator())
            : SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Card(
                    child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                                _row('Name', p!['name']),
                                const Divider(),
                                _row('Patient ID', p!['patientId']),
                                const Divider(),
                                _row('DOB', p!['dob'].toString().split('T')[0]),
                                const Divider(),
                                _row('Gender', p!['gender']),
                                const Divider(),
                                _row('Hypertension', p!['hypertension'] ? 'Yes' : 'No'),
                                const Divider(),
                                _row('Heart Disease', p!['heartDisease'] ? 'Yes' : 'No'),
                                const Divider(),
                                _row('Smoking', p!['smokingHistory']),
                            ],
                        ),
                    ),
                ),
            )
    );
  }

  Widget _row(String label, String value) {
      return Padding(
          padding: const EdgeInsets.symmetric(vertical: 8),
          child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                  Text(label, style: const TextStyle(color: Colors.grey)),
                  Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              ],
          ),
      );
  }
}
""",

    "lib/screens/patient/visits_screen.dart": r"""
import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import '../../widgets/app_drawer.dart';

class VisitsScreen extends StatefulWidget {
  const VisitsScreen({super.key});
  @override
  State<VisitsScreen> createState() => _VisitsScreenState();
}

class _VisitsScreenState extends State<VisitsScreen> {
  List<dynamic>? visits;
  bool loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
        final res = await ApiService().dio.get('/my/visits');
        setState(() { visits = res.data['data']; loading = false; });
    } catch(e) { 
        setState(() => loading = false); 
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(title: const Text('My Visits')),
        drawer: const AppDrawer(),
        body: loading 
            ? const Center(child: CircularProgressIndicator())
            : visits!.isEmpty
                ? const Center(child: Text("No visits found."))
                : ListView.builder(
                    itemCount: visits!.length,
                    itemBuilder: (ctx, i) {
                        final v = visits![i];
                        return Card(
                            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                            child: ExpansionTile(
                                title: Text(v['visitDate'].toString().split('T')[0]),
                                subtitle: Text("Risk: ${v['prediction']?['riskLabel'] ?? 'N/A'}"),
                                children: [
                                    Padding(
                                        padding: const EdgeInsets.all(16),
                                        child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.stretch,
                                            children: [
                                                _item('HbA1c', v['metrics']['HbA1cLevel']),
                                                _item('Glucose', v['metrics']['bloodGlucoseLevel']),
                                                _item('BMI', v['metrics']['bmi']),
                                                const Divider(),
                                                const Text("Doctor Notes:", style: TextStyle(fontWeight: FontWeight.bold)),
                                                Text(v['notes'] ?? 'None'),
                                                const SizedBox(height: 8),
                                                const Text("Recommendations:", style: TextStyle(fontWeight: FontWeight.bold)),
                                                Text(v['recommendations'] ?? 'None'),
                                            ],
                                        ),
                                    )
                                ],
                            ),
                        );
                    }
                )
    );
  }

  Widget _item(String label, dynamic val) {
      return Padding(
          padding: const EdgeInsets.only(bottom: 4),
          child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                  Text(label),
                  Text(val?.toString() ?? '-', style: const TextStyle(fontWeight: FontWeight.bold)),
              ],
          ),
      );
  }
}
"""
}

# Create directories and write files
for path, content in files.items():
    # Ensure directory exists
    dir_name = os.path.dirname(path)
    if dir_name and not os.path.exists(dir_name):
        os.makedirs(dir_name)
    
    # Write file
    with open(path, "w", encoding="utf-8") as f:
        f.write(content.strip())
    
    print(f"Created: {path}")

print("\nSUCCESS! All Flutter files have been generated.")