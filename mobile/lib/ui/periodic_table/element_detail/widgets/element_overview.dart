import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import '../../../../l10n/gen_l10n/app_localizations.dart';
import '../../../widgets/funvas/funvas.dart';
import 'electron_shell.dart';
import '../../libs/utils/periodic_utils.dart';
import '../../libs/models/periodic_models.dart';
import 'property_item.dart';

class ElementOverview extends StatelessWidget {
  final AtomicProperties properties;
  final AtomicImages? images;
  final Color atomColor;
  final String atomSymbol;

  const ElementOverview({
    super.key,
    required this.properties,
    this.images,
    required this.atomColor,
    required this.atomSymbol,
  });

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);
    final l10n = AppLocalizations.of(context)!;
    // Parse discovery year
    final rawYear = properties.discoveryYear ?? '';
    final formattedYear = PeriodicUtils.getDiscoveryYear(
      rawYear,
      l10n.periodicBcYear,
    );

    // Parse atomic weight with toPhysics
    final rawWeight = double.tryParse(properties.atomicWeight ?? '');
    final formattedWeight = rawWeight != null
        ? PeriodicUtils.toPhysics(rawWeight)
        : properties.atomicWeight;

    final spectrumUrl = images?.spectrum;

    final shellList = PeriodicUtils.getElectronShellValue(
      properties.electronShell,
    );
    final calculatedCanvasSize = shellList.isNotEmpty
        ? ((18.0 + 15.0 * shellList.length) * 2.2).clamp(0.0, 300.0)
        : 300.0;

    return ShadAccordionItem<String>(
      value: 'group_overview',
      title: Row(
        children: [
          const Icon(LucideIcons.atom, size: 18),
          const SizedBox(width: 8),
          Text(l10n.periodicOverview),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 8.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            PropertyItem(
              label: l10n.atomicNumber,
              value: properties.atomicNumber,
            ),
            PropertyItem(label: l10n.symbol, value: properties.symbol),
            PropertyItem(label: l10n.name, value: properties.name),
            PropertyItem(label: l10n.latinName, value: properties.latinName),
            PropertyItem(label: l10n.discovery, value: properties.discovery),
            PropertyItem(label: l10n.discoveryYear, value: formattedYear),
            PropertyItem(
              label: l10n.discoveryCountry,
              value: properties.discoveryCountry,
            ),
            PropertyItem(
              label: l10n.atomicWeight,
              value: formattedWeight,
              unit: PeriodicUtils.getPeriodicUnits('atomicWeight'),
              isHtml: true,
            ),
            PropertyItem(
              label: l10n.electronShell,
              value: PeriodicUtils.getElectronShell(properties.electronShell),
            ),
            const SizedBox(height: 16),
            Center(
              child: SizedBox(
                width: calculatedCanvasSize,
                height: calculatedCanvasSize,
                child: FunvasContainer(
                  funvas: ViewElectronShell(
                    atomSymbol: atomSymbol,
                    atomColor: atomColor,
                    electrons: shellList,
                  ),
                ),
              ),
            ),
            if (spectrumUrl != null && spectrumUrl.isNotEmpty) ...[
              const SizedBox(height: 12),
              Text(
                l10n.emissionSpectrum,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                  color: theme.colorScheme.mutedForeground,
                ),
              ),
              const SizedBox(height: 6),
              Container(
                height: 48,
                width: double.infinity,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(6),
                  color: Colors.black,
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(6),
                  child: Image.network(
                    spectrumUrl,
                    fit: BoxFit.contain,
                    errorBuilder: (context, error, stackTrace) =>
                        const SizedBox.shrink(),
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
