import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import '../../l10n/gen_l10n/app_localizations.dart';

class NewBadge extends StatelessWidget {
  final EdgeInsetsGeometry margin;
  final bool useSolidRed;

  const NewBadge({
    super.key,
    this.margin = const EdgeInsets.only(right: 6),
    this.useSolidRed = false,
  });

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);
    final l10n = AppLocalizations.of(context)!;

    if (useSolidRed) {
      return Container(
        margin: margin,
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          color: Colors.red[600],
          borderRadius: BorderRadius.circular(8),
        ),
        child: Text(
          l10n.badgeNew,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 10,
            fontWeight: FontWeight.bold,
          ),
        ),
      );
    }

    return Container(
      margin: margin,
      padding: const EdgeInsets.symmetric(
        horizontal: 4,
        vertical: 1.5,
      ),
      decoration: BoxDecoration(
        color: theme.colorScheme.primary.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        l10n.badgeNew,
        style: TextStyle(
          fontSize: 8.5,
          fontWeight: FontWeight.bold,
          color: theme.colorScheme.primary,
        ),
      ),
    );
  }
}
