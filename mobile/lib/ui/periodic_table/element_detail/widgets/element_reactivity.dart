import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import '../../../../l10n/gen_l10n/app_localizations.dart';
import '../../libs/utils/periodic-utils.dart';
import '../../libs/models/periodic_models.dart';
import 'property_item.dart';

class ElementReactivity extends StatelessWidget {
  final AtomicProperties properties;

  const ElementReactivity({super.key, required this.properties});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

    final rawElectronegativity = double.tryParse(
      properties.electronegativity ?? '',
    );
    final formattedElectronegativity = rawElectronegativity != null
        ? PeriodicUtils.toPhysics(rawElectronegativity)
        : properties.electronegativity;

    final rawElectronAffinity = double.tryParse(
      properties.electronAffinity ?? '',
    );
    final formattedElectronAffinity = rawElectronAffinity != null
        ? PeriodicUtils.toPhysics(rawElectronAffinity)
        : properties.electronAffinity;

    final rawPauling = double.tryParse(
      properties.electronegativityPaulingScale ?? '',
    );
    final formattedPauling = rawPauling != null
        ? PeriodicUtils.toPhysics(rawPauling)
        : properties.electronegativityPaulingScale;

    final rawAllen = double.tryParse(
      properties.electronegativityAllenScale ?? '',
    );
    final formattedAllen = rawAllen != null
        ? PeriodicUtils.toPhysics(rawAllen)
        : properties.electronegativityAllenScale;

    final formattedIonization = properties.ionizationEnergies?.replaceAll(
      ' kJ/mol',
      '',
    );

    return ShadAccordionItem<String>(
      value: 'group_reactivity',
      title: Row(
        children: [
          const Icon(LucideIcons.flame, size: 18),
          const SizedBox(width: 8),
          Text(l10n.reactivity),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 8.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            PropertyItem(label: l10n.valence, value: properties.valence),
            PropertyItem(
              label: l10n.electronegativity,
              value: formattedElectronegativity,
              isHtml: true,
            ),
            PropertyItem(
              label: l10n.electronAffinity,
              value: formattedElectronAffinity,
              unit: PeriodicUtils.getPeriodicUnits('electronAffinity'),
              isHtml: true,
            ),
            PropertyItem(
              label: l10n.electronegativityPaulingScale,
              value: formattedPauling,
              isHtml: true,
            ),
            PropertyItem(
              label: l10n.electronegativityAllenScale,
              value: formattedAllen,
              isHtml: true,
            ),
            PropertyItem(
              label: l10n.ionizationEnergies,
              value: formattedIonization,
              unit: PeriodicUtils.getPeriodicUnits('ionizationEnergies'),
            ),
          ],
        ),
      ),
    );
  }
}
