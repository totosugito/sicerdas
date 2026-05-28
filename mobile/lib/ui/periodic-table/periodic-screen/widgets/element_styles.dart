import 'package:flutter/material.dart';

/// Centralized element style definitions matching the frontend's element-styles.ts.
/// Each theme maps atomicGroup → colors (bg, text, border, gradients).

class ElementColors {
  final Color background;
  final Color text;
  final Color border;
  final Color atomColor;
  final List<Color>? gradient; // For theme3 gradient

  const ElementColors({
    required this.background,
    required this.text,
    required this.border,
    required this.atomColor,
    this.gradient,
  });
}

/// Get the element style for a given [atomicGroup] and [theme].
/// Mirrors the frontend's `getElementStyle()` from element-styles.ts.
ElementColors getElementStyle(
  String atomicGroup,
  String theme, {
  required bool isDark,
}) {
  switch (theme) {
    case 'theme2':
      return _getTheme2Style(atomicGroup, isDark);
    case 'theme3':
      return _getTheme3Style(atomicGroup, isDark);
    case 'theme4':
      return _getTheme4Style(atomicGroup, isDark);
    default:
      return _getTheme1Style(atomicGroup, isDark);
  }
}

// ─── Theme 1: Classic Solid ────────────────────────────────────────────────

ElementColors _getTheme1Style(String group, bool isDark) {
  switch (group) {
    case 'othernonmetals':
    case 'other_nonmetals':
      return ElementColors(
        background: isDark ? const Color(0xFF1D4ED8) : const Color(0xFF2563EB),
        text: Colors.white,
        border: isDark ? Colors.white24 : Colors.white.withValues(alpha: 0.3),
        atomColor: const Color(0xFF2563EB),
      );
    case 'noble_gases':
      return ElementColors(
        background: isDark ? const Color(0xFF581C87) : const Color(0xFF7E22CE),
        text: Colors.white,
        border: isDark ? Colors.white24 : Colors.white.withValues(alpha: 0.3),
        atomColor: const Color(0xFF7E22CE),
      );
    case 'halogens':
      return ElementColors(
        background: isDark ? const Color(0xFF6B21A8) : const Color(0xFF9333EA),
        text: Colors.white,
        border: isDark ? Colors.white24 : Colors.white.withValues(alpha: 0.3),
        atomColor: const Color(0xFF9333EA),
      );
    case 'metalloids':
      return ElementColors(
        background: isDark ? const Color(0xFF155E75) : const Color(0xFF0891B2),
        text: Colors.white,
        border: isDark ? Colors.white24 : Colors.white.withValues(alpha: 0.3),
        atomColor: const Color(0xFF0891B2),
      );
    case 'post_transition_metals':
      return ElementColors(
        background: isDark ? const Color(0xFF166534) : const Color(0xFF16A34A),
        text: Colors.white,
        border: isDark ? Colors.white24 : Colors.white.withValues(alpha: 0.3),
        atomColor: const Color(0xFF16A34A),
      );
    case 'transition_metals':
      return ElementColors(
        background:
            isDark ? const Color(0xFFC68989).withValues(alpha: 0.8) : const Color(0xFFC68989),
        text: Colors.white,
        border: isDark ? Colors.white24 : Colors.white.withValues(alpha: 0.3),
        atomColor: const Color(0xFFC68989),
      );
    case 'lanthanoids':
      return ElementColors(
        background: isDark ? const Color(0xFF854D0E) : const Color(0xFFCA8A04),
        text: Colors.white,
        border: isDark ? Colors.white24 : Colors.white.withValues(alpha: 0.3),
        atomColor: const Color(0xFFCA8A04),
      );
    case 'actinoids':
      return ElementColors(
        background:
            isDark ? const Color(0xFFB39DDB).withValues(alpha: 0.8) : const Color(0xFFB39DDB),
        text: Colors.white,
        border: isDark ? Colors.white24 : Colors.white.withValues(alpha: 0.3),
        atomColor: const Color(0xFFB39DDB),
      );
    case 'alkaline_earth_metals':
      return ElementColors(
        background: isDark ? const Color(0xFFC2410C) : const Color(0xFFF97316),
        text: Colors.white,
        border: isDark ? Colors.white24 : Colors.white.withValues(alpha: 0.3),
        atomColor: const Color(0xFFF97316),
      );
    case 'alkali_metals':
      return ElementColors(
        background: isDark ? const Color(0xFF991B1B) : const Color(0xFFEF4444),
        text: Colors.white,
        border: isDark ? Colors.white24 : Colors.white.withValues(alpha: 0.3),
        atomColor: const Color(0xFFEF4444),
      );
    case 'header':
      return ElementColors(
        background: isDark
            ? Colors.black.withValues(alpha: 0.4)
            : Colors.black.withValues(alpha: 0.3),
        text: Colors.white,
        border: isDark ? Colors.white10 : Colors.white.withValues(alpha: 0.2),
        atomColor: const Color(0x4D000000),
      );
    case 'headerEmpty':
      return ElementColors(
        background: Colors.transparent,
        text: isDark ? Colors.white70 : Colors.black87,
        border: Colors.transparent,
        atomColor: Colors.transparent,
      );
    case 'empty':
      return ElementColors(
        background: Colors.transparent,
        text: Colors.transparent,
        border: Colors.transparent,
        atomColor: Colors.transparent,
      );
    default:
      return ElementColors(
        background: isDark ? const Color(0xFF27272A) : const Color(0xFFF4F4F5),
        text: isDark ? Colors.white : Colors.black87,
        border: isDark ? Colors.white24 : Colors.black12,
        atomColor: const Color(0xFF8B8B8B),
      );
  }
}

