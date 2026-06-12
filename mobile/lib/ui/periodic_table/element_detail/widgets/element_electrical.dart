import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/i18n/strings.g.dart';
import '../../libs/utils/periodic_utils.dart';
import '../../libs/models/periodic_models.dart';
import 'property_item.dart';

class ElementElectrical extends StatelessWidget {
  final AtomicProperties properties;

  const ElementElectrical({super.key, required this.properties});

  @override
  Widget build(BuildContext context) {
    final l10n = Translations.of(context);

    final rawConductivity = double.tryParse(
      properties.electricalConductivity ?? '',
    );
    final formattedConductivity = rawConductivity != null
        ? PeriodicUtils.toPhysics(rawConductivity)
        : properties.electricalConductivity;

    final rawResistivity = double.tryParse(properties.resistivity ?? '');
    final formattedResistivity = rawResistivity != null
        ? PeriodicUtils.toPhysics(rawResistivity)
        : properties.resistivity;

    final rawSuperconducting = double.tryParse(
      properties.superconductingPoint ?? '',
    );
    final formattedSuperconducting = rawSuperconducting != null
        ? PeriodicUtils.toPhysics(rawSuperconducting)
        : properties.superconductingPoint;

    return ShadAccordionItem<String>(
      value: 'group_electrical',
      title: Row(
        children: [
          const Icon(LucideIcons.zap, size: 18),
          const SizedBox(width: 8),
          Text(l10n.periodic_table.electricalProperties),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 8.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            PropertyItem(
              label: l10n.periodic_table.electricalType,
              value: properties.electricalType,
            ),
            PropertyItem(
              label: l10n.periodic_table.electricalConductivity,
              value: formattedConductivity,
              unit: PeriodicUtils.getPeriodicUnits('electricalConductivity'),
              isHtml: true,
            ),
            PropertyItem(
              label: l10n.periodic_table.resistivity,
              value: formattedResistivity,
              unit: PeriodicUtils.getPeriodicUnits('resistivity'),
              isHtml: true,
            ),
            PropertyItem(
              label: l10n.periodic_table.superconductingPoint,
              value: formattedSuperconducting,
              isHtml: true,
            ),
          ],
        ),
      ),
    );
  }
}
