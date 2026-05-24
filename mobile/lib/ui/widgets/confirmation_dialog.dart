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

    return ShadDialog(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 320),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              size: 32,
              color: iconColor ?? (isDestructive ? theme.colorScheme.destructive : theme.colorScheme.primary),
            ),
            const SizedBox(height: 16),
            Text(
              title,
              style: theme.textTheme.large.copyWith(fontWeight: FontWeight.w700),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            descriptionWidget ?? Text(
              description ?? '',
              style: theme.textTheme.muted.copyWith(fontSize: 14),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            isDestructive
                ? ShadButton.destructive(
                    width: double.infinity,
                    onPressed: onConfirm,
                    child: Text(confirmLabel),
                  )
                : ShadButton(
                    width: double.infinity,
                    onPressed: onConfirm,
                    child: Text(confirmLabel),
                  ),
            const SizedBox(height: 4),
            ShadButton.ghost(
              width: double.infinity,
              onPressed: () => Navigator.of(context).pop(),
              child: Text(cancelLabel ?? 'Cancel'),
            ),
          ],
        ),
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
