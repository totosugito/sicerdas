import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import '../../../../l10n/gen_l10n/app_localizations.dart';
import '../../utils/periodic-utils.dart';
import '../../models/periodic_models.dart';
import 'property_item.dart';

class ElementBulkPhysical extends StatelessWidget {
  final AtomicProperties properties;

  const ElementBulkPhysical({super.key, required this.properties});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

    final rawDensity = double.tryParse(properties.density ?? '');
    final formattedDensity = rawDensity != null
        ? PeriodicUtils.toPhysics(rawDensity)
        : properties.density;

    final rawDensityLiquid = double.tryParse(properties.densityLiquid ?? '');
    final formattedDensityLiquid = rawDensityLiquid != null
        ? PeriodicUtils.toPhysics(rawDensityLiquid)
        : properties.densityLiquid;

    final rawMolarVolume = double.tryParse(properties.molarVolume ?? '');
    final formattedMolarVolume = rawMolarVolume != null
        ? PeriodicUtils.toPhysics(rawMolarVolume)
        : properties.molarVolume;

    final rawBrinell = double.tryParse(properties.brinellHardness ?? '');
    final formattedBrinell = rawBrinell != null
        ? PeriodicUtils.toPhysics(rawBrinell)
        : properties.brinellHardness;

    final rawMohs = double.tryParse(properties.mohsHardness ?? '');
    final formattedMohs = rawMohs != null
        ? PeriodicUtils.toPhysics(rawMohs)
        : properties.mohsHardness;

    final rawVickers = double.tryParse(properties.vickersHardness ?? '');
    final formattedVickers = rawVickers != null
        ? PeriodicUtils.toPhysics(rawVickers)
        : properties.vickersHardness;

    final rawBulkModulus = double.tryParse(properties.bulkModulus ?? '');
    final formattedBulkModulus = rawBulkModulus != null
        ? PeriodicUtils.toPhysics(rawBulkModulus)
        : properties.bulkModulus;

    final rawShearModulus = double.tryParse(properties.shearModulus ?? '');
    final formattedShearModulus = rawShearModulus != null
        ? PeriodicUtils.toPhysics(rawShearModulus)
        : properties.shearModulus;

    final rawYoungModulus = double.tryParse(properties.youngModulus ?? '');
    final formattedYoungModulus = rawYoungModulus != null
        ? PeriodicUtils.toPhysics(rawYoungModulus)
        : properties.youngModulus;

    final rawPoisson = double.tryParse(properties.poissonRatio ?? '');
    final formattedPoisson = rawPoisson != null
        ? PeriodicUtils.toPhysics(rawPoisson)
        : properties.poissonRatio;

    final rawRefractive = double.tryParse(properties.refractiveIndex ?? '');
    final formattedRefractive = rawRefractive != null
        ? PeriodicUtils.toPhysics(rawRefractive)
        : properties.refractiveIndex;

    final rawSpeed = double.tryParse(properties.speedOfSound ?? '');
    final formattedSpeed = rawSpeed != null
        ? PeriodicUtils.toPhysics(rawSpeed)
        : properties.speedOfSound;

    return ShadAccordionItem<String>(
      value: 'group_bulk_physical',
      title: Row(
        children: [
          const Icon(LucideIcons.weight, size: 18),
          const SizedBox(width: 8),
          Text(l10n.bulkPhysicalProperties),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 8.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            PropertyItem(
              label: l10n.density,
              value: formattedDensity,
              unit: PeriodicUtils.getPeriodicUnits('density'),
              isHtml: true,
            ),
            PropertyItem(
              label: l10n.densityLiquid,
              value: formattedDensityLiquid,
              unit: PeriodicUtils.getPeriodicUnits('density'),
              isHtml: true,
            ),
            PropertyItem(
              label: l10n.molarVolume,
              value: formattedMolarVolume,
              isHtml: true,
            ),
            PropertyItem(
              label: l10n.brinellHardness,
              value: formattedBrinell,
              unit: PeriodicUtils.getPeriodicUnits('brinellHardness'),
              isHtml: true,
            ),
            PropertyItem(
              label: l10n.mohsHardness,
              value: formattedMohs,
              unit: PeriodicUtils.getPeriodicUnits('mohsHardness'),
              isHtml: true,
            ),
            PropertyItem(
              label: l10n.vickersHardness,
              value: formattedVickers,
              unit: PeriodicUtils.getPeriodicUnits('vickersHardness'),
              isHtml: true,
            ),
            PropertyItem(
              label: l10n.bulkModulus,
              value: formattedBulkModulus,
              unit: PeriodicUtils.getPeriodicUnits('bulkModulus'),
              isHtml: true,
            ),
            PropertyItem(
              label: l10n.shearModulus,
              value: formattedShearModulus,
              unit: PeriodicUtils.getPeriodicUnits('shearModulus'),
              isHtml: true,
            ),
            PropertyItem(
              label: l10n.youngModulus,
              value: formattedYoungModulus,
              unit: PeriodicUtils.getPeriodicUnits('youngModulus'),
              isHtml: true,
            ),
            PropertyItem(
              label: l10n.poissonRatio,
              value: formattedPoisson,
              isHtml: true,
            ),
            PropertyItem(
              label: l10n.refractiveIndex,
              value: formattedRefractive,
              isHtml: true,
            ),
            PropertyItem(
              label: l10n.speedOfSound,
              value: formattedSpeed,
              unit: PeriodicUtils.getPeriodicUnits('speedOfSound'),
              isHtml: true,
            ),
          ],
        ),
      ),
    );
  }
}
