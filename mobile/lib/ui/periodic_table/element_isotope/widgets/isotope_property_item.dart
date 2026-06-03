import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:flutter_widget_from_html_core/flutter_widget_from_html_core.dart';

class IsotopePropertyItem extends StatelessWidget {
  final String label;
  final String value;
  final bool isHtml;

  const IsotopePropertyItem({
    super.key,
    required this.label,
    required this.value,
    this.isHtml = false,
  });

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);

    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 6),
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        color: theme.colorScheme.muted.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label.toUpperCase(),
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w600,
              letterSpacing: 0.8,
              color: theme.colorScheme.mutedForeground,
            ),
          ),
          const SizedBox(height: 3),
          isHtml
              ? HtmlWidget(
                  value,
                  textStyle: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                    fontFamily: 'monospace',
                    color: theme.colorScheme.foreground,
                  ),
                )
              : Text(
                  value,
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                    fontFamily: 'monospace',
                    color: theme.colorScheme.foreground,
                  ),
                ),
        ],
      ),
    );
  }
}