// ─── Theme 2: Border / Outline ─────────────────────────────────────────────

ElementColors _getTheme2Style(String group, bool isDark) {
  switch (group) {
    case 'othernonmetals':
    case 'other_nonmetals':
      return ElementColors(
        background: isDark ? const Color(0xFF2563EB).withValues(alpha: 0.05) : Colors.white,
        text: isDark ? const Color(0xFF60A5FA) : const Color(0xFF2563EB),
        border: isDark ? const Color(0xFF60A5FA) : const Color(0xFF2563EB),
        atomColor: const Color(0xFF2563EB),
      );
    case 'noble_gases':
      return ElementColors(
        background: isDark ? const Color(0xFF7E22CE).withValues(alpha: 0.05) : Colors.white,
        text: isDark ? const Color(0xFFD8B4FE) : const Color(0xFF7E22CE),
        border: isDark ? const Color(0xFFD8B4FE) : const Color(0xFF7E22CE),
        atomColor: const Color(0xFF7E22CE),
      );
    case 'halogens':
      return ElementColors(
        background: isDark ? const Color(0xFF9333EA).withValues(alpha: 0.05) : Colors.white,
        text: isDark ? const Color(0xFFC084FC) : const Color(0xFF9333EA),
        border: isDark ? const Color(0xFFC084FC) : const Color(0xFF9333EA),
        atomColor: const Color(0xFF9333EA),
      );
    case 'metalloids':
      return ElementColors(
        background: isDark ? const Color(0xFF0891B2).withValues(alpha: 0.05) : Colors.white,
        text: isDark ? const Color(0xFF22D3EE) : const Color(0xFF0891B2),
        border: isDark ? const Color(0xFF22D3EE) : const Color(0xFF0891B2),
        atomColor: const Color(0xFF0891B2),
      );
    case 'post_transition_metals':
      return ElementColors(
        background: isDark ? const Color(0xFF16A34A).withValues(alpha: 0.05) : Colors.white,
        text: isDark ? const Color(0xFF4ADE80) : const Color(0xFF16A34A),
        border: isDark ? const Color(0xFF4ADE80) : const Color(0xFF16A34A),
        atomColor: const Color(0xFF16A34A),
      );
    case 'transition_metals':
      return ElementColors(
        background: isDark ? const Color(0xFFC68989).withValues(alpha: 0.05) : Colors.white,
        text: const Color(0xFFC68989),
        border: const Color(0xFFC68989),
        atomColor: const Color(0xFFC68989),
      );
    case 'lanthanoids':
      return ElementColors(
        background: isDark ? const Color(0xFFCA8A04).withValues(alpha: 0.05) : Colors.white,
        text: isDark ? const Color(0xFFFACC15) : const Color(0xFFCA8A04),
        border: isDark ? const Color(0xFFFACC15) : const Color(0xFFCA8A04),
        atomColor: const Color(0xFFCA8A04),
      );
    case 'actinoids':
      return ElementColors(
        background: isDark ? const Color(0xFFB39DDB).withValues(alpha: 0.05) : Colors.white,
        text: const Color(0xFFB39DDB),
        border: const Color(0xFFB39DDB),
        atomColor: const Color(0xFFB39DDB),
      );
    case 'alkaline_earth_metals':
      return ElementColors(
        background: isDark ? const Color(0xFFF97316).withValues(alpha: 0.05) : Colors.white,
        text: isDark ? const Color(0xFFFB923C) : const Color(0xFFF97316),
        border: isDark ? const Color(0xFFFB923C) : const Color(0xFFF97316),
        atomColor: const Color(0xFFF97316),
      );
    case 'alkali_metals':
      return ElementColors(
        background: isDark ? const Color(0xFFEF4444).withValues(alpha: 0.05) : Colors.white,
        text: isDark ? const Color(0xFFF87171) : const Color(0xFFEF4444),
        border: isDark ? const Color(0xFFF87171) : const Color(0xFFEF4444),
        atomColor: const Color(0xFFEF4444),
      );
    case 'header':
      return ElementColors(
        background: isDark ? Colors.black.withValues(alpha: 0.2) : Colors.white,
        text: isDark ? Colors.white70 : Colors.black87,
        border: isDark ? Colors.white30 : Colors.black26,
        atomColor: Colors.white,
      );
    case 'headerEmpty':
      return ElementColors(
        background: Colors.transparent,
        text: isDark ? Colors.white54 : Colors.black54,
        border: isDark ? Colors.white12 : Colors.black12,
        atomColor: Colors.transparent,
      );
    case 'empty':
      return ElementColors(
        background: Colors.transparent,
        text: Colors.transparent,
        border: Colors.transparent,
        atomColor: Colors.transparent,
      );
    default:
      return ElementColors(
        background: isDark ? Colors.transparent : Colors.white,
        text: isDark ? Colors.white : Colors.black87,
        border: isDark ? Colors.white30 : Colors.black38,
        atomColor: Colors.white,
      );
  }
}

