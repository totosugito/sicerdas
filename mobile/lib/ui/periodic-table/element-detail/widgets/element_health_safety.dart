import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'property_item.dart';

class ElementHealthSafety extends StatelessWidget {
  final Map<String, dynamic> properties;

  const ElementHealthSafety({
    super.key,
    required this.properties,
  });

  String _formatKey(String key) {
    final result = key.replaceAllMapped(
      RegExp(r'(?<=[a-z])[A-Z]'),
      (Match m) => ' ${m.group(0)}',
    );
    return result
        .split(' ')
        .map(
          (str) => str.isNotEmpty
              ? '${str[0].toUpperCase()}${str.substring(1)}'
              : '',
        )
        .join(' ');
  }

  @override
  Widget build(BuildContext context) {
    final healthSafetyKeys = [
      'nfpaHealth',
      'nfpaFlammability',
      'nfpaInstability',
      'nfpaSpecial',
      'dotHazard',
      'dotLabel',
      'dotNumber',
    ];

    final hasContent = healthSafetyKeys.any((key) =>
        properties[key] != null && properties[key].toString().isNotEmpty);

    if (!hasContent) {
      return const SizedBox.shrink() as dynamic;
    }

    return ShadAccordionItem<String>(
      value: 'group_health_safety',
      title: const Row(
        children: [
          Icon(LucideIcons.shieldAlert, size: 18),
          const SizedBox(width: 8),
          Text('Health & Safety'),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 8.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            for (var key in healthSafetyKeys)
              if (properties[key] != null &&
                  properties[key].toString().isNotEmpty)
                PropertyItem(
                  label: _formatKey(key),
                  value: properties[key].toString(),
                ),
          ],
        ),
      ),
    );
  }
}
