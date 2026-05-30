import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'property_item.dart';

class ElementReactivity extends StatelessWidget {
  final Map<String, dynamic> properties;

  const ElementReactivity({
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
    final reactivityKeys = [
      'electronegativity',
      'electronAffinity',
      'valence',
      'oxidationStates',
    ];

    final hasContent = reactivityKeys.any((key) =>
        properties[key] != null && properties[key].toString().isNotEmpty);

    if (!hasContent) {
      return const SizedBox.shrink() as dynamic;
    }

    return ShadAccordionItem<String>(
      value: 'group_reactivity',
      title: const Row(
        children: [
          Icon(LucideIcons.activity, size: 18),
          const SizedBox(width: 8),
          Text('Reactivity'),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 8.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            for (var key in reactivityKeys)
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
