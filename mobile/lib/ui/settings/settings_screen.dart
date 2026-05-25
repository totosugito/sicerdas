import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import '../../core/providers/settings_provider.dart';
import '../../l10n/gen_l10n/app_localizations.dart';
import '../../core/services/version_service.dart';
import '../widgets/confirmation_dialog.dart';

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
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
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
                          ref
                              .read(settingsProvider.notifier)
                              .setThemeMode(value);
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
                        ShadOption(
                          value: ThemeMode.system,
                          child: Text(l10n.system),
                        ),
                        ShadOption(
                          value: ThemeMode.light,
                          child: Text(l10n.light),
                        ),
                        ShadOption(
                          value: ThemeMode.dark,
                          child: Text(l10n.dark),
                        ),
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
                        final isId = value.languageCode == 'id';
                        return Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(isId ? '🇮🇩' : '🇬🇧'),
                            const SizedBox(width: 8),
                            Text(isId ? l10n.indonesian : l10n.english),
                          ],
                        );
                      },
                      options: [
                        ShadOption(
                          value: const Locale('id'),
                          child: Row(
                            children: [
                              const Text('🇮🇩'),
                              const SizedBox(width: 8),
                              Text(l10n.indonesian),
                            ],
                          ),
                        ),
                        ShadOption(
                          value: const Locale('en'),
                          child: Row(
                            children: [
                              const Text('🇬🇧'),
                              const SizedBox(width: 8),
                              Text(l10n.english),
                            ],
                          ),
                        ),
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
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Column(
                children: [
                  _buildSettingItem(
                    context,
                    icon: LucideIcons.info,
                    title: l10n.appVersion,
                    trailing: const Text(
                      "1.0.0",
                      style: TextStyle(color: Colors.grey),
                    ),
                  ),
                  const Divider(height: 1),
                  _buildSettingItem(
                    context,
                    icon: LucideIcons.heart,
                    title: l10n.madeBy,
                  ),
                ],
              ),
            ),

            const SizedBox(height: 32),

            // Danger Zone Section
            _buildSectionTitle(
              context,
              l10n.settingsDangerZone,
              isDanger: true,
            ),
            const SizedBox(height: 12),
            ShadCard(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Column(
                children: [
                  _buildSettingItem(
                    context,
                    icon: LucideIcons.databaseBackup,
                    title: l10n.settingsResetLibrary,
                    subtitle: l10n.settingsResetLibraryDescription,
                    isDanger: true,
                    onTap: () => _showResetConfirmation(context, ref),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  void _showResetConfirmation(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context)!;

    ConfirmationDialog.show(
      context,
      icon: LucideIcons.triangleAlert,
      title: l10n.settingsResetLibrary,
      description: l10n.settingsResetLibraryConfirm,
      confirmLabel: l10n.settingsResetAction,
      cancelLabel: l10n.cancel,
      onConfirm: () async {
        Navigator.of(context).pop(); // Close dialog
        Navigator.of(context).pop(); // Go back to profile/main
        await ref.read(versionServiceProvider).resetDatabase();
      },
    );
  }

  Widget _buildSectionTitle(
    BuildContext context,
    String title, {
    bool isDanger = false,
  }) {
    final theme = ShadTheme.of(context);
    return Padding(
      padding: const EdgeInsets.only(left: 4.0),
      child: Text(
        title.toUpperCase(),
        style: theme.textTheme.muted.copyWith(
          fontSize: 12,
          fontWeight: FontWeight.w700,
          letterSpacing: 1.2,
          color: isDanger ? theme.colorScheme.destructive : null,
        ),
      ),
    );
  }

  Widget _buildSettingItem(
    BuildContext context, {
    required IconData icon,
    required String title,
    String? subtitle,
    Widget? trailing,
    bool isDanger = false,
    VoidCallback? onTap,
  }) {
    final theme = ShadTheme.of(context);
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        constraints: const BoxConstraints(minHeight: 52),
        padding: const EdgeInsets.symmetric(vertical: 6.0),
        child: Row(
          children: [
            Icon(
              icon,
              color: isDanger
                  ? theme.colorScheme.destructive
                  : theme.colorScheme.primary,
              size: 20,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontWeight: FontWeight.w500,
                      fontSize: 15,
                      color: isDanger ? theme.colorScheme.destructive : null,
                    ),
                  ),
                  if (subtitle != null)
                    Text(
                      subtitle,
                      style: theme.textTheme.muted.copyWith(fontSize: 12),
                    ),
                ],
              ),
            ),
            trailing ?? const SizedBox.shrink(),
          ],
        ),
      ),
    );
  }
}
