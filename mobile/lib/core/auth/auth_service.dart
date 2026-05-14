import 'package:dio/dio.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:logger/logger.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../config/env_config.dart';
import '../providers/settings_provider.dart';
import '../providers/dio_provider.dart';
import '../auth/auth_notifier.dart';
import '../models/user_model.dart';

class AuthService {
  final Dio _dio;
  final SharedPreferences _prefs;
  final _logger = Logger(printer: PrettyPrinter(methodCount: 0));

  static const String _authKey = 'is_authenticated';
  static const String _userKey = 'cached_user';

  AuthService(this._dio, this._prefs);

  Future<bool> checkAuthStatus() async {
    try {
      final response = await _dio.get('/api/auth/get-session');
      final isAuthenticated = response.statusCode == 200 && response.data != null;
      
      if (isAuthenticated && response.data['user'] != null) {
        // 💾 Cache user data
        final user = UserModel.fromMap(response.data['user']);
        await _prefs.setString(_userKey, user.toJson());
      }
      
      await _prefs.setBool(_authKey, isAuthenticated);
      return isAuthenticated;
    } on DioException catch (e) {
      if (e.type == DioExceptionType.connectionError ||
          e.type == DioExceptionType.connectionTimeout ||
          e.type == DioExceptionType.receiveTimeout) {
        return _prefs.getBool(_authKey) ?? false;
      }
      await _prefs.setBool(_authKey, false);
      return false;
    } catch (e) {
      return false;
    }
  }

  Future<bool> signInWithGoogle() async {
    try {
      final googleUser = await GoogleSignIn.instance.authenticate();
      final googleAuth = googleUser.authentication;
      final idToken = googleAuth.idToken;

      if (idToken == null) return false;

      final response = await _dio.post(
        '/api/auth/sign-in/social',
        data: {
          'provider': 'google',
          'idToken': {'token': idToken},
          'callbackURL': EnvConfig.apiUrl,
        },
      );

      final success = response.statusCode == 200;
      if (success && response.data['user'] != null) {
        // 💾 Cache user data
        final user = UserModel.fromMap(response.data['user']);
        await _prefs.setString(_userKey, user.toJson());
        await _prefs.setBool(_authKey, true);
      }
      return success;
    } catch (e) {
      _logger.e('Error during Google Sign-In: $e');
      return false;
    }
  }

  UserModel? getCachedUser() {
    final userJson = _prefs.getString(_userKey);
    if (userJson == null) return null;
    try {
      return UserModel.fromJson(userJson);
    } catch (e) {
      return null;
    }
  }

  Future<void> signOut() async {
    try {
      await _dio.post('/api/auth/sign-out', data: {});
    } catch (e) {
      _logger.e('Error during Sign-Out: $e');
    } finally {
      await _prefs.setBool(_authKey, false);
      await _prefs.remove(_userKey); // Clear user cache on logout
      await GoogleSignIn.instance.signOut();
    }
  }
}

final authServiceProvider = Provider<AuthService>((ref) {
  final prefs = ref.watch(sharedPreferencesProvider);
  return AuthService(ref.watch(dioProvider), prefs);
});

// A provider to easily access the current user across the app
final currentUserProvider = Provider<UserModel?>((ref) {
  final authService = ref.watch(authServiceProvider);
  final isAuthenticated = ref.watch(authStateProvider);
  
  if (!isAuthenticated) return null;
  return authService.getCachedUser();
});
