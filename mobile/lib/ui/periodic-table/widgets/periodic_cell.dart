import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import '../../../core/database/database.dart';

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

  Color _getGroupColor(String group, bool isDark) {
    switch (group) {
      case 'alkali_metals':
        return isDark ? const Color(0xFF991B1B) : const Color(0xFFFEE2E2);
      case 'alkaline_earth_metals':
        return isDark ? const Color(0xFF9A3412) : const Color(0xFFFFEDD5);
      case 'transition_metals':
        return isDark ? const Color(0xFF854D0E) : const Color(0xFFFEF9C3);
      case 'post_transition_metals':
        return isDark ? const Color(0xFF1E3A8A) : const Color(0xFFDBEAFE);
      case 'metalloids':
        return isDark ? const Color(0xFF115E59) : const Color(0xFFCCFBF1);
      case 'othernonmetals':
      case 'other_nonmetals':
        return isDark ? const Color(0xFF065F46) : const Color(0xFFD1FAE5);
      case 'halogens':
        return isDark ? const Color(0xFF5B21B6) : const Color(0xFFEDE9FE);
      case 'noble_gases':
        return isDark ? const Color(0xFF86198F) : const Color(0xFFFDF4FF);
      case 'lanthanoids':
        return isDark ? const Color(0xFF9D174D) : const Color(0xFFFCE7F3);
      case 'actinoids':
        return isDark ? const Color(0xFF9F1239) : const Color(0xFFFFE4E6);
      default:
        return isDark ? const Color(0xFF27272A) : const Color(0xFFF4F4F5);
    }
  }

  Color _getGroupTextColor(String group, bool isDark) {
    if (isDark) return Colors.white;
    switch (group) {
      case 'alkali_metals':
        return const Color(0xFF991B1B);
      case 'alkaline_earth_metals':
        return const Color(0xFF9A3412);
      case 'transition_metals':
        return const Color(0xFF854D0E);
      case 'post_transition_metals':
        return const Color(0xFF1E3A8A);
      case 'metalloids':
        return const Color(0xFF115E59);
      case 'othernonmetals':
      case 'other_nonmetals':
        return const Color(0xFF065F46);
      case 'halogens':
        return const Color(0xFF5B21B6);
      case 'noble_gases':
        return const Color(0xFF86198F);
      case 'lanthanoids':
        return const Color(0xFF9D174D);
      case 'actinoids':
        return const Color(0xFF9F1239);
      default:
        return const Color(0xFF3F3F46);
    }
  }

  // Modern gradient styles (Theme 3 and 4)
  List<Color> _getTheme3Gradients(String group, bool isDark) {
    switch (group) {
      case 'alkali_metals':
        return isDark 
            ? [const Color(0xFF5D3CCD), const Color(0xFF3A1C82)]
            : [const Color(0xFFA58BFF), const Color(0xFF8C6CFF)];
      case 'alkaline_earth_metals':
        return isDark 
            ? [const Color(0xFF5A1BB3), const Color(0xFF2F0A6D)]
            : [const Color(0xFF8C2BFF), const Color(0xFF6C1FD1)];
      case 'transition_metals':
        return isDark 
            ? [const Color(0xFFB44D7B), const Color(0xFF6A2545)]
            : [const Color(0xFFFF7DAF), const Color(0xFFFF5F95)];
      case 'post_transition_metals':
        return isDark 
            ? [const Color(0xFF0C6F8F), const Color(0xFF063C4F)]
            : [const Color(0xFF26AADC), const Color(0xFF1A8EB8)];
      case 'metalloids':
        return isDark 
            ? [const Color(0xFF0F4A99), const Color(0xFF062454)]
            : [const Color(0xFF2082FF), const Color(0xFF0066E9)];
      case 'noble_gases':
        return isDark 
            ? [const Color(0xFFB23245), const Color(0xFF611A25)]
            : [const Color(0xFFFF5A79), const Color(0xFFFF3B5D)];
      case 'lanthanoids':
        return isDark 
            ? [const Color(0xFF0A8A86), const Color(0xFF054342)]
            : [const Color(0xFF10DCD5), const Color(0xFF0F12B3)];
      case 'actinoids':
        return isDark 
            ? [const Color(0xFF1A7F00), const Color(0xFF073600)]
            : [const Color(0xFF41D500), const Color(0xFF2EB000)];
      default:
        return isDark 
            ? [const Color(0xFF27272A), const Color(0xFF18181B)]
            : [const Color(0xFFF4F4F5), const Color(0xFFE4E4E7)];
    }
  }

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
          color: isStickyHeader 
              ? (isDark ? Colors.black.withValues(alpha: 0.4) : Colors.black.withValues(alpha: 0.1))
              : Colors.transparent,
          borderRadius: BorderRadius.circular(6),
          border: Border.all(
            color: isDark ? Colors.white10 : Colors.black.withValues(alpha: 0.05),
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
    
    // Determine visuals based on theme
    Decoration decoration;
    Color textColor;

    switch (theme) {
      case 'theme2': // Outline/Border Theme
        final baseColor = _getGroupTextColor(el.atomicGroup, isDark);
        textColor = baseColor;
        decoration = BoxDecoration(
          color: isDark ? baseColor.withValues(alpha: 0.05) : Colors.white,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: baseColor,
            width: 1.5,
          ),
        );
        break;

      case 'theme3': // Gradient Solid Theme
        final gradients = _getTheme3Gradients(el.atomicGroup, isDark);
        textColor = Colors.white;
        decoration = BoxDecoration(
          gradient: LinearGradient(
            colors: gradients,
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: isDark ? Colors.white12 : Colors.black.withValues(alpha: 0.1),
            width: 1,
          ),
        );
        break;

      case 'theme4': // Gradient Outline Theme
        final gradients = _getTheme3Gradients(el.atomicGroup, isDark);
        textColor = gradients[0];
        decoration = BoxDecoration(
          color: isDark ? gradients[0].withValues(alpha: 0.05) : Colors.white,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: gradients[0],
            width: 1.5,
          ),
        );
        break;

      case 'theme1': // Classic Solid Theme
      default:
        final cellColor = _getGroupColor(el.atomicGroup, isDark);
        final baseTextColor = _getGroupTextColor(el.atomicGroup, isDark);
        textColor = baseTextColor;
        decoration = BoxDecoration(
          color: cellColor,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: isDark ? Colors.white24 : baseTextColor.withValues(alpha: 0.2),
            width: 1,
          ),
        );
        break;
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
                      color: theme == 'theme3' 
                          ? Colors.white.withValues(alpha: 0.8) 
                          : textColor.withValues(alpha: 0.8),
                    ),
                  ),
                ),
                // Symbol
                Text(
                  el.atomicSymbol,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w900,
                    color: textColor,
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
                    color: theme == 'theme3' 
                        ? Colors.white.withValues(alpha: 0.8) 
                        : (isDark ? Colors.white70 : textColor.withValues(alpha: 0.8)),
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
