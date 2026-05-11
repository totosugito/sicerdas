import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'l10n/gen_l10n/bse2_localizations.dart';
import 'ui/home/home_screen.dart';
void main() {
  runApp(
    const ProviderScope(
      child: MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ShadApp(
      title: 'BSE App',
      theme: ShadThemeData(
        brightness: Brightness.light,
        colorScheme: const ShadZincColorScheme.light(),
      ),
      darkTheme: ShadThemeData(
        brightness: Brightness.dark,
        colorScheme: const ShadZincColorScheme.dark(),
      ),
      themeMode: ThemeMode.system,
      localizationsDelegates: Bse2Localizations.localizationsDelegates,
      supportedLocales: Bse2Localizations.supportedLocales,
      home: const HomeScreen(),
    );
  }
}
