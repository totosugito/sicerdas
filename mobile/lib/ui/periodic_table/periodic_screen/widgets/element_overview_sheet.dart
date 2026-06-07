import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import '../../../../core/database/database.dart';
import '../../../../l10n/gen_l10n/app_localizations.dart';
import '../../libs/models/periodic_models.dart';
import '../../libs/utils/periodic_utils.dart';
import 'element_styles.dart';

class ElementOverviewSheet extends StatelessWidget {
  final PeriodicElement element;
  final String theme;
  final VoidCallback onViewDetails;

  const ElementOverviewSheet({
    super.key,
    required this.element,
    required this.theme,
    required this.onViewDetails,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final shadTheme = ShadTheme.of(context);
    final isDark = shadTheme.brightness == Brightness.dark;
    
    final elStyle = getElementStyle(element.atomicGroup, theme, isDark: isDark);
    
    final Map<String, dynamic> propertiesMap =
        jsonDecode(element.atomicProperties) as Map<String, dynamic>? ?? {};
    final properties = AtomicProperties.fromJson(propertiesMap);

    Widget renderProperty(String label, String? value) {
      if (value == null || value.trim().isEmpty) return const SizedBox.shrink();
      return Container(
        padding: const EdgeInsets.symmetric(vertical: 8),
        decoration: BoxDecoration(
          border: Border(
            bottom: BorderSide(
              color: shadTheme.colorScheme.border,
              width: 0.5,
            ),
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              label,
              style: shadTheme.textTheme.muted.copyWith(fontSize: 13),
            ),
            Flexible(
              child: Text(
                value,
                textAlign: TextAlign.right,
                style: shadTheme.textTheme.small.copyWith(
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ],
        ),
      );
    }

    // Prepare overview fields
    final weight = properties.atomicWeight != null
        ? '${properties.atomicWeight} ${PeriodicUtils.getPeriodicUnits("atomicWeight")}'
        : null;
    final groupVal = properties.group != null
        ? '${properties.group}${PeriodicUtils.getColumnGroup(properties.group!)}'
        : null;
    final seriesVal = PeriodicUtils.getLocalizedSeries(l10n, properties.series);

    return Container(
      decoration: BoxDecoration(
        color: shadTheme.colorScheme.background,
        borderRadius: const BorderRadius.only(
          topLeft: Radius.circular(16),
          topRight: Radius.circular(16),
        ),
      ),
      padding: EdgeInsets.only(
        left: 20,
        right: 20,
        bottom: MediaQuery.of(context).padding.bottom + 20,
        top: 10,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Drag handle
          Center(
            child: Container(
              width: 40,
              height: 4,
              margin: const EdgeInsets.only(bottom: 20),
              decoration: BoxDecoration(
                color: shadTheme.colorScheme.border,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          
          // Header info: mini periodic cell representation + Name/Symbol
          Row(
            children: [
              // Beautiful element style representation box
              Container(
                width: 64,
                height: 64,
                decoration: BoxDecoration(
                  color: elStyle.background,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: elStyle.border, width: 1.5),
                  gradient: (theme == 'theme3' && elStyle.gradient != null)
                      ? LinearGradient(
                          colors: elStyle.gradient!,
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                        )
                      : null,
                ),
                child: Center(
                  child: Text(
                    element.atomicSymbol,
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w900,
                      color: elStyle.text,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      element.atomicName,
                      style: shadTheme.textTheme.large.copyWith(
                        fontWeight: FontWeight.bold,
                        fontSize: 20,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${element.atomicSymbol} • ${l10n.atomicNumber} ${element.atomicNumber}',
                      style: shadTheme.textTheme.muted,
                    ),
                  ],
                ),
              ),
              IconButton(
                icon: const Icon(Icons.close),
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),
          const SizedBox(height: 20),
          
          // Key Properties Section
          Container(
            decoration: BoxDecoration(
              color: shadTheme.colorScheme.muted.withValues(alpha: 0.3),
              borderRadius: BorderRadius.circular(10),
            ),
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(
                      LucideIcons.info,
                      size: 16,
                      color: shadTheme.colorScheme.foreground,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      l10n.periodicOverview,
                      style: shadTheme.textTheme.small.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                renderProperty(l10n.atomicWeight, weight),
                renderProperty(l10n.phase, properties.phase),
                renderProperty(l10n.group, groupVal),
                renderProperty(l10n.period, properties.period),
                renderProperty(l10n.block, properties.block),
                renderProperty(l10n.series, seriesVal),
                renderProperty(l10n.color, properties.color),
              ],
            ),
          ),
          const SizedBox(height: 20),
          
          // Details button
          ShadButton(
            width: double.infinity,
            onPressed: onViewDetails,
            child: Text(l10n.viewDetails),
          ),
        ],
      ),
    );
  }
}
