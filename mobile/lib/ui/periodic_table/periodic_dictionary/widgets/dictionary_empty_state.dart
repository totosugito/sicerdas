import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';

class DictionaryEmptyState extends StatelessWidget {
  final String title;
  final String description;

  const DictionaryEmptyState({
    super.key,
    required this.title,
    required this.description,
  });

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);

    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            LucideIcons.bookOpen,
            size: 48,
            color: theme.colorScheme.mutedForeground,
          ),
          const SizedBox(height: 16),
          Text(
            title,
            style: theme.textTheme.large.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            description,
            style: theme.textTheme.muted,
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
