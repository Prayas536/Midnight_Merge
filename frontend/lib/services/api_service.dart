import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter/foundation.dart';

class ApiService {
  // Use 10.0.2.2 for Android Emulator, localhost for iOS Simulator/Web
  // If testing on a real device, use your PC's local IP (e.g., http://192.168.1.5:5000/api)
  static String baseUrl = (dotenv.env['API_URL'] ?? 'https://diabetesprediction-production-6f63.up.railway.app/api')
      .replaceAll(RegExp(r'/$'), '');

  final Dio _dio = Dio(
    BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
    ),
  );

  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  ApiService() {
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await _storage.read(key: 'dpms_token');
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          debugPrint(
            '🌐 REQUEST: ${options.method} ${options.baseUrl}${options.path}',
          );
          return handler.next(options);
        },
        onError: (DioException e, handler) {
          debugPrint(
            '❌ ERROR: ${e.response?.statusCode} at ${e.requestOptions.baseUrl}${e.requestOptions.path}',
          );
          debugPrint('   Message: ${e.message}');
          return handler.next(e);
        },
      ),
    );
  }

  Dio get dio => _dio;
  FlutterSecureStorage get storage => _storage;
}