// ─── Theme 3: Modern Gradient ──────────────────────────────────────────────

ElementColors _getTheme3Style(String group, bool isDark) {
  switch (group) {
    case 'alkali_metals':
      return ElementColors(
        background: isDark ? const Color(0xFF5D3CCD) : const Color(0xFFA58BFF),
        text: Colors.white,
        border: isDark ? Colors.white12 : Colors.black.withValues(alpha: 0.1),
        atomColor: const Color(0xFFA58BFF),
        gradient: isDark
            ? [const Color(0xFF5D3CCD), const Color(0xFF3A1C82)]
            : [const Color(0xFFA58BFF), const Color(0xFF8C6CFF)],
      );
    case 'alkaline_earth_metals':
      return ElementColors(
        background: isDark ? const Color(0xFF5A1BB3) : const Color(0xFF8C2BFF),
        text: Colors.white,
        border: isDark ? Colors.white12 : Colors.black.withValues(alpha: 0.1),
        atomColor: const Color(0xFF8C2BFF),
        gradient: isDark
            ? [const Color(0xFF5A1BB3), const Color(0xFF2F0A6D)]
            : [const Color(0xFF8C2BFF), const Color(0xFF6C1FD1)],
      );
    case 'transition_metals':
      return ElementColors(
        background: isDark ? const Color(0xFFB44D7B) : const Color(0xFFFF7DAF),
        text: Colors.white,
        border: isDark ? Colors.white12 : Colors.black.withValues(alpha: 0.1),
        atomColor: const Color(0xFFFF7DAF),
        gradient: isDark
            ? [const Color(0xFFB44D7B), const Color(0xFF6A2545)]
            : [const Color(0xFFFF7DAF), const Color(0xFFFF5F95)],
      );
    case 'post_transition_metals':
      return ElementColors(
        background: isDark ? const Color(0xFF0C6F8F) : const Color(0xFF26AADC),
        text: Colors.white,
        border: isDark ? Colors.white12 : Colors.black.withValues(alpha: 0.1),
        atomColor: const Color(0xFF26AADC),
        gradient: isDark
            ? [const Color(0xFF0C6F8F), const Color(0xFF063C4F)]
            : [const Color(0xFF26AADC), const Color(0xFF1A8EB8)],
      );
    case 'othernonmetals':
    case 'other_nonmetals':
      return ElementColors(
        background: isDark ? const Color(0xFF0C6F8F) : const Color(0xFF26AADC),
        text: Colors.white,
        border: isDark ? Colors.white12 : Colors.black.withValues(alpha: 0.1),
        atomColor: const Color(0xFF26AADC),
        gradient: isDark
            ? [const Color(0xFF0C6F8F), const Color(0xFF063C4F)]
            : [const Color(0xFF26AADC), const Color(0xFF1A8EB8)],
      );
    case 'metalloids':
      return ElementColors(
        background: isDark ? const Color(0xFF0F4A99) : const Color(0xFF2082FF),
        text: Colors.white,
        border: isDark ? Colors.white12 : Colors.black.withValues(alpha: 0.1),
        atomColor: const Color(0xFF2082FF),
        gradient: isDark
            ? [const Color(0xFF0F4A99), const Color(0xFF062454)]
            : [const Color(0xFF2082FF), const Color(0xFF0066E9)],
      );
    case 'noble_gases':
      return ElementColors(
        background: isDark ? const Color(0xFFB23245) : const Color(0xFFFF5A79),
        text: Colors.white,
        border: isDark ? Colors.white12 : Colors.black.withValues(alpha: 0.1),
        atomColor: const Color(0xFFFF5A79),
        gradient: isDark
            ? [const Color(0xFFB23245), const Color(0xFF611A25)]
            : [const Color(0xFFFF5A79), const Color(0xFFFF3B5D)],
      );
    case 'lanthanoids':
      return ElementColors(
        background: isDark ? const Color(0xFF0A8A86) : const Color(0xFF10DCD5),
        text: Colors.white,
        border: isDark ? Colors.white12 : Colors.black.withValues(alpha: 0.1),
        atomColor: const Color(0xFF10DCD5),
        gradient: isDark
            ? [const Color(0xFF0A8A86), const Color(0xFF054342)]
            : [const Color(0xFF10DCD5), const Color(0xFF0FB9B3)],
      );
    case 'actinoids':
      return ElementColors(
        background: isDark ? const Color(0xFF1A7F00) : const Color(0xFF41D500),
        text: Colors.white,
        border: isDark ? Colors.white12 : Colors.black.withValues(alpha: 0.1),
        atomColor: const Color(0xFF41D500),
        gradient: isDark
            ? [const Color(0xFF1A7F00), const Color(0xFF073600)]
            : [const Color(0xFF41D500), const Color(0xFF2EB000)],
      );
    case 'halogens':
      return _getTheme1Style(group, isDark); // Fallback to theme1
    case 'header':
      return _getTheme1Style(group, isDark);
    case 'headerEmpty':
      return _getTheme1Style(group, isDark);
    case 'empty':
      return _getTheme1Style(group, isDark);
    default:
      return ElementColors(
        background: isDark ? const Color(0xFF27272A) : const Color(0xFFF4F4F5),
        text: isDark ? Colors.white : Colors.black87,
        border: isDark ? Colors.white12 : Colors.black12,
        atomColor: const Color(0xFF8B8B8B),
        gradient: isDark
            ? [const Color(0xFF27272A), const Color(0xFF18181B)]
            : [const Color(0xFFF4F4F5), const Color(0xFFE4E4E7)],
      );
  }
}

// ─── Theme 4: Gradient Outline ─────────────────────────────────────────────

ElementColors _getTheme4Style(String group, bool isDark) {
  // Theme 4 uses the same atomColor as theme 3 but with outline style
  final theme3 = _getTheme3Style(group, isDark);

  if (group == 'header' ||
      group == 'headerEmpty' ||
      group == 'empty') {
    return theme3;
  }

  return ElementColors(
    background: isDark
        ? theme3.atomColor.withValues(alpha: 0.1)
        : Colors.white,
    text: theme3.atomColor,
    border: theme3.atomColor,
    atomColor: theme3.atomColor,
  );
}
