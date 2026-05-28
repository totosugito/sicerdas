import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import '../../../../core/database/database.dart';
import 'element_styles.dart';

class PeriodicCell extends StatelessWidget {
  final PeriodicElement? element;
  final double cellSize;
  final bool isSearchActive;
  final bool isSearchMatch;
  final String theme;
  final VoidCallback? onTap;

  const PeriodicCell({
    super.key,
    required this.element,
    required this.cellSize,
    required this.isSearchActive,
    required this.isSearchMatch,
    required this.theme,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    if (element == null) {
      return SizedBox(
        width: cellSize + 4,
        height: cellSize + 4,
      );
    }

    final el = element!;
    final themeData = ShadTheme.of(context);
    final isDark = themeData.brightness == Brightness.dark;
    final style = getElementStyle(el.atomicGroup, theme, isDark: isDark);

    // Handle empty cells
    if (el.atomicGroup == 'empty') {
      return SizedBox(width: cellSize, height: cellSize);
    }

    // Handle header/text cells
    if (el.atomicGroup == 'header' || el.atomicGroup == 'headerEmpty') {
      final isStickyHeader = el.idx == 0 || el.idy == 0;
      return Container(
        width: el.idx == 0 ? cellSize / 2 : cellSize,
        height: el.idy == 0 || el.idy == 8 ? cellSize / 2 : cellSize,
        margin: const EdgeInsets.all(2),
        decoration: BoxDecoration(
          color: isStickyHeader ? style.background : Colors.transparent,
          borderRadius: BorderRadius.circular(6),
          border: Border.all(
            color: style.border,
            width: 1,
          ),
        ),
        child: Center(
          child: Text(
            el.atomicSymbol,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.bold,
              color: isDark ? Colors.white60 : Colors.black54,
            ),
          ),
        ),
      );
    }

    final isMatchingSearch = !isSearchActive || isSearchMatch;

    // Build decoration based on theme
    Decoration decoration;

    if (theme == 'theme3' && style.gradient != null) {
      // Gradient solid
      decoration = BoxDecoration(
        gradient: LinearGradient(
          colors: style.gradient!,
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: style.border, width: 1),
      );
    } else if (theme == 'theme2' || theme == 'theme4') {
      // Outline / border themes
      decoration = BoxDecoration(
        color: style.background,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: style.border, width: 1.5),
      );
    } else {
      // Theme 1: classic solid
      decoration = BoxDecoration(
        color: style.background,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: style.border, width: 1),
      );
    }

    return Opacity(
      opacity: isMatchingSearch ? 1.0 : 0.2,
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          width: cellSize,
          height: cellSize,
          margin: const EdgeInsets.all(2),
          decoration: decoration,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 2, vertical: 3),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                // Atomic Number
                Align(
                  alignment: Alignment.topLeft,
                  child: Text(
                    el.atomicNumber > 0 ? el.atomicNumber.toString() : '',
                    style: TextStyle(
                      fontSize: 8,
                      fontWeight: FontWeight.bold,
                      color: style.text.withValues(alpha: 0.8),
                    ),
                  ),
                ),
                // Symbol
                Text(
                  el.atomicSymbol,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w900,
                    color: style.text,
                  ),
                ),
                // Name
                Text(
                  el.atomicName,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontSize: 7,
                    fontWeight: FontWeight.w500,
                    color: style.text.withValues(alpha: 0.8),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
