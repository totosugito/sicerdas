import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/i18n/strings.g.dart';
import '../../libs/utils/periodic_utils.dart';
import '../../libs/models/periodic_models.dart';
import 'property_item.dart';

class ElementThermal extends StatelessWidget {
  final AtomicProperties properties;

  const ElementThermal({super.key, required this.properties});

  @override
  Widget build(BuildContext context) {
    final l10n = Translations.of(context);

    final rawMelting = double.tryParse(properties.meltingPoint ?? '');
    final formattedMelting = rawMelting != null
        ? PeriodicUtils.celsiusToOther(rawMelting)
        : properties.meltingPoint;

    final rawBoiling = double.tryParse(properties.boilingPoint ?? '');
    final formattedBoiling = rawBoiling != null
        ? PeriodicUtils.celsiusToOther(rawBoiling)
        : properties.boilingPoint;

    final rawCriticalTemp = double.tryParse(
      properties.criticalTemperature ?? '',
    );
    final formattedCriticalTemp = rawCriticalTemp != null
        ? PeriodicUtils.kelvinToOther(rawCriticalTemp)
        : properties.criticalTemperature;

    final rawCriticalPress = double.tryParse(properties.criticalPressure ?? '');
    final formattedCriticalPress = rawCriticalPress != null
        ? PeriodicUtils.toPhysics(rawCriticalPress)
        : properties.criticalPressure;

    final rawHeatFusion = double.tryParse(properties.heatOfFusion ?? '');
    final formattedHeatFusion = rawHeatFusion != null
        ? PeriodicUtils.toPhysics(rawHeatFusion)
        : properties.heatOfFusion;

    final rawHeatVapor = double.tryParse(properties.heatOfVaporization ?? '');
    final formattedHeatVapor = rawHeatVapor != null
        ? PeriodicUtils.toPhysics(rawHeatVapor)
        : properties.heatOfVaporization;

    final rawSpecificHeat = double.tryParse(properties.specificHeat ?? '');
    final formattedSpecificHeat = rawSpecificHeat != null
        ? PeriodicUtils.toPhysics(rawSpecificHeat)
        : properties.specificHeat;

    final rawNeel = double.tryParse(properties.neelPoint ?? '');
    final formattedNeel = rawNeel != null
        ? PeriodicUtils.toPhysics(rawNeel)
        : properties.neelPoint;

    final rawThermalCond = double.tryParse(
      properties.thermalConductivity ?? '',
    );
    final formattedThermalCond = rawThermalCond != null
        ? PeriodicUtils.toPhysics(rawThermalCond)
        : properties.thermalConductivity;

    final rawThermalExpand = double.tryParse(properties.thermalExpansion ?? '');
    final formattedThermalExpand = rawThermalExpand != null
        ? PeriodicUtils.toPhysics(rawThermalExpand)
        : properties.thermalExpansion;

    return ShadAccordionItem<String>(
      value: 'group_thermal',
      title: Row(
        children: [
          const Icon(LucideIcons.thermometer, size: 18),
          const SizedBox(width: 8),
          Text(l10n.periodic_table.thermalProperties),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 8.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            PropertyItem(label: l10n.periodic_table.phase, value: properties.phase),
            PropertyItem(
              label: l10n.periodic_table.meltingPoint,
              value: formattedMelting,
              isMultiline: true,
            ),
            PropertyItem(
              label: l10n.periodic_table.boilingPoint,
              value: formattedBoiling,
              isMultiline: true,
            ),
            PropertyItem(
              label: l10n.periodic_table.criticalTemperature,
              value: formattedCriticalTemp,
              isMultiline: true,
            ),
            PropertyItem(
              label: l10n.periodic_table.criticalPressure,
              value: formattedCriticalPress,
              unit: PeriodicUtils.getPeriodicUnits('criticalPressure'),
              isHtml: true,
            ),
            PropertyItem(
              label: l10n.periodic_table.heatOfFusion,
              value: formattedHeatFusion,
              unit: PeriodicUtils.getPeriodicUnits('heatOfFusion'),
              isHtml: true,
            ),
            PropertyItem(
              label: l10n.periodic_table.heatOfVaporization,
              value: formattedHeatVapor,
              unit: PeriodicUtils.getPeriodicUnits('heatOfVaporization'),
              isHtml: true,
            ),
            PropertyItem(
              label: l10n.periodic_table.specificHeat,
              value: formattedSpecificHeat,
              unit: PeriodicUtils.getPeriodicUnits('specificHeat'),
              isHtml: true,
            ),
            PropertyItem(
              label: l10n.periodic_table.adiabaticIndex,
              value: properties.adiabaticIndex,
            ),
            PropertyItem(
              label: l10n.periodic_table.neelPoint,
              value: formattedNeel,
              unit: PeriodicUtils.getPeriodicUnits('neelPoint'),
              isHtml: true,
            ),
            PropertyItem(
              label: l10n.periodic_table.thermalConductivity,
              value: formattedThermalCond,
              unit: PeriodicUtils.getPeriodicUnits('thermalConductivity'),
              isHtml: true,
            ),
            PropertyItem(
              label: l10n.periodic_table.thermalExpansion,
              value: formattedThermalExpand,
              unit: PeriodicUtils.getPeriodicUnits('thermalExpansion'),
              isHtml: true,
            ),
          ],
        ),
      ),
    );
  }
}
