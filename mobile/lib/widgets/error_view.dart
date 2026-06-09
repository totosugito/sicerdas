import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';

class ErrorView extends StatelessWidget {
  final String message;
  final String? details;

  const ErrorView({super.key, required this.message, this.details});

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);

    return Center(
      child: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 32.0, vertical: 24.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // Premium decorative icon container with dynamic destructive theme gradient and glow
              Container(
                width: 72,
                height: 72,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: LinearGradient(
                    colors: [
                      theme.colorScheme.destructive.withValues(alpha: 0.15),
                      theme.colorScheme.destructive.withValues(alpha: 0.02),
                    ],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  border: Border.all(
                    color: theme.colorScheme.destructive.withValues(
                      alpha: 0.25,
                    ),
                    width: 1.5,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: theme.colorScheme.destructive.withValues(
                        alpha: 0.08,
                      ),
                      blurRadius: 24,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: Center(
                  child: Icon(
                    Icons.error_outline_rounded,
                    size: 36,
                    color: theme.colorScheme.destructive,
                  ),
                ),
              ),
              const SizedBox(height: 24),
              // Message
              Text(
                message,
                style: theme.textTheme.large.copyWith(
                  fontWeight: FontWeight.w600,
                  letterSpacing: -0.5,
                ),
                textAlign: TextAlign.center,
              ),
              // Details (optional)
              if (details != null && details!.isNotEmpty) ...[
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: theme.colorScheme.muted.withValues(alpha: 0.5),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                      color: theme.colorScheme.border,
                      width: 1,
                    ),
                  ),
                  child: Text(
                    details!,
                    style: theme.textTheme.muted.copyWith(
                      fontSize: 12,
                      fontFamily: 'monospace',
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
