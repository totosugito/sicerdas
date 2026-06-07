import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:flutter_widget_from_html_core/flutter_widget_from_html_core.dart';
import '../../../../core/database/database.dart';
import '../../libs/utils/periodic_utils.dart';
import '../../periodic_screen/widgets/element_styles.dart';

class ElementComparisonCard extends StatelessWidget {
  final PeriodicElement element;
  final String periodicTheme;
  final String sortBy;
  final double value;
  final double percent;
  final bool isDark;
  final VoidCallback onTap;

  const ElementComparisonCard({
    super.key,
    required this.element,
    required this.periodicTheme,
    required this.sortBy,
    required this.value,
    required this.percent,
    required this.isDark,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final elStyle = getElementStyle(
      element.atomicGroup,
      periodicTheme,
      isDark: isDark,
    );
    final unit = PeriodicUtils.getPeriodicUnits(sortBy);
    final shadTheme = ShadTheme.of(context);

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
        side: BorderSide(color: shadTheme.colorScheme.border),
      ),
      color: shadTheme.colorScheme.card,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: Padding(
          padding: const EdgeInsets.all(12.0),
          child: Row(
            children: [
              // Element Symbol Box
              Container(
                width: 52,
                height: 52,
                decoration: BoxDecoration(
                  color: elStyle.background,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: elStyle.border, width: 1),
                  gradient:
                      (periodicTheme == 'theme3' && elStyle.gradient != null)
                      ? LinearGradient(
                          colors: elStyle.gradient!,
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                        )
                      : null,
                ),
                child: Stack(
                  children: [
                    Positioned(
                      left: 5,
                      top: 4,
                      child: Text(
                        '${element.atomicNumber}',
                        style: TextStyle(
                          fontSize: 9,
                          fontWeight: FontWeight.bold,
                          color: elStyle.text.withValues(alpha: 0.8),
                        ),
                      ),
                    ),
                    Center(
                      child: Padding(
                        padding: const EdgeInsets.only(top: 6),
                        child: Text(
                          element.atomicSymbol,
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w900,
                            color: elStyle.text,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),

              // Progress bar & value info
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          element.atomicName,
                          style: shadTheme.textTheme.p.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        HtmlWidget(
                          '${PeriodicUtils.toPhysics(value, precision: sortBy == 'numberOfElectron' ? 0 : -1)}${unit.isNotEmpty ? ' <span style="font-size: 10px; color: #71717a; font-weight: normal;">$unit</span>' : ''}',
                          textStyle: shadTheme.textTheme.small.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(4),
                      child: LinearProgressIndicator(
                        value: percent > 0 ? percent.clamp(0.02, 1.0) : 0.0,
                        backgroundColor: shadTheme.colorScheme.muted.withValues(
                          alpha: 0.5,
                        ),
                        valueColor: AlwaysStoppedAnimation<Color>(
                          elStyle.atomColor,
                        ),
                        minHeight: 8,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
