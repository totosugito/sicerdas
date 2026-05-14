import 'package:flutter/foundation.dart';

class EnvConfig {
  static const String apiUrl = kReleaseMode
      ? 'https://api.sicerdas.com'
      : String.fromEnvironment(
          'API_URL',
          defaultValue: 'http://10.0.2.2:5550', // Use 10.0.2.2 for Android Emulator to reach host
        );

  static const String authCallbackScheme = 'fahim-edu-bse';
  static const String googleAuthUrl = '$apiUrl/api/auth/login/social?provider=google&callbackURL=$authCallbackScheme://auth-callback';

  // Required for Native Google Sign-In on Android to get an idToken
  // Using the original Web Client ID that works on the website
  static const String googleWebClientId = '11816434001-4a3b0qpvsdtfq3347vjnu110cp704t0p.apps.googleusercontent.com';
}
