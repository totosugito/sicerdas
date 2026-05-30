import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import '../../../../l10n/gen_l10n/app_localizations.dart';

class ElementIsotopes extends StatelessWidget {
  final Map<String, dynamic> isotope;

  const ElementIsotopes({
    super.key,
    required this.isotope,
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
    if (isotope.isEmpty) {
      return const SizedBox.shrink() as dynamic;
    }

    final l10n = AppLocalizations.of(context)!;
    final theme = ShadTheme.of(context);

    return ShadAccordionItem<String>(
      value: 'isotopes',
      title: Row(
        children: [
          const Icon(LucideIcons.orbit, size: 18),
          const SizedBox(width: 8),
          Text(l10n.periodicIsotopes),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 8.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            for (var entry in isotope.entries)
              if (entry.value != null && entry.value.toString().isNotEmpty)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 4.0),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '${_formatKey(entry.key)}: ',
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                      Expanded(
                        child: Text(
                          entry.value.toString(),
                          style: theme.textTheme.muted,
                        ),
                      ),
                    ],
                  ),
                ),
          ],
        ),
      ),
    );
  }
}
