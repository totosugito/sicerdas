import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:flutter_widget_from_html_core/flutter_widget_from_html_core.dart';

class PropertyItem extends StatelessWidget {
  final String label;
  final String? value;
  final String? unit;
  final bool isHtml;
  final bool isMultiline;

  const PropertyItem({
    super.key,
    required this.label,
    this.value,
    this.unit,
    this.isHtml = false,
    this.isMultiline = false,
  });

  @override
  Widget build(BuildContext context) {
    var displayValue = value;
    if (displayValue == 'None') {
      displayValue = '';
    }

    final hasValue =
        displayValue != null &&
        displayValue.isNotEmpty &&
        displayValue != 'N/A';

    final theme = ShadTheme.of(context);

    final valueWidget = Wrap(
      crossAxisAlignment: WrapCrossAlignment.center,
      alignment: WrapAlignment.end,
      children: [
        if (hasValue)
          isHtml
              ? HtmlWidget(
                  displayValue,
                  textStyle: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: theme.colorScheme.foreground,
                    fontFamily: 'monospace',
                  ),
                )
              : Text(
                  displayValue,
                  textAlign: TextAlign.end,
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: theme.colorScheme.foreground,
                    fontFamily: 'monospace',
                  ),
                )
        else
          Text(
            'N/A',
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w400,
              color: theme.colorScheme.mutedForeground.withValues(
                alpha: 0.6,
              ),
            ),
          ),
        if (unit != null && unit!.isNotEmpty)
          Text(
            ' $unit',
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w500,
              color: theme.colorScheme.mutedForeground,
              fontFamily: 'monospace',
            ),
          ),
      ],
    );

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 8.0, horizontal: 4.0),
      decoration: BoxDecoration(
        border: Border(
          bottom: BorderSide(
            color: theme.colorScheme.border.withValues(alpha: 0.4),
            width: 0.5,
          ),
        ),
      ),
      child: isMultiline
          ? Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Left-aligned Label
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                    color: theme.colorScheme.mutedForeground,
                  ),
                ),
                const SizedBox(height: 4),
                // Right-aligned Value + Unit
                Align(
                  alignment: Alignment.centerRight,
                  child: valueWidget,
                ),
              ],
            )
          : Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                // Left-aligned Label
                Expanded(
                  flex: 4,
                  child: Text(
                    label,
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                      color: theme.colorScheme.mutedForeground,
                    ),
                  ),
                ),
                // Right-aligned Value + Unit
                Expanded(
                  flex: 5,
                  child: Align(
                    alignment: Alignment.centerRight,
                    child: valueWidget,
                  ),
                ),
              ],
            ),
    );
  }
}
