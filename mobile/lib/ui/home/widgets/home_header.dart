import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import '../../../core/auth/auth_service.dart';
import '../../../l10n/gen_l10n/app_localizations.dart';
import '../../settings/settings_screen.dart';

class HomeHeader extends ConsumerWidget {
  const HomeHeader({super.key});

  String _getTimeBasedGreeting(AppLocalizations l10n) {
    final hour = DateTime.now().hour;
    if (hour >= 5 && hour < 11) return l10n.goodMorning;
    if (hour >= 11 && hour < 15) return l10n.goodAfternoon;
    if (hour >= 15 && hour < 18) return l10n.goodEvening;
    return l10n.goodNight;
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context)!;
    final theme = ShadTheme.of(context);
    final currentUser = ref.watch(currentUserProvider);
    final greeting = currentUser != null ? _getTimeBasedGreeting(l10n) : l10n.helloStudent;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          crossAxisAlignment: CrossAxisAlignment.start, // Top alignment for a cleaner look
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(greeting, style: theme.textTheme.muted.copyWith(fontSize: 14, fontWeight: FontWeight.w500, letterSpacing: 0.2)),
                  const SizedBox(height: 1),
                  Text(
                    currentUser?.name ?? "Student",
                    style: theme.textTheme.h3.copyWith(
                      fontWeight: FontWeight.w800, // Extra bold for better presence
                      letterSpacing: -0.8, // Tighter tracking for a premium feel
                      color: theme.colorScheme.foreground,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
            Row(
              children: [
                _HeaderIconButton(icon: LucideIcons.bell, onPressed: () {}),
                const SizedBox(width: 4),
                _HeaderIconButton(
                  icon: LucideIcons.settings,
                  onPressed: () {
                    Navigator.push(context, MaterialPageRoute(builder: (context) => const SettingsScreen()));
                  },
                ),
              ],
            ),
          ],
        ),
      ],
    );
  }
}

class _HeaderIconButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback onPressed;

  const _HeaderIconButton({required this.icon, required this.onPressed});

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);
    return ShadIconButton.ghost(
      icon: Icon(icon, size: 20, color: theme.colorScheme.primary),
      onPressed: onPressed,
      // Adding a subtle hover/press decoration would happen here if supported,
      // but ghost buttons already have it.
    );
  }
}
