import 'package:flutter/material.dart';
import 'package:bse/core/database/database.dart';
import '../../periodic_screen/widgets/element_styles.dart';

class PeriodicHeroCell extends StatelessWidget {
  final PeriodicElement element;
  final String theme;
  final bool isDark;
  final double size;

  const PeriodicHeroCell({
    super.key,
    required this.element,
    required this.theme,
    required this.isDark,
    this.size = 72.0,
  });

  @override
  Widget build(BuildContext context) {
    final style = getElementStyle(element.atomicGroup, theme, isDark: isDark);

    Decoration decoration;
    if (theme == 'theme3' && style.gradient != null) {
      decoration = BoxDecoration(
        gradient: LinearGradient(
          colors: style.gradient!,
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: style.border, width: 1),
      );
    } else if (theme == 'theme2' || theme == 'theme4') {
      decoration = BoxDecoration(
        color: style.background,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: style.border, width: 1.5),
      );
    } else {
      decoration = BoxDecoration(
        color: style.background,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: style.border, width: 1),
      );
    }

    return Container(
      width: size,
      height: size,
      decoration: decoration,
      child: Stack(
        children: [
          Positioned(
            top: 4,
            left: 6,
            child: Text(
              '${element.atomicNumber}',
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.bold,
                fontFamily: 'monospace',
                color: style.text.withValues(alpha: 0.8),
              ),
            ),
          ),
          Center(
            child: Text(
              element.atomicSymbol,
              style: TextStyle(
                fontSize: 32,
                fontWeight: FontWeight.bold,
                color: style.text,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
