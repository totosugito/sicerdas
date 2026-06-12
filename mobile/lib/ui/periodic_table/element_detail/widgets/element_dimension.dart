import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/i18n/strings.g.dart';
import '../../libs/utils/periodic_utils.dart';
import '../../libs/models/periodic_models.dart';
import 'property_item.dart';

class ElementDimension extends StatelessWidget {
  final AtomicProperties properties;

  const ElementDimension({super.key, required this.properties});

  @override
  Widget build(BuildContext context) {
    final l10n = Translations.of(context);

    final rawAtomicRadius = double.tryParse(properties.atomicRadius ?? '');
    final formattedAtomicRadius = rawAtomicRadius != null
        ? PeriodicUtils.toPhysics(rawAtomicRadius)
        : properties.atomicRadius;

    final rawVanDerWaalsRadius = double.tryParse(
      properties.vanDerWaalsRadius ?? '',
    );
    final formattedVanDerWaalsRadius = rawVanDerWaalsRadius != null
        ? PeriodicUtils.toPhysics(rawVanDerWaalsRadius)
        : properties.vanDerWaalsRadius;

    final rawEmpiricalRadius = double.tryParse(
      properties.empiricalAtomicRadius ?? '',
    );
    final formattedEmpiricalRadius = rawEmpiricalRadius != null
        ? PeriodicUtils.toPhysics(rawEmpiricalRadius)
        : properties.empiricalAtomicRadius;

    return ShadAccordionItem<String>(
      value: 'group_dimensions',
      title: Row(
        children: [
          const Icon(LucideIcons.ruler, size: 18),
          const SizedBox(width: 8),
          Text(l10n.periodic_table.atomicDimensionsAndStructure),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 8.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            PropertyItem(
              label: l10n.periodic_table.atomicRadius,
              value: formattedAtomicRadius,
              unit: PeriodicUtils.getPeriodicUnits('atomRadius'),
              isHtml: true,
            ),
            PropertyItem(
              label: l10n.periodic_table.covalentRadius,
              value: properties.covalentRadius,
            ),
            PropertyItem(
              label: l10n.periodic_table.vanDerWaalsRadius,
              value: formattedVanDerWaalsRadius,
              unit: PeriodicUtils.getPeriodicUnits('vanDerWaalsRadius'),
              isHtml: true,
            ),
            PropertyItem(
              label: l10n.periodic_table.crystalStructure,
              value: properties.crystalStructure,
            ),
            PropertyItem(
              label: l10n.periodic_table.latticeAngles,
              value: properties.latticeAngles,
            ),
            PropertyItem(
              label: l10n.periodic_table.latticeConstants,
              value: properties.latticeConstants,
            ),
            PropertyItem(
              label: l10n.periodic_table.spaceGroupName,
              value: properties.spaceGroupName,
              isHtml: true,
            ),
            PropertyItem(
              label: l10n.periodic_table.spaceGroupNumber,
              value: properties.spaceGroupNumber,
            ),
            PropertyItem(
              label: l10n.periodic_table.empiricalAtomicRadius,
              value: formattedEmpiricalRadius,
              unit: PeriodicUtils.getPeriodicUnits('empiricalAtomicRadius'),
              isHtml: true,
            ),
            PropertyItem(
              label: l10n.periodic_table.atomicSpectra,
              value: properties.atomicSpectra,
            ),
          ],
        ),
      ),
    );
  }
}
