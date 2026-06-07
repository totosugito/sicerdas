import 'package:flutter/material.dart';
import '../../../../l10n/gen_l10n/app_localizations.dart';
import '../../libs/utils/periodic_utils.dart';
import 'element_styles.dart';

class PeriodicTableLegend extends StatelessWidget {
  final String theme;
  final double baseCellSize;

  const PeriodicTableLegend({
    super.key,
    required this.theme,
    required this.baseCellSize,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final double containerWidth = 10 * (baseCellSize + 4);
    // Subtract safe padding/spacing threshold (60.0) to ensure 3 columns fit perfectly
    final double itemWidth = (containerWidth - 60) / 3;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8.0, vertical: 6.0),
      child: Wrap(
        spacing: 8.0,
        runSpacing: 10.0,
        children: PeriodicUtils.legendGroups.map((group) {
          final style = getElementStyle(group, theme, isDark: isDark);
          final label = PeriodicUtils.getLocalizedSeries(l10n, group);

          Decoration boxDecoration;
          if (theme == 'theme3' && style.gradient != null) {
            boxDecoration = BoxDecoration(
              gradient: LinearGradient(
                colors: style.gradient!,
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
              ),
              borderRadius: BorderRadius.circular(4),
              border: Border.all(color: style.border, width: 0.7),
            );
          } else if (theme == 'theme2' || theme == 'theme4') {
            boxDecoration = BoxDecoration(
              color: style.background,
              borderRadius: BorderRadius.circular(4),
              border: Border.all(color: style.border, width: 1.0),
            );
          } else {
            boxDecoration = BoxDecoration(
              color: style.background,
              borderRadius: BorderRadius.circular(4),
              border: Border.all(color: style.border, width: 0.7),
            );
          }

          return SizedBox(
            width: itemWidth,
            child: Row(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Container(
                  width: 14,
                  height: 14,
                  decoration: boxDecoration,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    label,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontSize: 10.5,
                      fontWeight: FontWeight.w600,
                      color: isDark ? Colors.white70 : Colors.black87,
                    ),
                  ),
                ),
              ],
            ),
          );
        }).toList(),
      ),
    );
  }
}
