import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/i18n/strings.g.dart';

class PancasilaCard extends StatelessWidget {
  final int id;
  final String title;
  final String imagePath;

  const PancasilaCard({
    super.key,
    required this.id,
    required this.title,
    required this.imagePath,
  });

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);
    final l10n = Translations.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
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
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            // Sila Icon Image
            Hero(
              tag: 'sila_icon_$id',
              child: Image.asset(
                imagePath,
                width: 48,
                height: 48,
                fit: BoxFit.contain,
              ),
            ),
            const SizedBox(width: 16),
            // Sila Content
            Expanded(
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
                      '${l10n.constitution.constitution.sila} $id',
                      style: TextStyle(
                        color: theme.colorScheme.destructive,
                        fontWeight: FontWeight.bold,
                        fontSize: 11,
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    title,
                    style: theme.textTheme.large.copyWith(
                      fontSize: 16,
                      fontWeight: FontWeight.normal,
                      height: 1.4,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
