import 'package:dio/dio.dart';
import 'package:dio_cookie_manager/dio_cookie_manager.dart';
import 'package:cookie_jar/cookie_jar.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:path_provider/path_provider.dart';
import 'package:logger/logger.dart';
import '../config/env_config.dart';

final authServiceProvider = Provider<AuthService>((ref) {
  return AuthService();
});

class AuthService {
  final _logger = Logger(
    printer: PrettyPrinter(methodCount: 0),
  );
  Dio? _dio;
  PersistCookieJar? _cookieJar;

  Future<Dio> get dio async {
    if (_dio == null) {
      await _init();
    }
    return _dio!;
  }

  Future<void> _init() async {
    final appDocDir = await getApplicationDocumentsDirectory();
    _cookieJar = PersistCookieJar(
      storage: FileStorage("${appDocDir.path}/.cookies/"),
    );
    
    _dio = Dio(BaseOptions(
      baseUrl: EnvConfig.apiUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
    ));
    
    _dio!.interceptors.add(CookieManager(_cookieJar!));
    
    // Add logger for debugging
    _dio!.interceptors.add(LogInterceptor(
      requestBody: true,
      responseBody: true,
    ));
  }

  Future<bool> signInWithGoogle() async {
    try {
      // Use the instance initialized in main()
      final googleSignIn = GoogleSignIn.instance;
      
      // Use the modern authenticate() method from the official example
      final GoogleSignInAccount googleUser = await googleSignIn.authenticate();

      final GoogleSignInAuthentication googleAuth = googleUser.authentication;
      final String? idToken = googleAuth.idToken;

      if (idToken == null) {
        _logger.e('Failed to get ID Token from Google');
        return false;
      }

      _logger.i('Sending ID Token to backend...');

      // Send the idToken to Better Auth
      final dioInstance = await dio;
      final response = await dioInstance.post(
        '/api/auth/sign-in/social',
        data: {
          'provider': 'google',
          'idToken': {
            'token': idToken,
          },
          'callbackURL': 'http://10.0.2.2:5550',
        },
        options: Options(
          headers: {
            'Content-Type': 'application/json',
            'Origin': 'http://10.0.2.2:5550',
          },
        ),
      );

      if (response.statusCode == 200) {
        _logger.i('Login successful, checking session...');
        return await checkAuthStatus();
      }
      
      _logger.e('Backend login failed: ${response.statusCode}');
      if (response.data != null) {
        _logger.e('Response data: ${response.data}');
      }
      return false;
    } catch (e) {
      if (e is DioException && e.response != null) {
        _logger.e('Dio Error Data: ${e.response?.data}');
      }
      _logger.e('Auth error', error: e);
      return false;
    }
  }

  Future<bool> checkAuthStatus() async {
    try {
      final dioInstance = await dio;
      final response = await dioInstance.get(
        '/api/auth/get-session',
        options: Options(
          headers: {
            'Origin': 'http://10.0.2.2:5550',
          },
        ),
      );
      return response.statusCode == 200 && response.data != null;
    } catch (e) {
      return false;
    }
  }

  Future<void> signOut() async {
    try {
      final dioInstance = await dio;
      await dioInstance.post(
        '/api/auth/sign-out',
        options: Options(
          headers: {
            'Origin': 'http://10.0.2.2:5550',
          },
        ),
      );
      await _cookieJar?.deleteAll();
    } catch (e) {
      _logger.e('Sign out error', error: e);
    }
  }
}
