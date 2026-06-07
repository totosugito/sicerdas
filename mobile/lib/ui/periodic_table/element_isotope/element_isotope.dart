import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../libs/providers/periodic_provider.dart';
import '../../../core/database/database.dart';
import '../../../../l10n/gen_l10n/app_localizations.dart';
import '../periodic_screen/widgets/element_styles.dart';
import 'widgets/periodic_hero_cell.dart';
import '../libs/models/periodic_models.dart';
import '../libs/utils/periodic_utils.dart';
import 'widgets/isotope_card.dart';

class IsotopeData {
  final int id;
  final String sIdentified;
  final String halfLife;
  final String spinParity;
  final String atomicWeight;
  final String abundance;
  final String massExcess;
  final String bindingEnergy;
  final String magneticMoment;
  final String quadrupoleMoment;

  IsotopeData({
    required this.id,
    required this.sIdentified,
    required this.halfLife,
    required this.spinParity,
    required this.atomicWeight,
    required this.abundance,
    required this.massExcess,
    required this.bindingEnergy,
    required this.magneticMoment,
    required this.quadrupoleMoment,
  });
}

class ElementIsotopeScreen extends ConsumerWidget {
  final PeriodicElement element;

  const ElementIsotopeScreen({super.key, required this.element});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = ShadTheme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final l10n = AppLocalizations.of(context)!;

    final periodicTheme = ref.watch(periodicThemeProvider);

    final elStyle = getElementStyle(
      element.atomicGroup,
      periodicTheme,
      isDark: isDark,
    );
    final Color atomColor = elStyle.atomColor;

    final Map<String, dynamic> properties =
        jsonDecode(element.atomicProperties) as Map<String, dynamic>? ?? {};
    final atomicProperties = AtomicProperties.fromJson(properties);

    final knownIsotopes = atomicProperties.knownIsotopes ?? [];
    final stableIsotopes = atomicProperties.stableIsotopes ?? [];
    final totalIsotopes = knownIsotopes.length;
    final stableCount = stableIsotopes.length;
    final unstableCount = totalIsotopes - stableCount;

    final Map<String, dynamic> isotopeMap =
        jsonDecode(element.atomicIsotope) as Map<String, dynamic>? ?? {};

    final List<IsotopeData> isotopesList = [];
    for (int i = 0; i < knownIsotopes.length; i++) {
      final id = knownIsotopes[i];
      final dynamic data = isotopeMap[i.toString()];
      if (data == null) {
        isotopesList.add(
          IsotopeData(
            id: id,
            sIdentified: "",
            halfLife: "",
            spinParity: "",
            atomicWeight: "",
            abundance: "",
            massExcess: "",
            bindingEnergy: "",
            magneticMoment: "",
            quadrupoleMoment: "",
          ),
        );
      } else {
        final values = List<String>.from(data['v'] as List? ?? []);
        isotopesList.add(
          IsotopeData(
            id: id,
            sIdentified: (data['s'] as String?) ?? "",
            halfLife: values.isNotEmpty ? values[0] : "",
            spinParity: values.length > 1 ? values[1] : "",
            atomicWeight: values.length > 2 ? values[2] : "",
            abundance: values.length > 3 ? values[3] : "",
            massExcess: values.length > 4 ? values[4] : "",
            bindingEnergy: values.length > 5 ? values[5] : "",
            magneticMoment: values.length > 6 ? values[6] : "",
            quadrupoleMoment: values.length > 7 ? values[7] : "",
          ),
        );
      }
    }

    return Scaffold(
      appBar: AppBar(
        title: Text('${element.atomicName} - ${l10n.periodicIsotopes}'),
        centerTitle: false,
        backgroundColor: theme.colorScheme.background,
        elevation: 0,
        foregroundColor: theme.colorScheme.foreground,
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Hero Row
              Row(
                children: [
                  PeriodicHeroCell(
                    element: element,
                    theme: periodicTheme,
                    isDark: isDark,
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          element.atomicName,
                          style: const TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          PeriodicUtils.getLocalizedSeries(
                            l10n,
                            atomicProperties.series,
                          ),
                          style: TextStyle(
                            fontSize: 13,
                            color: theme.colorScheme.mutedForeground,
                          ),
                        ),
                        Text(
                          '${atomicProperties.atomicWeight ?? ""} g/mol',
                          style: TextStyle(
                            fontSize: 12,
                            color: theme.colorScheme.mutedForeground,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // Statistics grid
              Row(
                children: [
                  _buildStatCard(
                    context,
                    theme,
                    '$totalIsotopes',
                    l10n.total,
                    atomColor,
                  ),
                  const SizedBox(width: 8),
                  _buildStatCard(
                    context,
                    theme,
                    '$stableCount',
                    l10n.stable,
                    Colors.green,
                  ),
                  const SizedBox(width: 8),
                  _buildStatCard(
                    context,
                    theme,
                    '$unstableCount',
                    l10n.unstable,
                    Colors.red,
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // Description section
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: theme.colorScheme.muted.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: theme.colorScheme.border.withValues(alpha: 0.4),
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      l10n.isotopeInformation,
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      l10n.isotopeDescription(
                        element.atomicName,
                        totalIsotopes,
                        stableCount,
                        unstableCount,
                      ),
                      style: TextStyle(
                        fontSize: 13,
                        color: theme.colorScheme.mutedForeground,
                        height: 1.4,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // Isotopes List
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: isotopesList.length,
                itemBuilder: (context, index) {
                  return IsotopeCard(
                    atomColor: atomColor,
                    isotope: isotopesList[index],
                    atomicSymbol: element.atomicSymbol,
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatCard(
    BuildContext context,
    ShadThemeData theme,
    String value,
    String label,
    Color textColor,
  ) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
        decoration: BoxDecoration(
          color: theme.colorScheme.card,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: theme.colorScheme.border),
        ),
        child: Column(
          children: [
            Text(
              value,
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                color: textColor,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              label.toUpperCase(),
              style: TextStyle(
                fontSize: 9,
                fontWeight: FontWeight.w600,
                color: theme.colorScheme.mutedForeground,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
