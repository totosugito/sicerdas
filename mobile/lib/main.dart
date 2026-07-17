import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:flutter/foundation.dart';
import 'package:logger/logger.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_crashlytics/firebase_crashlytics.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';
import 'core/providers/settings_provider.dart';
import 'core/config/env_config.dart';
import 'core/providers/dio_provider.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'i18n/strings.g.dart' as slang;
import 'ui/main_layout/main_layout.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize Firebase
  await Firebase.initializeApp();

  // Configure Firebase Crashlytics
  if (kDebugMode) {
    // Force disable Crashlytics collection while doing development
    await FirebaseCrashlytics.instance.setCrashlyticsCollectionEnabled(false);
  } else {
    // Enable Crashlytics collection in release/profile mode
    await FirebaseCrashlytics.instance.setCrashlyticsCollectionEnabled(true);
  }

  // Pass all uncaught "fatal" errors from the framework to Crashlytics
  FlutterError.onError = FirebaseCrashlytics.instance.recordFlutterFatalError;

  // Pass all uncaught asynchronous errors that aren't handled by the Flutter framework to Crashlytics
  PlatformDispatcher.instance.onError = (error, stack) {
    FirebaseCrashlytics.instance.recordError(error, stack, fatal: true);
    return true;
  };

  // Initialize shared preferences
  final sharedPrefs = await SharedPreferences.getInstance();

  // Load saved locale for slang initialization
  final languageCode = sharedPrefs.getString('locale') ?? 'id';
  slang.LocaleSettings.setLocaleRaw(languageCode);

  // Initialize Dio and Cookies
  final dio = await createDioInstance();

  // Set global logger level - disables logs in release mode
  Logger.level = kReleaseMode ? Level.off : Level.debug;

  runApp(
    slang.TranslationProvider(
      child: ProviderScope(
        overrides: [sharedPreferencesProvider.overrideWithValue(sharedPrefs), dioProvider.overrideWithValue(dio)],
        child: const MyApp(),
      ),
    ),
  );

  // Initialize non-blocking services asynchronously in the background
  MobileAds.instance.initialize();
  GoogleSignIn.instance.initialize(serverClientId: EnvConfig.googleWebClientId);
}

class MyApp extends ConsumerWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final settings = ref.watch(settingsProvider);

    return ShadApp(
      title: 'BSE App',
      theme: ShadThemeData(
        brightness: Brightness.light,
        colorScheme: const ShadZincColorScheme.light().copyWith(
          background: const Color(0xFFF8F9FA),
          foreground: const Color(0xFF444D55),
          card: Colors.white,
          cardForeground: const Color(0xFF444D55),
          popover: Colors.white,
          popoverForeground: const Color(0xFF444D55),
          primary: const Color(0xFF1D87E5),
          primaryForeground: Colors.white,
          secondary: const Color(0xFFE9ECEF),
          secondaryForeground: const Color(0xFF444D55),
          muted: const Color(0xFFE9ECEF),
          mutedForeground: const Color(0xFF90969A),
          accent: const Color(0xFFE2E8F0),
          accentForeground: const Color(0xFF444D55),
          destructive: const Color(0xFFEF4444),
          destructiveForeground: Colors.white,
          border: const Color(0xFFDEE2E6),
          input: const Color(0xFFE9ECEF),
          ring: const Color(0xFF1D87E5),
        ),
        accordionTheme: const ShadAccordionTheme(padding: EdgeInsets.symmetric(vertical: 6.0)),
      ),
      darkTheme: ShadThemeData(
        brightness: Brightness.dark,
        colorScheme: const ShadZincColorScheme.dark().copyWith(
          background: const Color(0xFF1A1C1E),
          foreground: const Color(0xFFF1F3F5),
          card: const Color(0xFF212529),
          cardForeground: const Color(0xFFE9ECEF),
          popover: const Color(0xFF212529),
          popoverForeground: const Color(0xFFE9ECEF),
          primary: const Color(0xFF1D87E5),
          primaryForeground: const Color(0xFFF1F3F5),
          secondary: const Color(0xFF2C3136),
          secondaryForeground: const Color(0xFFE9ECEF),
          muted: const Color(0xFF2C3136),
          mutedForeground: const Color(0xFFADB5BD),
          accent: const Color(0xFF343A40),
          accentForeground: const Color(0xFFE9ECEF),
          destructive: const Color(0xFFF87171),
          destructiveForeground: const Color(0xFFF1F3F5),
          border: const Color(0xFF343A40),
          input: const Color(0xFF2C3136),
          ring: const Color(0xFF1D87E5),
        ),
        accordionTheme: const ShadAccordionTheme(padding: EdgeInsets.symmetric(vertical: 6.0)),
      ),
      themeMode: settings.themeMode,
      locale: slang.TranslationProvider.of(context).locale.flutterLocale,
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: slang.AppLocaleUtils.supportedLocales,
      home: Builder(builder: (context) => const MainLayout()),
    );
  }
}
