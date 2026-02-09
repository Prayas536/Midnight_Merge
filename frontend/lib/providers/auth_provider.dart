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
      if (res.data['data'] != null && res.data['data']['user'] != null) {
        _user = res.data['data']['user'];
      } else if (res.data['user'] != null) {
        _user = res.data['user'];
      } else {
        _user = null;
      }
    } catch (e) {
      _user = null;
      try {
        await _apiService.storage.delete(key: 'dpms_token');
      } catch (_) {}
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> loginDoctor(String email, String password) async {
    final res = await _apiService.dio.post(
      '/auth/login',
      data: {'email': email, 'password': password},
    );
    await _handleAuthResponse(res);
  }

  Future<void> loginPatient(String patientId, String password) async {
    final res = await _apiService.dio.post(
      '/auth/login-patient',
      data: {'patientId': patientId, 'password': password},
    );
    await _handleAuthResponse(res);
  }

  Future<void> registerDoctor(
    String name,
    String email,
    String password,
    String medicalLicense,
    String specialization,
  ) async {
    final res = await _apiService.dio.post(
      '/auth/register-doctor',
      data: {
        'name': name,
        'email': email,
        'password': password,
        'medicalLicense': medicalLicense,
        'specialization': specialization,
      },
    );
    await _handleAuthResponse(res);
  }

  Future<void> _handleAuthResponse(dynamic res) async {
    try {
      final token = res.data['data']['token'];
      if (token != null && token.isNotEmpty) {
        await _apiService.storage.write(key: 'dpms_token', value: token);
        await fetchMe();
      } else {
        throw Exception('No token received from server');
      }
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      rethrow;
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
