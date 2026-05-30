import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import '../../../../l10n/gen_l10n/app_localizations.dart';
import '../../libs/utils/periodic-utils.dart';
import '../../libs/models/periodic_models.dart';
import 'property_item.dart';

class ElementDimension extends StatelessWidget {
  final AtomicProperties properties;

  const ElementDimension({super.key, required this.properties});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

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
          Text(l10n.atomicDimensionsAndStructure),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 8.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            PropertyItem(
              label: l10n.atomicRadius,
              value: formattedAtomicRadius,
              unit: PeriodicUtils.getPeriodicUnits('atomRadius'),
              isHtml: true,
            ),
            PropertyItem(
              label: l10n.covalentRadius,
              value: properties.covalentRadius,
            ),
            PropertyItem(
              label: l10n.vanDerWaalsRadius,
              value: formattedVanDerWaalsRadius,
              unit: PeriodicUtils.getPeriodicUnits('vanDerWaalsRadius'),
              isHtml: true,
            ),
            PropertyItem(
              label: l10n.crystalStructure,
              value: properties.crystalStructure,
            ),
            PropertyItem(
              label: l10n.latticeAngles,
              value: properties.latticeAngles,
            ),
            PropertyItem(
              label: l10n.latticeConstants,
              value: properties.latticeConstants,
            ),
            PropertyItem(
              label: l10n.spaceGroupName,
              value: properties.spaceGroupName,
              isHtml: true,
            ),
            PropertyItem(
              label: l10n.spaceGroupNumber,
              value: properties.spaceGroupNumber,
            ),
            PropertyItem(
              label: l10n.empiricalAtomicRadius,
              value: formattedEmpiricalRadius,
              unit: PeriodicUtils.getPeriodicUnits('empiricalAtomicRadius'),
              isHtml: true,
            ),
            PropertyItem(
              label: l10n.atomicSpectra,
              value: properties.atomicSpectra,
            ),
          ],
        ),
      ),
    );
  }
}
