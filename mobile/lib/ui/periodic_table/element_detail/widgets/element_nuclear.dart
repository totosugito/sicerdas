import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import '../../../../l10n/gen_l10n/app_localizations.dart';
import '../../libs/utils/periodic-utils.dart';
import '../../libs/models/periodic_models.dart';
import 'property_item.dart';

class ElementNuclear extends StatelessWidget {
  final AtomicProperties properties;

  const ElementNuclear({super.key, required this.properties});

  String _createAtomIsotopeTag(String symbol, List<int>? idxList) {
    if (idxList == null || idxList.isEmpty) return '';
    return idxList
        .map((idx) => '<sup><small>$idx</small></sup>$symbol')
        .join(', ');
  }

  String _getIsotopeAbundance(String symbol, List<dynamic>? idxList) {
    if (idxList == null || idxList.isEmpty) return '';
    final List<String> parts = [];
    for (final item in idxList) {
      if (item is Map) {
        final s = item['s'];
        final vRaw = item['v'];
        if (s != null && vRaw != null) {
          final double? v = double.tryParse(vRaw.toString());
          final formattedV = v != null
              ? PeriodicUtils.toPhysics(v)
              : vRaw.toString();
          parts.add('<sup><small>$s</small></sup>$symbol ($formattedV %)');
        }
      }
    }
    return parts.join(', ');
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

    final rawCrossSection = double.tryParse(
      properties.neutronCrossSection ?? '',
    );
    final formattedCrossSection = rawCrossSection != null
        ? PeriodicUtils.toPhysics(rawCrossSection)
        : properties.neutronCrossSection;

    final rawMassAbs = double.tryParse(properties.neutronMassAbsorption ?? '');
    final formattedMassAbs = rawMassAbs != null
        ? PeriodicUtils.toPhysics(rawMassAbs)
        : properties.neutronMassAbsorption;

    final symbol = properties.symbol ?? '';

    final knownIsotopesVal = _createAtomIsotopeTag(
      symbol,
      properties.knownIsotopes,
    );
    final stableIsotopesVal = _createAtomIsotopeTag(
      symbol,
      properties.stableIsotopes,
    );
    final isotopicAbundancesVal = _getIsotopeAbundance(
      symbol,
      properties.isotopicAbundances,
    );

    return ShadAccordionItem<String>(
      value: 'group_nuclear',
      title: Row(
        children: [
          const Icon(LucideIcons.atom, size: 18),
          const SizedBox(width: 8),
          Text(l10n.nuclearProperties),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 8.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            PropertyItem(label: l10n.halfLife, value: properties.halfLife),
            PropertyItem(label: l10n.lifetime, value: properties.lifetime),
            PropertyItem(label: l10n.decayMode, value: properties.decayMode),
            PropertyItem(
              label: l10n.quantumNumbers,
              value: properties.quantumNumbers,
              isHtml: true,
            ),
            PropertyItem(
              label: l10n.neutronCrossSection,
              value: formattedCrossSection,
              isHtml: true,
            ),
            PropertyItem(
              label: l10n.neutronMassAbsorption,
              value: formattedMassAbs,
              isHtml: true,
            ),
            PropertyItem(
              label: l10n.knownIsotopes,
              value: knownIsotopesVal.isNotEmpty ? knownIsotopesVal : null,
              isHtml: true,
              isMultiline: true,
            ),
            PropertyItem(
              label: l10n.stableIsotopes,
              value: stableIsotopesVal.isNotEmpty ? stableIsotopesVal : null,
              isHtml: true,
              isMultiline: true,
            ),
            PropertyItem(
              label: l10n.isotopicAbundances,
              value: isotopicAbundancesVal.isNotEmpty
                  ? isotopicAbundancesVal
                  : null,
              isHtml: true,
              isMultiline: true,
            ),
          ],
        ),
      ),
    );
  }
}
