import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/app_settings.dart';

class SettingsState {
  final ThemeMode themeMode;
  final Locale locale;
  final String periodicTheme;

  SettingsState({
    required this.themeMode,
    required this.locale,
    required this.periodicTheme,
  });

  SettingsState copyWith({
    ThemeMode? themeMode,
    Locale? locale,
    String? periodicTheme,
  }) {
    return SettingsState(
      themeMode: themeMode ?? this.themeMode,
      locale: locale ?? this.locale,
      periodicTheme: periodicTheme ?? this.periodicTheme,
    );
  }
}

// Provider for SharedPreferences - initialized in main()
final sharedPreferencesProvider = Provider<SharedPreferences>((ref) {
  throw UnimplementedError();
});

class SettingsNotifier extends Notifier<SettingsState> {
  static const _themeKey = 'theme_mode';
  static const _localeKey = 'locale';
  static const _periodicThemeKey = 'periodic_table_theme';

  @override
  SettingsState build() {
    final prefs = ref.watch(sharedPreferencesProvider);

    // Load saved theme
    final themeIndex = prefs.getInt(_themeKey);
    final themeMode = themeIndex != null ? ThemeMode.values[themeIndex] : ThemeMode.system;

    // Load saved locale
    final languageCode = prefs.getString(_localeKey) ?? 'id';
    final locale = Locale(languageCode);

    // Load saved periodic theme
    final periodicTheme = prefs.getString(_periodicThemeKey) ?? 'theme1';

    return SettingsState(
      themeMode: themeMode,
      locale: locale,
      periodicTheme: periodicTheme,
    );
  }

  void setThemeMode(ThemeMode mode) {
    state = state.copyWith(themeMode: mode);
    ref.read(sharedPreferencesProvider).setInt(_themeKey, mode.index);
  }

  void setLocale(Locale locale) {
    state = state.copyWith(locale: locale);
    ref.read(sharedPreferencesProvider).setString(_localeKey, locale.languageCode);
  }

  void setPeriodicTheme(String theme) {
    state = state.copyWith(periodicTheme: theme);
    ref.read(sharedPreferencesProvider).setString(_periodicThemeKey, theme);
  }
}

final settingsProvider = NotifierProvider<SettingsNotifier, SettingsState>(() {
  return SettingsNotifier();
});

final cloudUrlProvider = Provider<String>((ref) {
  final settings = ref.watch(appSettingsProvider);
  return settings?.cloudUrl ?? '';
});

final appSettingsProvider = Provider<AppSettings?>((ref) {
  final prefs = ref.watch(sharedPreferencesProvider);
  final settingsJson = prefs.getString('app_settings');
  if (settingsJson == null) return null;
  
  try {
    final Map<String, dynamic> data = Map<String, dynamic>.from(
      jsonDecode(settingsJson) as Map,
    );
    return AppSettings.fromJson(data);
  } catch (e) {
    return null;
  }
});
