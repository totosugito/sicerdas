import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';

class ErrorView extends StatelessWidget {
  final String message;
  final String? details;

  const ErrorView({
    super.key,
    required this.message,
    this.details,
  });

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);

    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.error_outline_rounded,
              size: 48,
              color: theme.colorScheme.destructive.withValues(
                alpha: 0.8,
              ),
            ),
            const SizedBox(height: 12),
            Text(
              message,
              style: theme.textTheme.muted,
              textAlign: TextAlign.center,
            ),
            if (details != null && details!.isNotEmpty) ...[
              const SizedBox(height: 6),
              Text(
                details!,
                style: theme.textTheme.muted.copyWith(
                  fontSize: 12,
                  color: theme.colorScheme.destructive.withValues(
                    alpha: 0.6,
                  ),
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ],
        ),
      ),
    );
  }
}
