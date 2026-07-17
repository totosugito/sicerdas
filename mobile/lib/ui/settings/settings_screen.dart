import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/core/providers/settings_provider.dart';
import 'package:bse/i18n/strings.g.dart';
import 'package:bse/core/services/version_service.dart';
import 'package:bse/widgets/confirmation_dialog.dart';
import 'package:bse/widgets/ads/ads_native.dart';
import 'package:bse/core/providers/package_info_provider.dart';
import 'package:bse/core/utils/toast_utils.dart';
import 'widgets/setting_item.dart';
import 'widgets/setting_section_title.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final settings = ref.watch(settingsProvider);
    final packageInfo = ref.watch(packageInfoProvider);
    final l10n = Translations.of(context);

    return Scaffold(
      appBar: AppBar(title: Text(l10n.common.settings), centerTitle: true),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Appearance Section
            SettingSectionTitle(title: l10n.common.appearance),
            const SizedBox(height: 12),
            ShadCard(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Column(
                children: [
                  SettingItem(
                    icon: LucideIcons.palette,
                    title: l10n.common.themeMode,
                    trailing: ShadSelect<ThemeMode>(
                      placeholder: Text(l10n.common.selectTheme),
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
                            return Text(l10n.common.system);
                          case ThemeMode.light:
                            return Text(l10n.common.light);
                          case ThemeMode.dark:
                            return Text(l10n.common.dark);
                        }
                      },
                      options: [
                        ShadOption(
                          value: ThemeMode.system,
                          child: Text(l10n.common.system),
                        ),
                        ShadOption(
                          value: ThemeMode.light,
                          child: Text(l10n.common.light),
                        ),
                        ShadOption(
                          value: ThemeMode.dark,
                          child: Text(l10n.common.dark),
                        ),
                      ],
                    ),
                  ),
                  const Divider(height: 1),
                  SettingItem(
                    icon: LucideIcons.languages,
                    title: l10n.common.language,
                    trailing: ShadSelect<Locale>(
                      placeholder: Text(l10n.common.selectLanguage),
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
                            Text(
                              isId
                                  ? l10n.common.indonesian
                                  : l10n.common.english,
                            ),
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
                              Text(l10n.common.indonesian),
                            ],
                          ),
                        ),
                        ShadOption(
                          value: const Locale('en'),
                          child: Row(
                            children: [
                              const Text('🇬🇧'),
                              const SizedBox(width: 8),
                              Text(l10n.common.english),
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
            SettingSectionTitle(title: l10n.common.aboutSection),
            const SizedBox(height: 12),
            ShadCard(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Column(
                children: [
                  SettingItem(
                    icon: LucideIcons.info,
                    title: l10n.common.appVersion,
                    trailing: packageInfo.when(
                      data: (info) => Text(
                        "${info.version}+${info.buildNumber}",
                        style: const TextStyle(color: Colors.grey),
                      ),
                      loading: () => const SizedBox(
                        width: 12,
                        height: 12,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      ),
                      error: (_, _) => const Text("—"),
                    ),
                  ),
                  const Divider(height: 1),
                  SettingItem(
                    icon: LucideIcons.heart,
                    title: l10n.common.madeBy,
                  ),
                ],
              ),
            ),

            const SizedBox(height: 32),

            const AdsNative(templateType: AdsTemplateType.small),

            const SizedBox(height: 8),

            // Danger Zone Section
            SettingSectionTitle(
              title: l10n.common.settingsDangerZone,
              isDanger: true,
            ),
            const SizedBox(height: 12),
            ShadCard(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Column(
                children: [
                  SettingItem(
                    icon: LucideIcons.databaseBackup,
                    title: l10n.common.settingsResetLibrary,
                    subtitle: l10n.common.settingsResetLibraryDescription,
                    isDanger: true,
                    onTap: () => _showResetConfirmation(context, ref),
                  ),
                  const Divider(height: 1),
                  SettingItem(
                    icon: LucideIcons.trophy,
                    title: l10n.common.settingsResetProgress,
                    subtitle: l10n.common.settingsResetProgressDescription,
                    isDanger: true,
                    onTap: () => _showResetProgressConfirmation(context, ref),
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
    final l10n = Translations.of(context);

    ConfirmationDialog.show(
      context,
      icon: LucideIcons.triangleAlert,
      title: l10n.common.settingsResetLibrary,
      description: l10n.common.settingsResetLibraryConfirm,
      confirmLabel: l10n.books.settingsResetAction,
      cancelLabel: l10n.common.cancel,
      onConfirm: () async {
        Navigator.of(context).pop(); // Close dialog
        await ref.read(versionServiceProvider).resetDatabase();
        if (context.mounted) {
          ToastUtils.showSuccess(
            context,
            title: l10n.common.successTitle,
            message: l10n.common.settingsResetLibrarySuccess,
          );
        }
      },
    );
  }

  void _showResetProgressConfirmation(BuildContext context, WidgetRef ref) {
    final l10n = Translations.of(context);

    ConfirmationDialog.show(
      context,
      icon: LucideIcons.triangleAlert,
      title: l10n.common.settingsResetProgress,
      description: l10n.common.settingsResetProgressConfirm,
      confirmLabel: l10n.books.settingsResetAction,
      cancelLabel: l10n.common.cancel,
      onConfirm: () async {
        Navigator.of(context).pop(); // Close dialog
        await ref.read(versionServiceProvider).resetUserProgress();
        if (context.mounted) {
          ToastUtils.showSuccess(
            context,
            title: l10n.common.successTitle,
            message: l10n.common.settingsResetProgressSuccess,
          );
        }
      },
    );
  }
}
