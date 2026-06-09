import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';

class EmptyState extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? description;
  final String? actionLabel;
  final VoidCallback? onActionPressed;

  const EmptyState({
    super.key,
    required this.icon,
    required this.title,
    this.description,
    this.actionLabel,
    this.onActionPressed,
  });

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
              // Premium decorative icon container with dynamic theme gradient and glow
              Container(
                width: 72,
                height: 72,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: LinearGradient(
                    colors: [
                      theme.colorScheme.primary.withValues(alpha: 0.15),
                      theme.colorScheme.primary.withValues(alpha: 0.02),
                    ],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  border: Border.all(
                    color: theme.colorScheme.primary.withValues(alpha: 0.25),
                    width: 1.5,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: theme.colorScheme.primary.withValues(alpha: 0.08),
                      blurRadius: 24,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: Center(
                  child: Icon(icon, size: 40, color: theme.colorScheme.primary),
                ),
              ),
              const SizedBox(height: 24),
              // Title
              Text(
                title,
                style: theme.textTheme.large.copyWith(
                  fontWeight: FontWeight.w600,
                  letterSpacing: -0.5,
                ),
                textAlign: TextAlign.center,
              ),
              // Description (optional)
              if (description != null) ...[
                const SizedBox(height: 8),
                Text(
                  description!,
                  style: theme.textTheme.muted.copyWith(fontSize: 14),
                  textAlign: TextAlign.center,
                ),
              ],
              // Action button (optional)
              if (onActionPressed != null && actionLabel != null) ...[
                const SizedBox(height: 24),
                ShadButton.outline(
                  onPressed: onActionPressed,
                  child: Text(actionLabel!),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
