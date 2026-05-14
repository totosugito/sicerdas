import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import '../../core/providers/settings_provider.dart';
import '../../l10n/gen_l10n/bse2_localizations.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final settings = ref.watch(settingsProvider);
    final theme = ShadTheme.of(context);
    final l10n = Bse2Localizations.of(context)!;

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.settings),
        backgroundColor: Colors.transparent,
        elevation: 0,
        foregroundColor: theme.colorScheme.foreground,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16.0),
        children: [
          _buildSectionHeader(l10n.appearance),
          ShadCard(
            child: Column(
              children: [
                _buildSettingItem(
                  title: l10n.themeMode,
                  trailing: ShadSelect<ThemeMode>(
                    placeholder: Text(l10n.selectTheme),
                    initialValue: settings.themeMode,
                    onChanged: (value) {
                      if (value != null) {
                        ref.read(settingsProvider.notifier).setThemeMode(value);
                      }
                    },
                    selectedOptionBuilder: (context, value) {
                      switch (value) {
                        case ThemeMode.system:
                          return Text(l10n.system);
                        case ThemeMode.light:
                          return Text(l10n.light);
                        case ThemeMode.dark:
                          return Text(l10n.dark);
                      }
                    },
                    options: [
                      ShadOption(value: ThemeMode.system, child: Text(l10n.system)),
                      ShadOption(value: ThemeMode.light, child: Text(l10n.light)),
                      ShadOption(value: ThemeMode.dark, child: Text(l10n.dark)),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          _buildSectionHeader(l10n.language),
          ShadCard(
            child: Column(
              children: [
                _buildSettingItem(
                  title: l10n.language,
                  trailing: ShadSelect<String>(
                    placeholder: Text(l10n.selectLanguage),
                    initialValue: settings.locale.languageCode,
                    onChanged: (value) {
                      if (value != null) {
                        ref.read(settingsProvider.notifier).setLocale(Locale(value));
                      }
                    },
                    selectedOptionBuilder: (context, value) => Text(value == 'id' ? l10n.indonesian : l10n.english),
                    options: [
                      ShadOption(value: 'id', child: Text(l10n.indonesian)),
                      ShadOption(value: 'en', child: Text(l10n.english)),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(left: 4, bottom: 8),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.bold,
          color: Colors.grey,
        ),
      ),
    );
  }

  Widget _buildSettingItem({required String title, required Widget trailing}) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            title,
            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
          ),
          trailing,
        ],
      ),
    );
  }
}
