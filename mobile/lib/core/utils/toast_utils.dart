import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';

class ToastUtils {
  static const Duration duration = Duration(seconds: 3);

  static void showSuccess(
    BuildContext context, {
    required String title,
    required String message,
  }) {
    final theme = ShadTheme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final titleColor = isDark
        ? const Color(0xFF4ADE80)
        : const Color(0xFF15803D);
    final descColor = isDark
        ? const Color(0xFF94A3B8)
        : const Color(0xFF64748B);
    final iconColor = isDark
        ? const Color(0xFF4ADE80)
        : const Color(0xFF22C55E);

    ShadToaster.of(context).show(
      ShadToast(
        duration: duration,
        backgroundColor: isDark
            ? const Color(0xFF0F172A)
            : const Color(0xFFF0FDF4),
        border: ShadBorder.all(
          color: isDark ? const Color(0xFF1E293B) : const Color(0xFFDCFCE7),
          width: 1,
        ),
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.check_circle_outline_rounded,
              color: iconColor,
              size: 20,
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                title,
                style: TextStyle(
                  fontWeight: FontWeight.w600,
                  color: titleColor,
                ),
              ),
            ),
          ],
        ),
        description: Text(message, style: TextStyle(color: descColor)),
      ),
    );
  }

  static void showError(
    BuildContext context, {
    required String title,
    required String message,
  }) {
    final theme = ShadTheme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final titleColor = isDark
        ? const Color(0xFFF87171)
        : const Color(0xFFB91C1C);
    final descColor = isDark
        ? const Color(0xFF94A3B8)
        : const Color(0xFF64748B);
    final iconColor = isDark
        ? const Color(0xFFF87171)
        : const Color(0xFFEF4444);

    ShadToaster.of(context).show(
      ShadToast(
        duration: duration,
        backgroundColor: isDark
            ? const Color(0xFF0F172A)
            : const Color(0xFFFEF2F2),
        border: ShadBorder.all(
          color: isDark ? const Color(0xFF1E293B) : const Color(0xFFFEE2E2),
          width: 1,
        ),
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.error_outline_rounded, color: iconColor, size: 20),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                title,
                style: TextStyle(
                  fontWeight: FontWeight.w600,
                  color: titleColor,
                ),
              ),
            ),
          ],
        ),
        description: Text(message, style: TextStyle(color: descColor)),
      ),
    );
  }

  static void showWarning(
    BuildContext context, {
    required String title,
    required String message,
  }) {
    final theme = ShadTheme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final titleColor = isDark
        ? const Color(0xFFFBBF24)
        : const Color(0xFFB45309);
    final descColor = isDark
        ? const Color(0xFF94A3B8)
        : const Color(0xFF64748B);
    final iconColor = isDark
        ? const Color(0xFFFBBF24)
        : const Color(0xFFF59E0B);

    ShadToaster.of(context).show(
      ShadToast(
        duration: duration,
        backgroundColor: isDark
            ? const Color(0xFF0F172A)
            : const Color(0xFFFFFBEB),
        border: ShadBorder.all(
          color: isDark ? const Color(0xFF1E293B) : const Color(0xFFFEF3C7),
          width: 1,
        ),
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.warning_amber_rounded, color: iconColor, size: 20),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                title,
                style: TextStyle(
                  fontWeight: FontWeight.w600,
                  color: titleColor,
                ),
              ),
            ),
          ],
        ),
        description: Text(message, style: TextStyle(color: descColor)),
      ),
    );
  }

  static void showInfo(
    BuildContext context, {
    required String title,
    required String message,
  }) {
    final theme = ShadTheme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final titleColor = isDark
        ? const Color(0xFF60A5FA)
        : const Color(0xFF1D4ED8);
    final descColor = isDark
        ? const Color(0xFF94A3B8)
        : const Color(0xFF64748B);
    final iconColor = isDark
        ? const Color(0xFF60A5FA)
        : const Color(0xFF3B82F6);

    ShadToaster.of(context).show(
      ShadToast(
        duration: duration,
        backgroundColor: isDark
            ? const Color(0xFF0F172A)
            : const Color(0xFFEFF6FF),
        border: ShadBorder.all(
          color: isDark ? const Color(0xFF1E293B) : const Color(0xFFDBEAFE),
          width: 1,
        ),
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.info_outline_rounded, color: iconColor, size: 20),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                title,
                style: TextStyle(
                  fontWeight: FontWeight.w600,
                  color: titleColor,
                ),
              ),
            ),
          ],
        ),
        description: Text(message, style: TextStyle(color: descColor)),
      ),
    );
  }
}
