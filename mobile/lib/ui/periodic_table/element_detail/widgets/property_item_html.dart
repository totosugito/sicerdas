import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:flutter_widget_from_html_core/flutter_widget_from_html_core.dart';

class PropertyItemHtml extends StatelessWidget {
  final String label;
  final String? value;

  const PropertyItemHtml({
    super.key,
    required this.label,
    this.value,
  });

  @override
  Widget build(BuildContext context) {
    final hasValue = value != null && value!.isNotEmpty && value != 'N/A';
    final theme = ShadTheme.of(context);

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 14,
              color: hasValue
                  ? theme.colorScheme.mutedForeground
                  : theme.colorScheme.mutedForeground.withValues(alpha: 0.8),
            ),
          ),
          if (hasValue) ...[
            const SizedBox(height: 4),
            HtmlWidget(
              value!,
              textStyle: TextStyle(
                fontSize: 14,
                color: theme.colorScheme.foreground,
              ),
            ),
          ],
        ],
      ),
    );
  }
}
