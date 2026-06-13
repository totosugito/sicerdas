import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';

class PembukaanCard extends StatelessWidget {
  final String label;
  final String text;

  const PembukaanCard({
    super.key,
    required this.label,
    required this.text,
  });

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: ShadCard(
        padding: const EdgeInsets.all(20.0),
        backgroundColor: theme.colorScheme.card,
        border: ShadBorder.all(
          color: theme.colorScheme.destructive.withValues(
            alpha: isDark ? 0.2 : 0.1,
          ),
          width: 1.5,
        ),
        radius: BorderRadius.circular(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(
                horizontal: 8,
                vertical: 2,
              ),
              decoration: BoxDecoration(
                color: theme.colorScheme.destructive.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text(
                label,
                style: TextStyle(
                  color: theme.colorScheme.destructive,
                  fontWeight: FontWeight.bold,
                  fontSize: 11,
                  letterSpacing: 0.5,
                ),
              ),
            ),
            const SizedBox(height: 12),
            Text(
              text,
              style: theme.textTheme.muted.copyWith(
                fontSize: 15,
                height: 1.6,
                color: theme.colorScheme.foreground.withValues(
                  alpha: isDark ? 0.9 : 0.8,
                ),
                fontWeight: FontWeight.normal,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
