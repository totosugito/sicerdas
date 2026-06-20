import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';

class SummaryCard extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;
  final bool isDark;

  const SummaryCard({
    super.key,
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
    required this.isDark,
  });

  String _formatValue(String val) {
    try {
      final parsed = int.tryParse(val);
      if (parsed != null) {
        return NumberFormat.decimalPattern().format(parsed);
      }
    } catch (_) {}
    return val;
  }

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);

    return ShadCard(
      backgroundColor: isDark ? color.withValues(alpha: 0.08) : Colors.white,
      border: ShadBorder.all(
        color: color.withValues(alpha: isDark ? 0.35 : 0.15),
        width: 1.5,
      ),
      radius: BorderRadius.circular(16),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                label,
                style: theme.textTheme.muted.copyWith(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                ),
              ),
              Icon(icon, size: 16, color: color),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            _formatValue(value),
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w800,
              color: color,
              letterSpacing: -0.5,
            ),
          ),
        ],
      ),
    );
  }
}
