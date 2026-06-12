import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/core/auth/auth_service.dart';
import 'package:bse/i18n/strings.g.dart';
import '../../settings/settings_screen.dart';

class HomeHeader extends ConsumerWidget {
  const HomeHeader({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = Translations.of(context);
    final theme = ShadTheme.of(context);
    final currentUser = ref.watch(currentUserProvider);
    final greeting = l10n.common.hello;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Expanded(
              child: Text.rich(
                TextSpan(
                  children: [
                    TextSpan(
                      text: '$greeting, ',
                      style: theme.textTheme.muted.copyWith(
                        fontSize: 16,
                        fontWeight: FontWeight.w400,
                      ),
                    ),
                    TextSpan(
                      text: currentUser?.name ?? l10n.common.student,
                      style: theme.textTheme.large.copyWith(
                        fontWeight: FontWeight.w800,
                        color: theme.colorScheme.foreground,
                      ),
                    ),
                  ],
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
            Row(
              children: [
                _HeaderIconButton(icon: LucideIcons.bell, onPressed: () {}),
                const SizedBox(width: 4),
                _HeaderIconButton(
                  icon: LucideIcons.settings,
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const SettingsScreen(),
                      ),
                    );
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
      icon: Icon(icon, size: 20, color: theme.colorScheme.mutedForeground),
      onPressed: onPressed,
    );
  }
}
