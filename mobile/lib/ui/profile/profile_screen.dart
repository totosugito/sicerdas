import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:bse/core/auth/auth_notifier.dart';
import 'package:bse/core/auth/auth_service.dart';
import 'package:bse/l10n/gen_l10n/app_localizations.dart';
import 'package:bse/widgets/confirmation_dialog.dart';
import '../auth/sign_in_screen.dart';
import '../settings/settings_screen.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context)!;
    final isLoggedIn = ref.watch(authStateProvider);
    final currentUser = ref.watch(currentUserProvider);
    final theme = ShadTheme.of(context);

    return Scaffold(
      appBar: AppBar(title: Text(l10n.navProfile), centerTitle: true),
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
                      child: currentUser?.image != null
                          ? CachedNetworkImage(
                              imageUrl: currentUser!.image!,
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
                    currentUser?.name ?? l10n.notLoggedIn,
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

            // Settings Group
            ShadCard(
              child: Column(
                children: [
                  _buildProfileItem(
                    context,
                    icon: LucideIcons.user,
                    title: l10n.accountSettings,
                    onTap: () {},
                  ),
                  const Divider(height: 1),
                  _buildProfileItem(
                    context,
                    icon: LucideIcons.settings,
                    title: l10n.settings,
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
                    title: l10n.helpSupport,
                    onTap: () {},
                  ),
                  const Divider(height: 1),
                  _buildProfileItem(
                    context,
                    icon: LucideIcons.shieldCheck,
                    title: l10n.privacyPolicy,
                    onTap: () {},
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
                  child: Text(l10n.logout),
                  onPressed: () => _handleLogout(context, ref, l10n),
                ),
              )
            else
              SizedBox(
                width: double.infinity,
                child: ShadButton(
                  leading: const Icon(LucideIcons.logIn, size: 18),
                  child: Text(l10n.loginButton),
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

  Widget _buildProfileItem(
    BuildContext context, {
    required IconData icon,
    required String title,
    required VoidCallback onTap,
  }) {
    final theme = ShadTheme.of(context);
    return Material(
      type: MaterialType.transparency,
      child: ListTile(
        leading: Icon(icon, color: theme.colorScheme.primary, size: 20),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.w500)),
        trailing: const Icon(LucideIcons.chevronRight, size: 16),
        onTap: onTap,
      ),
    );
  }

  void _handleLogout(
    BuildContext context,
    WidgetRef ref,
    AppLocalizations l10n,
  ) {
    ConfirmationDialog.show(
      context,
      icon: LucideIcons.logOut,
      title: l10n.logout,
      description: l10n.logoutConfirm,
      confirmLabel: l10n.logout,
      cancelLabel: l10n.cancel,
      isDestructive: true,
      onConfirm: () async {
        Navigator.pop(context);
        await ref.read(authStateProvider.notifier).signOut();
      },
    );
  }
}
