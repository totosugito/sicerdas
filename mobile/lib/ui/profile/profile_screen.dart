import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:bse/core/auth/auth_notifier.dart';
import 'package:bse/core/auth/auth_service.dart';
import 'package:bse/i18n/strings.g.dart';
import 'package:bse/widgets/confirmation_dialog.dart';
import '../auth/sign_in_screen.dart';
import '../settings/settings_screen.dart';
import '../privacy_policy/privacy_policy_screen.dart';
import '../help_support/help_support_screen.dart';
import 'package:bse/core/config/env_config.dart';
import 'package:url_launcher/url_launcher.dart';
import 'widgets/account_settings_screen.dart';
import 'package:bse/core/providers/achievements_provider.dart';
import 'package:bse/ui/math_master/achievement/ui_mm_achievement.dart';
import 'package:bse/ui/math_tricks/achievement/tricks_achievement.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = Translations.of(context);
    final isLoggedIn = ref.watch(authStateProvider);
    final currentUser = ref.watch(currentUserProvider);
    final achievementsAsync = ref.watch(userAchievementsProvider);
    final theme = ShadTheme.of(context);

    final String? userImageUrl = currentUser?.image != null
        ? currentUser!.image!
              .replaceAll('127.0.0.1', '10.0.2.2')
              .replaceAll('localhost', '10.0.2.2')
        : null;

    return Scaffold(
      appBar: AppBar(title: Text(l10n.common.nav.profile), centerTitle: true),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            // User Profile Header
            const SizedBox(height: 20),
            Center(
              child: Column(
                children: [
                  Container(
                    width: 100,
                    height: 100,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: theme.colorScheme.muted,
                      border: Border.all(
                        color: theme.colorScheme.primary.withValues(alpha: 0.2),
                        width: 4,
                      ),
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(50),
                      child: userImageUrl != null
                          ? CachedNetworkImage(
                              imageUrl: userImageUrl,
                              fit: BoxFit.cover,
                              placeholder: (context, url) => const Center(
                                child: CircularProgressIndicator(),
                              ),
                              errorWidget: (context, url, error) => Icon(
                                LucideIcons.user,
                                size: 50,
                                color: theme.colorScheme.mutedForeground,
                              ),
                            )
                          : Icon(
                              LucideIcons.user,
                              size: 50,
                              color: theme.colorScheme.mutedForeground,
                            ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    currentUser?.name ?? l10n.auth.notLoggedIn,
                    style: theme.textTheme.h4.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  if (currentUser != null)
                    Text(currentUser.email, style: theme.textTheme.muted),
                ],
              ),
            ),
            const SizedBox(height: 40),

            // Learning Achievements & Stats Section
            _buildSectionTitle(context, l10n.math_master.achievements),
            achievementsAsync.when(
              data: (stats) => ShadCard(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: Column(
                  children: [
                    _buildProfileItem(
                      context,
                      icon: LucideIcons.trophy,
                      iconColor: Colors.amber,
                      title: 'Math Master',
                      subtitle: '${stats.mathMasterCorrect} ${l10n.math_tricks.achievement.correct}',
                      onTap: () => UiMmAchievement.navigate(context),
                    ),
                    const Divider(height: 1),
                    _buildProfileItem(
                      context,
                      icon: LucideIcons.star,
                      iconColor: Colors.orange,
                      title: 'Math Tricks',
                      subtitle: '${stats.mathTricksStarsEarned} ⭐',
                      onTap: () => TricksAchievementScreen.navigate(context),
                    ),
                  ],
                ),
              ),
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (err, stack) => const SizedBox.shrink(),
            ),
            const SizedBox(height: 32),

            // Settings Group
            _buildSectionTitle(context, l10n.common.settings),
            ShadCard(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Column(
                children: [
                  _buildProfileItem(
                    context,
                    icon: LucideIcons.user,
                    title: l10n.common.accountSettings,
                    onTap: () {
                      if (isLoggedIn) {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => const AccountSettingsScreen(),
                          ),
                        );
                      } else {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => const SignInScreen(),
                          ),
                        );
                      }
                    },
                  ),
                  const Divider(height: 1),
                  _buildProfileItem(
                    context,
                    icon: LucideIcons.settings,
                    title: l10n.common.settings,
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const SettingsScreen(),
                        ),
                      );
                    },
                  ),
                  const Divider(height: 1),
                  _buildProfileItem(
                    context,
                    icon: LucideIcons.info,
                    title: l10n.common.helpSupport,
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const HelpSupportScreen(),
                        ),
                      );
                    },
                  ),
                  const Divider(height: 1),
                  _buildProfileItem(
                    context,
                    icon: LucideIcons.shieldCheck,
                    title: l10n.common.privacyPolicy,
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const PrivacyPolicyScreen(),
                        ),
                      );
                    },
                  ),
                  const Divider(height: 1),
                  _buildProfileItem(
                    context,
                    icon: LucideIcons.globe,
                    title: l10n.common.visitWebsite,
                    onTap: () async {
                      final url = Uri.parse(EnvConfig.websiteUrl);
                      if (await canLaunchUrl(url)) {
                        await launchUrl(url, mode: LaunchMode.externalApplication);
                      }
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),

            // Logout/Login Button
            if (isLoggedIn)
              SizedBox(
                width: double.infinity,
                child: ShadButton.destructive(
                  leading: const Icon(LucideIcons.logOut, size: 18),
                  child: Text(l10n.auth.logout),
                  onPressed: () => _handleLogout(context, ref, l10n),
                ),
              )
            else
              SizedBox(
                width: double.infinity,
                child: ShadButton(
                  leading: const Icon(LucideIcons.logIn, size: 18),
                  child: Text(l10n.auth.login.button),
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const SignInScreen(),
                      ),
                    );
                  },
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionTitle(BuildContext context, String title) {
    final theme = ShadTheme.of(context);
    return Align(
      alignment: Alignment.centerLeft,
      child: Padding(
        padding: const EdgeInsets.only(left: 4.0, bottom: 12.0),
        child: Text(
          title.toUpperCase(),
          style: theme.textTheme.muted.copyWith(
            fontSize: 12,
            fontWeight: FontWeight.w700,
            letterSpacing: 1.2,
          ),
        ),
      ),
    );
  }

  Widget _buildProfileItem(
    BuildContext context, {
    required IconData icon,
    required String title,
    String? subtitle,
    Color? iconColor,
    required VoidCallback onTap,
  }) {
    final theme = ShadTheme.of(context);
    return Material(
      type: MaterialType.transparency,
      child: ListTile(
        leading: Icon(icon, color: iconColor ?? theme.colorScheme.primary, size: 20),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.w500)),
        subtitle: subtitle != null ? Text(subtitle, style: theme.textTheme.muted.copyWith(fontSize: 12)) : null,
        trailing: const Icon(LucideIcons.chevronRight, size: 16),
        onTap: onTap,
      ),
    );
  }

  void _handleLogout(BuildContext context, WidgetRef ref, Translations l10n) {
    ConfirmationDialog.show(
      context,
      icon: LucideIcons.logOut,
      title: l10n.auth.logout,
      description: l10n.auth.logoutConfirm,
      confirmLabel: l10n.auth.logout,
      cancelLabel: l10n.common.cancel,
      isDestructive: true,
      onConfirm: () async {
        Navigator.pop(context);
        await ref.read(authStateProvider.notifier).signOut();
      },
    );
  }
}
