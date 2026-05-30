import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import '../../../../l10n/gen_l10n/app_localizations.dart';
import '../../utils/periodic-utils.dart';
import '../../models/periodic_models.dart';
import 'property_item.dart';

class ElementMagnetic extends StatelessWidget {
  final AtomicProperties properties;

  const ElementMagnetic({super.key, required this.properties});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

    final rawCurie = double.tryParse(properties.curiePoint ?? '');
    final formattedCurie = rawCurie != null
        ? PeriodicUtils.toPhysics(rawCurie)
        : properties.curiePoint;

    final rawMassSusc = double.tryParse(
      properties.massMagneticSusceptibility ?? '',
    );
    final formattedMassSusc = rawMassSusc != null
        ? PeriodicUtils.toPhysics(rawMassSusc)
        : properties.massMagneticSusceptibility;

    final rawMolarSusc = double.tryParse(
      properties.molarMagneticSusceptibility ?? '',
    );
    final formattedMolarSusc = rawMolarSusc != null
        ? PeriodicUtils.toPhysics(rawMolarSusc, precision: 3)
        : properties.molarMagneticSusceptibility;

    final rawVolSusc = double.tryParse(
      properties.volumeMagneticSusceptibility ?? '',
    );
    final formattedVolSusc = rawVolSusc != null
        ? PeriodicUtils.toPhysics(rawVolSusc)
        : properties.volumeMagneticSusceptibility;

    return ShadAccordionItem<String>(
      value: 'group_magnetic',
      title: Row(
        children: [
          const Icon(LucideIcons.magnet, size: 18),
          const SizedBox(width: 8),
          Text(l10n.magneticProperties),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 8.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            PropertyItem(
              label: l10n.magneticType,
              value: properties.magneticType,
            ),
            PropertyItem(
              label: l10n.curiePoint,
              value: formattedCurie,
              unit: PeriodicUtils.getPeriodicUnits('curiePoint'),
              isHtml: true,
            ),
            PropertyItem(
              label: l10n.massMagneticSusceptibility,
              value: formattedMassSusc,
              unit: PeriodicUtils.getPeriodicUnits(
                'massMagneticSusceptibility',
              ),
              isHtml: true,
            ),
            PropertyItem(
              label: l10n.molarMagneticSusceptibility,
              value: formattedMolarSusc,
              unit: PeriodicUtils.getPeriodicUnits(
                'molarMagneticSusceptibility',
              ),
              isHtml: true,
            ),
            PropertyItem(
              label: l10n.volumeMagneticSusceptibility,
              value: formattedVolSusc,
              isHtml: true,
            ),
          ],
        ),
      ),
    );
  }
}
