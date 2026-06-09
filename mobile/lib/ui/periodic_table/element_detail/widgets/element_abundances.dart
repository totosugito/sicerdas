import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/l10n/gen_l10n/app_localizations.dart';
import '../../libs/utils/periodic_utils.dart';
import '../../libs/models/periodic_models.dart';
import 'property_item.dart';

class ElementAbundances extends StatelessWidget {
  final AtomicProperties properties;

  const ElementAbundances({super.key, required this.properties});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

    final rawUniverse = double.tryParse(properties.percInUniverse ?? '');
    final formattedUniverse = rawUniverse != null
        ? PeriodicUtils.toPhysics(rawUniverse)
        : properties.percInUniverse;

    final rawSun = double.tryParse(properties.percInSun ?? '');
    final formattedSun = rawSun != null
        ? PeriodicUtils.toPhysics(rawSun)
        : properties.percInSun;

    final rawMeteorites = double.tryParse(properties.percInMeteorites ?? '');
    final formattedMeteorites = rawMeteorites != null
        ? PeriodicUtils.toPhysics(rawMeteorites)
        : properties.percInMeteorites;

    final rawEarth = double.tryParse(properties.percInEarth ?? '');
    final formattedEarth = rawEarth != null
        ? PeriodicUtils.toPhysics(rawEarth)
        : properties.percInEarth;

    final rawOceans = double.tryParse(properties.percInOceans ?? '');
    final formattedOceans = rawOceans != null
        ? PeriodicUtils.toPhysics(rawOceans)
        : properties.percInOceans;

    final rawHumans = double.tryParse(properties.percInHumans ?? '');
    final formattedHumans = rawHumans != null
        ? PeriodicUtils.toPhysics(rawHumans)
        : properties.percInHumans;

    return ShadAccordionItem<String>(
      value: 'group_abundances',
      title: Row(
        children: [
          const Icon(LucideIcons.mountain, size: 18),
          const SizedBox(width: 8),
          Text(l10n.abundances),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 8.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            PropertyItem(
              label: l10n.percInUniverse,
              value: formattedUniverse,
              unit: '%',
              isHtml: true,
            ),
            PropertyItem(
              label: l10n.percInSun,
              value: formattedSun,
              unit: '%',
              isHtml: true,
            ),
            PropertyItem(
              label: l10n.percInMeteorites,
              value: formattedMeteorites,
              unit: '%',
              isHtml: true,
            ),
            PropertyItem(
              label: l10n.percInEarthsCrust,
              value: formattedEarth,
              unit: '%',
              isHtml: true,
            ),
            PropertyItem(
              label: l10n.percInOceans,
              value: formattedOceans,
              unit: '%',
              isHtml: true,
            ),
            PropertyItem(
              label: l10n.percInHumans,
              value: formattedHumans,
              unit: '%',
              isHtml: true,
            ),
          ],
        ),
      ),
    );
  }
}
