import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import '../../core/providers/settings_provider.dart';
import '../../l10n/gen_l10n/app_localizations.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final settings = ref.watch(settingsProvider);
    final l10n = AppLocalizations.of(context)!;

    return Scaffold(
      appBar: AppBar(title: Text(l10n.settings), centerTitle: true),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Appearance Section
            _buildSectionTitle(context, l10n.appearance),
            const SizedBox(height: 12),
            ShadCard(
              child: Column(
                children: [
                  _buildSettingItem(
                    context,
                    icon: LucideIcons.palette,
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
                  const Divider(height: 1),
                  _buildSettingItem(
                    context,
                    icon: LucideIcons.languages,
                    title: l10n.language,
                    trailing: ShadSelect<Locale>(
                      placeholder: Text(l10n.selectLanguage),
                      initialValue: settings.locale,
                      onChanged: (value) {
                        if (value != null) {
                          ref.read(settingsProvider.notifier).setLocale(value);
                        }
                      },
                      selectedOptionBuilder: (context, value) {
                        return Text(value.languageCode == 'id' ? l10n.indonesian : l10n.english);
                      },
                      options: [
                        ShadOption(value: const Locale('id'), child: Text(l10n.indonesian)),
                        ShadOption(value: const Locale('en'), child: Text(l10n.english)),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 32),

            // About Section
            _buildSectionTitle(context, l10n.aboutSection),
            const SizedBox(height: 12),
            ShadCard(
              child: Column(
                children: [
                  _buildSettingItem(
                    context,
                    icon: LucideIcons.info,
                    title: l10n.appVersion,
                    trailing: const Text("1.0.0", style: TextStyle(color: Colors.grey)),
                  ),
                  const Divider(height: 1),
                  _buildSettingItem(context, icon: LucideIcons.heart, title: l10n.madeBy),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionTitle(BuildContext context, String title) {
    final theme = ShadTheme.of(context);
    return Padding(
      padding: const EdgeInsets.only(left: 4.0),
      child: Text(title.toUpperCase(), style: theme.textTheme.muted.copyWith(fontSize: 12, fontWeight: FontWeight.w700, letterSpacing: 1.2)),
    );
  }

  Widget _buildSettingItem(BuildContext context, {required IconData icon, required String title, Widget? trailing}) {
    final theme = ShadTheme.of(context);
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 10.0),
      child: Row(
        children: [
          Icon(icon, color: theme.colorScheme.primary, size: 20),
          const SizedBox(width: 12),
          Expanded(
            child: Text(title, style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 15)),
          ),
          if (trailing != null) trailing,
        ],
      ),
    );
  }
}
