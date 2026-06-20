import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';

class LevelCard extends StatelessWidget {
  final int levelId;
  final bool isUnlocked;
  final int starCount;
  final Color themeColor;
  final bool isDark;
  final ShadThemeData theme;
  final VoidCallback onTap;

  const LevelCard({
    super.key,
    required this.levelId,
    required this.isUnlocked,
    required this.starCount,
    required this.themeColor,
    required this.isDark,
    required this.theme,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: ShadCard(
        backgroundColor: isUnlocked
            ? (isDark ? themeColor.withValues(alpha: 0.12) : Colors.white)
            : (isDark
                  ? Colors.white.withValues(alpha: 0.02)
                  : Colors.grey.shade50),
        radius: BorderRadius.circular(20),
        border: ShadBorder.all(
          color: isUnlocked
              ? themeColor.withValues(alpha: isDark ? 0.35 : 0.25)
              : (isDark
                    ? Colors.white.withValues(alpha: 0.05)
                    : Colors.grey.shade200),
          width: 1.8,
        ),
        shadows: isUnlocked
            ? [
                BoxShadow(
                  color: themeColor.withValues(alpha: isDark ? 0.15 : 0.1),
                  blurRadius: 8,
                  offset: const Offset(0, 4),
                ),
              ]
            : null,
        padding: EdgeInsets.zero,
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                '$levelId',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: isUnlocked
                      ? (isDark ? Colors.white : Colors.black87)
                      : (isDark ? Colors.white38 : Colors.grey.shade400),
                ),
              ),
              const SizedBox(height: 6),
              if (!isUnlocked)
                Icon(
                  Icons.lock_rounded,
                  size: 16,
                  color: isDark ? Colors.white24 : Colors.grey.shade400,
                )
              else
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: List.generate(3, (idx) {
                    final isFilled = idx < starCount;
                    return Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 1.0),
                      child: Icon(
                        Icons.star_rounded,
                        size: 16,
                        color: isFilled
                            ? Colors.amber.shade500
                            : (isDark ? Colors.white10 : Colors.grey.shade200),
                      ),
                    );
                  }),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
