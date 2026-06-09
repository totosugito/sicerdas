import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import '../periodic_dictionary.dart';

class ChemistryTermCard extends StatelessWidget {
  final ChemistryTerm term;
  final VoidCallback onCopy;
  final String copyTooltip;

  const ChemistryTermCard({
    super.key,
    required this.term,
    required this.onCopy,
    required this.copyTooltip,
  });

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);

    return InkWell(
      onLongPress: onCopy,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        decoration: BoxDecoration(
          color: theme.colorScheme.card,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: theme.colorScheme.border,
          ),
        ),
        padding: const EdgeInsets.all(12),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    term.word,
                    style: theme.textTheme.p.copyWith(
                      fontWeight: FontWeight.bold,
                      color: theme.colorScheme.foreground,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Expanded(
                    child: Text(
                      term.translation,
                      style: theme.textTheme.small.copyWith(
                        color: theme.colorScheme.mutedForeground,
                      ),
                      maxLines: 3,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            ),
            IconButton(
              icon: const Icon(
                LucideIcons.copy,
                size: 16,
              ),
              tooltip: copyTooltip,
              onPressed: onCopy,
            ),
          ],
        ),
      ),
    );
  }
}
