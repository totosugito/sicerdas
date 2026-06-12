import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/i18n/strings.g.dart';
import '../../libs/models/periodic_models.dart';
import 'property_item.dart';

class ViewNfpa extends StatelessWidget {
  final List<String> label;

  const ViewNfpa({super.key, required this.label});

  Widget _createLabel(
    String text,
    Color textColor,
    Color bgColor,
    Border border,
  ) {
    final isLineThrough = text.startsWith('_');
    final textContent = isLineThrough ? text.substring(1) : text;

    return Container(
      width: 32,
      height: 32,
      decoration: BoxDecoration(color: bgColor, border: border),
      child: Transform.rotate(
        angle: -45 * math.pi / 180,
        child: Center(
          child: Text(
            textContent,
            style: TextStyle(
              color: textColor,
              fontWeight: FontWeight.bold,
              fontSize: 12,
              decoration: isLineThrough ? TextDecoration.lineThrough : null,
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (label.isEmpty) return const SizedBox.shrink();

    final redVal = label.isNotEmpty ? label[0] : '';
    final blueVal = label.length > 1 ? label[1] : '';
    final yellowVal = label.length > 2 ? label[2] : '';
    final whiteVal = label.length > 3 ? label[3] : '';

    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Transform.rotate(
        angle: 45 * math.pi / 180,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                _createLabel(
                  redVal,
                  const Color(0xFFFFFFFF),
                  const Color(0xFFFF0000), // Pure Red
                  const Border(
                    left: BorderSide(
                      color: Color(0xFF8B0000),
                      width: 1.5,
                    ), // Dark Red Border
                    top: BorderSide(color: Color(0xFF8B0000), width: 1.5),
                  ),
                ),
                _createLabel(
                  yellowVal,
                  const Color(0xFF000000),
                  const Color(0xFFFFFF00), // Pure Yellow
                  Border.all(
                    color: const Color(0xFFB8860B),
                    width: 1.5,
                  ), // Dark Yellow Border
                ),
              ],
            ),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                _createLabel(
                  blueVal,
                  const Color(0xFFFFFFFF),
                  const Color(0xFF0000FF), // Pure Blue
                  Border.all(
                    color: const Color(0xFF00008B),
                    width: 1.5,
                  ), // Dark Blue Border
                ),
                _createLabel(
                  whiteVal,
                  const Color(0xFF000000),
                  const Color(0xFFFFFFFF), // Pure White
                  const Border(
                    right: BorderSide(
                      color: Color(0xFFCCCCCC),
                      width: 1.5,
                    ), // Grey Border
                    bottom: BorderSide(color: Color(0xFFCCCCCC), width: 1.5),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class ElementHealthSafety extends StatelessWidget {
  final AtomicProperties properties;

  const ElementHealthSafety({super.key, required this.properties});

  @override
  Widget build(BuildContext context) {
    final l10n = Translations.of(context);

    final hasContent =
        (properties.dOTHazardClass != null &&
            properties.dOTHazardClass!.isNotEmpty) ||
        (properties.dOTNumbers != null && properties.dOTNumbers!.isNotEmpty) ||
        (properties.rtecsNumber != null &&
            properties.rtecsNumber!.isNotEmpty) ||
        (properties.nfpaLabel != null && properties.nfpaLabel!.isNotEmpty);

    if (!hasContent) {
      return const SizedBox.shrink();
    }

    return ShadAccordionItem<String>(
      value: 'group_health_safety',
      title: Row(
        children: [
          const Icon(LucideIcons.shieldAlert, size: 18),
          const SizedBox(width: 8),
          Text(l10n.periodic_table.healthAndSafety),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 8.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            PropertyItem(
              label: l10n.periodic_table.dOTHazardClass,
              value: properties.dOTHazardClass,
            ),
            PropertyItem(label: l10n.periodic_table.dOTNumbers, value: properties.dOTNumbers),
            PropertyItem(
              label: l10n.periodic_table.rtecsNumber,
              value: properties.rtecsNumber,
            ),
            if (properties.nfpaLabel != null &&
                properties.nfpaLabel!.isNotEmpty) ...[
              Padding(
                padding: const EdgeInsets.symmetric(
                  vertical: 8.0,
                  horizontal: 4.0,
                ),
                child: Text(
                  l10n.periodic_table.nfpaLabel,
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                    color: ShadTheme.of(context).colorScheme.mutedForeground,
                  ),
                ),
              ),
              Align(
                alignment: Alignment.centerLeft,
                child: ViewNfpa(label: properties.nfpaLabel!),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
