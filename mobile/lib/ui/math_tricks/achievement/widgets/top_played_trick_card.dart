import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/i18n/strings.g.dart';

class TopPlayedTrickCard extends StatelessWidget {
  final String title;
  final Color color;
  final int total;
  final int acc;
  final bool isDark;

  const TopPlayedTrickCard({
    super.key,
    required this.title,
    required this.color,
    required this.total,
    required this.acc,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);
    final l10n = Translations.of(context);

    return ShadCard(
      backgroundColor: isDark ? color.withValues(alpha: 0.05) : Colors.white,
      border: ShadBorder.all(
        color: color.withValues(alpha: isDark ? 0.3 : 0.15),
        width: 1.2,
      ),
      radius: BorderRadius.circular(14),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(
              Icons.psychology_rounded,
              color: color,
              size: 20,
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 13,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '${l10n.math_tricks.achievement.solvedQuestions(count: total)}  •  ${l10n.math_tricks.accuracy}: $acc%',
                  style: theme.textTheme.muted.copyWith(
                    fontSize: 11,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
