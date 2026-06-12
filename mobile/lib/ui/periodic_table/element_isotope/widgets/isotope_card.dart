import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/i18n/strings.g.dart';
import '../element_isotope.dart' show IsotopeData;
import 'isotope_property_item.dart';

class IsotopeCard extends StatelessWidget {
  final Color atomColor;
  final IsotopeData isotope;
  final String atomicSymbol;

  const IsotopeCard({
    super.key,
    required this.atomColor,
    required this.isotope,
    required this.atomicSymbol,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = Translations.of(context);
    final theme = ShadTheme.of(context);
    final isStable = isotope.halfLife == "Stable";
    final hasAtomicWeight =
        isotope.atomicWeight != "None" && isotope.atomicWeight.isNotEmpty;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: theme.colorScheme.card.withValues(alpha: 0.5),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: theme.colorScheme.border.withValues(alpha: 0.5),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(12),
        child: Container(
          decoration: isStable
              ? BoxDecoration(
                  border: Border(
                    left: BorderSide(color: Colors.green.shade500, width: 4),
                  ),
                )
              : null,
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Stack(
                    clipBehavior: Clip.none,
                    children: [
                      Padding(
                        padding: const EdgeInsets.only(left: 14.0, top: 4.0),
                        child: Text(
                          atomicSymbol,
                          style: TextStyle(
                            fontSize: 32,
                            fontWeight: FontWeight.bold,
                            color: atomColor,
                          ),
                        ),
                      ),
                      Positioned(
                        top: -2,
                        left: 0,
                        child: Text(
                          '${isotope.id}',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                            fontFamily: 'monospace',
                            color: atomColor,
                          ),
                        ),
                      ),
                    ],
                  ),
                  if (hasAtomicWeight)
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          l10n.periodic_table.atomicWeight,
                          style: TextStyle(
                            fontSize: 11,
                            color: theme.colorScheme.mutedForeground,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.baseline,
                          textBaseline: TextBaseline.alphabetic,
                          children: [
                            Text(
                              isotope.atomicWeight,
                              style: const TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(width: 2),
                            Text(
                              ' g/mol',
                              style: TextStyle(
                                fontSize: 11,
                                color: theme.colorScheme.mutedForeground,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                ],
              ),
              const SizedBox(height: 16),
              _buildPropertyGrid(context, theme, l10n),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPropertyGrid(
    BuildContext context,
    ShadThemeData theme,
    Translations l10n,
  ) {
    final items = <Widget>[];

    if (isotope.sIdentified.isNotEmpty) {
      items.add(
        IsotopePropertyItem(
          label: l10n.periodic_table.spinParity,
          value: isotope.sIdentified,
          isHtml: true,
        ),
      );
    }
    if (isotope.halfLife.isNotEmpty) {
      items.add(
        IsotopePropertyItem(
          label: l10n.periodic_table.halfLife,
          value: isotope.halfLife,
          isHtml: true,
        ),
      );
    }
    if (isotope.massExcess.isNotEmpty && isotope.massExcess != 'None') {
      items.add(
        IsotopePropertyItem(label: l10n.periodic_table.massExcess, value: isotope.massExcess),
      );
    }
    if (isotope.bindingEnergy.isNotEmpty && isotope.bindingEnergy != 'None') {
      items.add(
        IsotopePropertyItem(
          label: l10n.periodic_table.bindingEnergy,
          value: isotope.bindingEnergy,
        ),
      );
    }
    if (isotope.magneticMoment.isNotEmpty && isotope.magneticMoment != 'None') {
      items.add(
        IsotopePropertyItem(
          label: l10n.periodic_table.magneticMoment,
          value: isotope.magneticMoment,
        ),
      );
    }
    if (isotope.quadrupoleMoment.isNotEmpty &&
        isotope.quadrupoleMoment != 'None') {
      items.add(
        IsotopePropertyItem(
          label: l10n.periodic_table.quadrupoleMomentIsotope,
          value: isotope.quadrupoleMoment,
        ),
      );
    }
    if (isotope.abundance.isNotEmpty && isotope.abundance != 'None') {
      items.add(
        IsotopePropertyItem(label: l10n.periodic_table.abundance, value: isotope.abundance),
      );
    }

    return Column(children: items);
  }
}
