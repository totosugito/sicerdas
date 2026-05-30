import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import '../../../../core/database/database.dart';
import '../../periodic-screen/widgets/element_styles.dart';

class ElementHero extends StatelessWidget {
  final PeriodicElement element;
  final String periodicTheme;
  final bool isDark;

  const ElementHero({
    super.key,
    required this.element,
    required this.periodicTheme,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);
    final elStyle = getElementStyle(
      element.atomicGroup,
      periodicTheme,
      isDark: isDark,
    );

    return Container(
      decoration: BoxDecoration(
        color: elStyle.background,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: elStyle.border, width: 2),
        gradient: elStyle.gradient != null
            ? LinearGradient(
                colors: elStyle.gradient!,
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              )
            : null,
        boxShadow: [
          BoxShadow(
            color: elStyle.atomColor.withValues(alpha: 0.15),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      padding: const EdgeInsets.all(24),
      child: Row(
        children: [
          // Large Symbol representation
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: isDark ? Colors.black26 : Colors.white24,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: elStyle.text.withValues(alpha: 0.2),
              ),
            ),
            child: Center(
              child: Text(
                element.atomicSymbol,
                style: TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                  color: elStyle.text,
                ),
              ),
            ),
          ),
          const SizedBox(width: 20),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  element.atomicName,
                  style: theme.textTheme.h3.copyWith(
                    color: elStyle.text,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Atomic Number: ${element.atomicNumber}',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    color: elStyle.text.withValues(alpha: 0.8),
                  ),
                ),
                Text(
                  'Group: ${element.atomicGroup.replaceAll('_', ' ').toUpperCase()}',
                  style: TextStyle(
                    fontSize: 12,
                    color: elStyle.text.withValues(alpha: 0.7),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
