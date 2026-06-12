import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/i18n/strings.g.dart';
import '../../libs/utils/periodic_utils.dart';
import '../../libs/models/periodic_models.dart';
import 'property_item.dart';
import 'view_oxidation_states.dart';

class ElementClassification extends StatelessWidget {
  final AtomicProperties properties;

  const ElementClassification({super.key, required this.properties});

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);
    final l10n = Translations.of(context);

    final rawCrustal = double.tryParse(
      properties.estimatedCrustalAbundance ?? '',
    );
    final formattedCrustal = rawCrustal != null
        ? PeriodicUtils.toPhysics(rawCrustal)
        : properties.estimatedCrustalAbundance;

    final rawOceanic = double.tryParse(
      properties.estimatedOceanicAbundance ?? '',
    );
    final formattedOceanic = rawOceanic != null
        ? PeriodicUtils.toPhysics(rawOceanic)
        : properties.estimatedOceanicAbundance;

    final oxidationStatesList =
        properties.oxidationStates != null &&
            properties.oxidationStates!['v'] != null
        ? List<int>.from(properties.oxidationStates!['v'] as List)
        : <int>[];

    final groupValue = properties.group != null
        ? '${properties.group}${PeriodicUtils.getColumnGroup(properties.group!)}'
        : null;

    return ShadAccordionItem<String>(
      value: 'group_classifications',
      title: Row(
        children: [
          const Icon(LucideIcons.layers, size: 18),
          const SizedBox(width: 8),
          Text(l10n.periodic_table.classifications),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 8.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            PropertyItem(
              label: l10n.periodic_table.alternateNames,
              value: properties.alternateNames,
            ),
            PropertyItem(
              label: l10n.periodic_table.namesOfAllotropes,
              value: properties.namesOfAllotropes,
            ),
            PropertyItem(label: l10n.periodic_table.group, value: groupValue),
            PropertyItem(label: l10n.periodic_table.period, value: properties.period),
            PropertyItem(label: l10n.periodic_table.block, value: properties.block),
            PropertyItem(
              label: l10n.periodic_table.series,
              value: PeriodicUtils.getLocalizedSeries(l10n, properties.series),
            ),
            PropertyItem(label: l10n.periodic_table.color, value: properties.color),
            PropertyItem(label: l10n.periodic_table.gasPhase, value: properties.gasPhase),
            PropertyItem(
              label: l10n.periodic_table.electronConfiguration,
              value: properties.electronConfiguration,
              isHtml: true,
            ),
            PropertyItem(
              label: l10n.periodic_table.physicalDescription,
              value: properties.physicalDescription,
            ),
            PropertyItem(
              label: l10n.periodic_table.groundLevel,
              value: properties.groundLevel,
              isHtml: true,
            ),
            PropertyItem(
              label: l10n.periodic_table.estimatedCrustalAbundance,
              value: formattedCrustal,
              unit: PeriodicUtils.getPeriodicUnits('estimatedCrustalAbundance'),
              isHtml: true,
            ),
            PropertyItem(
              label: l10n.periodic_table.estimatedOceanicAbundance,
              value: formattedOceanic,
              unit: PeriodicUtils.getPeriodicUnits('estimatedOceanicAbundance'),
              isHtml: true,
            ),
            PropertyItem(label: l10n.periodic_table.casNumber, value: properties.casNumber),
            PropertyItem(label: l10n.periodic_table.cidNumber, value: properties.cidNumber),
            PropertyItem(label: l10n.periodic_table.inChI, value: properties.inChI),
            PropertyItem(label: l10n.periodic_table.inChiKey, value: properties.inChiKey),
            if (oxidationStatesList.isNotEmpty) ...[
              const SizedBox(height: 12),
              Text(
                l10n.periodic_table.oxidationStates,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                  color: theme.colorScheme.mutedForeground,
                ),
              ),
              const SizedBox(height: 8),
              ViewOxidationStates(oxs: oxidationStatesList),
            ],
          ],
        ),
      ),
    );
  }
}
