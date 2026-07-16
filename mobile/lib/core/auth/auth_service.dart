import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:logger/logger.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../providers/dio_provider.dart';
import '../providers/settings_provider.dart';
import '../models/user_model.dart';
import '../network/api_endpoints.dart';
import 'auth_notifier.dart';

class AuthService {
  final Dio _dio;
  final SharedPreferences _prefs;
  final Ref _ref;
  final _logger = Logger(printer: PrettyPrinter(methodCount: 0));

  static const String _authKey = 'is_authenticated';
  static const String _userKey = 'cached_user';

  AuthService(this._dio, this._prefs, this._ref);

  Future<void> _updateAppSettingsShowAds(bool showAds) async {
    final settingsJson = _prefs.getString('app_settings');
    Map<String, dynamic> data = {};
    if (settingsJson != null) {
      try {
        data = Map<String, dynamic>.from(jsonDecode(settingsJson) as Map);
      } catch (_) {}
    }
    final Map<String, dynamic> adsMap = data['ads'] != null
        ? Map<String, dynamic>.from(data['ads'] as Map)
        : <String, dynamic>{};
    adsMap['enabled'] = showAds;
    data['ads'] = adsMap;

    final jsonStr = jsonEncode(data);
    await _prefs.setString('app_settings', jsonStr);
    _ref.invalidate(appSettingsProvider);
  }

  Future<bool> checkAuthStatus() async {
    try {
      final response = await _dio.get(ApiEndpoints.getSession);
      final isAuthenticated =
          response.statusCode == 200 && response.data != null;

      if (isAuthenticated && response.data['user'] != null) {
        // 💾 Cache user data
        final user = UserModel.fromMap(response.data['user']);
        await _prefs.setString(_userKey, user.toJson());
        await _updateAppSettingsShowAds(user.showAds);
      } else {
        await _updateAppSettingsShowAds(true);
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
      await _updateAppSettingsShowAds(true);
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
        ApiEndpoints.signInSocial,
        data: {
          'provider': 'google',
          'idToken': {'token': idToken},
        },
      );

      final success = response.statusCode == 200;
      if (success && response.data['user'] != null) {
        // 💾 Cache user data
        final user = UserModel.fromMap(response.data['user']);
        await _prefs.setString(_userKey, user.toJson());
        await _prefs.setBool(_authKey, true);
        await _updateAppSettingsShowAds(user.showAds);
      }
      return success;
    } catch (e) {
      _logger.e('Error during Google Sign-In: $e');
      return false;
    }
  }

  Future<bool> signInWithEmailAndPassword(String email, String password) async {
    try {
      final response = await _dio.post(
        ApiEndpoints.signInEmail,
        data: FormData.fromMap({'email': email, 'password': password}),
        options: Options(contentType: 'multipart/form-data'),
      );

      final success = response.statusCode == 200;
      if (success && response.data['user'] != null) {
        // 💾 Cache user data
        final user = UserModel.fromMap(response.data['user']);
        await _prefs.setString(_userKey, user.toJson());
        await _prefs.setBool(_authKey, true);
        await _updateAppSettingsShowAds(user.showAds);
      }
      return success;
    } catch (e) {
      _logger.e('Error during Credentials Sign-In: $e');
      rethrow;
    }
  }

  Future<bool> signUpWithEmailAndPassword(
    String name,
    String email,
    String password,
  ) async {
    try {
      final response = await _dio.post(
        ApiEndpoints.signUpEmail,
        data: {'name': name, 'email': email, 'password': password},
      );
      return response.statusCode == 200 || response.statusCode == 201;
    } catch (e) {
      _logger.e('Error during Credentials Sign-Up: $e');
      rethrow;
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

  Future<UserModel?> fetchUserProfile() async {
    try {
      final response = await _dio.get(ApiEndpoints.userDetails);
      if (response.statusCode == 200 &&
          response.data != null &&
          response.data['data'] != null) {
        final user = UserModel.fromMap(response.data['data']);
        await _prefs.setString(_userKey, user.toJson());
        await _updateAppSettingsShowAds(user.showAds);
        return user;
      }
    } catch (e) {
      _logger.e('Error fetching user profile: $e');
    }
    return null;
  }

  Future<UserModel?> updateProfile({
    required String name,
    String? school,
    String? educationLevel,
    String? grade,
    String? phone,
    String? address,
    String? bio,
    String? dateOfBirth,
  }) async {
    try {
      final data = <String, dynamic>{'name': name};
      if (school != null) data['school'] = school;
      if (educationLevel != null) data['educationLevel'] = educationLevel;
      if (grade != null) data['grade'] = grade;
      if (phone != null) data['phone'] = phone;
      if (address != null) data['address'] = address;
      if (bio != null) data['bio'] = bio;
      if (dateOfBirth != null) data['dateOfBirth'] = dateOfBirth;

      final response = await _dio.put(
        ApiEndpoints.userUpdate,
        data: FormData.fromMap(data),
        options: Options(contentType: 'multipart/form-data'),
      );

      if (response.statusCode == 200 &&
          response.data != null &&
          response.data['data'] != null) {
        final user = UserModel.fromMap(response.data['data']);
        await _prefs.setString(_userKey, user.toJson());
        await _updateAppSettingsShowAds(user.showAds);
        return user;
      }
    } catch (e) {
      _logger.e('Error updating profile: $e');
    }
    return null;
  }

  Future<(bool, String)> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    try {
      final response = await _dio.put(
        ApiEndpoints.userChangePassword,
        data: {'currentPassword': currentPassword, 'newPassword': newPassword},
      );
      final data = response.data;
      final message = (data is Map && data['message'] != null)
          ? data['message'].toString()
          : 'Password changed successfully';
      return (
        response.statusCode == 200 || response.statusCode == 201,
        message,
      );
    } catch (e) {
      _logger.e('Error changing password: $e');
      String errorMessage = 'Failed to change password';
      if (e is DioException) {
        final data = e.response?.data;
        if (data is Map && data['message'] != null) {
          errorMessage = data['message'].toString();
        }
      }
      return (false, errorMessage);
    }
  }

  Future<void> signOut() async {
    try {
      await _dio.post(ApiEndpoints.signOut, data: {});
    } catch (e) {
      _logger.e('Error during Sign-Out: $e');
    } finally {
      await _prefs.setBool(_authKey, false);
      await _prefs.remove(_userKey); // Clear user cache on logout
      await _updateAppSettingsShowAds(true); // Restore ads for guest
      await GoogleSignIn.instance.signOut();
    }
  }
}

final authServiceProvider = Provider<AuthService>((ref) {
  final prefs = ref.watch(sharedPreferencesProvider);
  return AuthService(ref.watch(dioProvider), prefs, ref);
});

// A provider to easily access the current user across the app
final currentUserProvider = NotifierProvider<CurrentUserNotifier, UserModel?>(
  CurrentUserNotifier.new,
);

class CurrentUserNotifier extends Notifier<UserModel?> {
  @override
  UserModel? build() {
    final authService = ref.watch(authServiceProvider);
    final isAuthenticated = ref.watch(authStateProvider);

    if (!isAuthenticated) return null;
    return authService.getCachedUser();
  }

  void refresh() {
    ref.invalidateSelf();
  }

  void update(UserModel user) {
    state = user;
  }
}
