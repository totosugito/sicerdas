import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';

class ConfirmationDialog extends StatelessWidget {
  final IconData icon;
  final Color? iconColor;
  final String title;
  final String? description;
  final Widget? descriptionWidget;
  final String confirmLabel;
  final String? cancelLabel;
  final VoidCallback onConfirm;
  final bool isDestructive;

  const ConfirmationDialog({
    super.key,
    required this.icon,
    this.iconColor,
    required this.title,
    this.description,
    this.descriptionWidget,
    required this.confirmLabel,
    this.cancelLabel,
    required this.onConfirm,
    this.isDestructive = true,
  });

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return ShadDialog(
      useSafeArea: false,
      constraints: const BoxConstraints(maxWidth: 340),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color:
                  (isDestructive
                          ? theme.colorScheme.destructive
                          : theme.colorScheme.primary)
                      .withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(
              icon,
              size: 28,
              color:
                  iconColor ??
                  (isDestructive
                      ? theme.colorScheme.destructive
                      : theme.colorScheme.primary),
            ),
          ),
          const SizedBox(height: 16),
          Text(
            title,
            style: theme.textTheme.large.copyWith(
              fontWeight: FontWeight.bold,
              fontSize: 18,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8),
          descriptionWidget ??
              Text(
                description ?? '',
                style: theme.textTheme.muted.copyWith(
                  fontSize: 14,
                  color: isDark ? Colors.white70 : Colors.black54,
                ),
                textAlign: TextAlign.center,
              ),
          const SizedBox(height: 24),
          Row(
            children: [
              Expanded(
                child: ShadButton.outline(
                  onPressed: () => Navigator.of(context).pop(),
                  child: Text(cancelLabel ?? 'Cancel'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: isDestructive
                    ? ShadButton.destructive(
                        onPressed: onConfirm,
                        child: Text(confirmLabel),
                      )
                    : ShadButton(
                        onPressed: onConfirm,
                        child: Text(confirmLabel),
                      ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  static void show(
    BuildContext context, {
    required IconData icon,
    Color? iconColor,
    required String title,
    String? description,
    Widget? descriptionWidget,
    required String confirmLabel,
    String? cancelLabel,
    required VoidCallback onConfirm,
    bool isDestructive = true,
  }) {
    showShadDialog(
      context: context,
      builder: (context) => ConfirmationDialog(
        icon: icon,
        iconColor: iconColor,
        title: title,
        description: description,
        descriptionWidget: descriptionWidget,
        confirmLabel: confirmLabel,
        cancelLabel: cancelLabel,
        onConfirm: onConfirm,
        isDestructive: isDestructive,
      ),
    );
  }
}
