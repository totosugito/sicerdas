import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';

class AchievementStatCard extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;

  const AchievementStatCard({
    super.key,
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: isDark ? theme.colorScheme.card : Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: color.withValues(alpha: isDark ? 0.3 : 0.12),
          width: 1.5,
        ),
        boxShadow: [
          BoxShadow(
            color: color.withValues(alpha: isDark ? 0.08 : 0.04),
            blurRadius: 16,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(
                  icon,
                  color: color,
                  size: 20.0,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Text(
            label,
            style: theme.textTheme.muted.copyWith(
              fontSize: 12,
              fontWeight: FontWeight.w500,
              color: theme.colorScheme.mutedForeground,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: theme.textTheme.large.copyWith(
              fontSize: 22,
              fontWeight: FontWeight.w800,
              letterSpacing: -0.5,
            ),
          ),
        ],
      ),
    );
  }
}
