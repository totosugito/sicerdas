import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';

class PdfContextMenu extends StatelessWidget {
  final VoidCallback onCopy;
  final VoidCallback onHighlight;
  final VoidCallback onUnderline;
  final VoidCallback onStrikethrough;
  final VoidCallback onSquiggly;
  final VoidCallback onClose;

  const PdfContextMenu({
    super.key,
    required this.onCopy,
    required this.onHighlight,
    required this.onUnderline,
    required this.onStrikethrough,
    required this.onSquiggly,
    required this.onClose,
  });

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);

    return Material(
      color: Colors.transparent,
      child: Container(
        decoration: BoxDecoration(
          color: theme.colorScheme.card,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: theme.colorScheme.border, width: 1),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.15),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            _MenuButton(
              onPressed: onCopy,
              icon: Icons.copy,
              tooltip: 'Copy',
            ),
            _divider(theme),
            _MenuButton(
              onPressed: onHighlight,
              icon: Icons.border_color,
              tooltip: 'Highlight',
            ),
            _divider(theme),
            _MenuButton(
              onPressed: onUnderline,
              icon: Icons.format_underline,
              tooltip: 'Underline',
            ),
            _divider(theme),
            _MenuButton(
              onPressed: onStrikethrough,
              icon: Icons.format_strikethrough,
              tooltip: 'Strikethrough',
            ),
            _divider(theme),
            _MenuButton(
              onPressed: onSquiggly,
              icon: Icons.gesture,
              tooltip: 'Squiggly',
            ),
            _divider(theme),
            _MenuButton(
              onPressed: onClose,
              icon: Icons.close,
              tooltip: 'Close',
            ),
          ],
        ),
      ),
    );
  }

  Widget _divider(ShadThemeData theme) {
    return Container(
      width: 1,
      height: 24,
      color: theme.colorScheme.border,
    );
  }
}

class _MenuButton extends StatelessWidget {
  final VoidCallback onPressed;
  final IconData icon;
  final String tooltip;

  const _MenuButton({
    required this.onPressed,
    required this.icon,
    required this.tooltip,
  });

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);
    return ShadButton.ghost(
      width: 44,
      height: 36,
      padding: EdgeInsets.zero,
      onPressed: onPressed,
      child: Icon(
        icon,
        size: 16,
        color: theme.colorScheme.foreground,
      ),
    );
  }
}
