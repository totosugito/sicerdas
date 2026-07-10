import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/i18n/strings.g.dart';
import '../../libs/models/enums.dart';
import '../../libs/models/model_item.dart';

class MenuFilterHeaderDelegate extends SliverPersistentHeaderDelegate {
  final ModelItem selectedGroup;
  final ModelItem selectedGrade;
  final ModelItem selectedTopic;
  final VoidCallback onPickerTriggered;
  final double height;
  final bool isDark;

  MenuFilterHeaderDelegate({
    required this.selectedGroup,
    required this.selectedGrade,
    required this.selectedTopic,
    required this.onPickerTriggered,
    required this.height,
    required this.isDark,
  });

  @override
  double get minExtent => height;

  @override
  double get maxExtent => height;

  @override
  Widget build(
    BuildContext context,
    double shrinkOffset,
    bool overlapsContent,
  ) {
    final theme = ShadTheme.of(context);
    final locale = Translations.of(context).math_master;
    final isDark = theme.brightness == Brightness.dark;

    final pickerTrigger = GestureDetector(
      onTap: onPickerTriggered,
      child: Container(
        height: 48,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(24),
          color: isDark
              ? theme.colorScheme.muted.withValues(alpha: 0.5)
              : theme.colorScheme.card,
          border: Border.all(
            color: theme.colorScheme.primary.withValues(
              alpha: isDark ? 0.3 : 0.2,
            ),
            width: 1.5,
          ),
          boxShadow: [
            BoxShadow(
              color: theme.colorScheme.primary.withValues(
                alpha: isDark ? 0.12 : 0.06,
              ),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      color: theme.colorScheme.primary.withValues(alpha: 0.12),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      selectedGroup.id == KeyGroup.grades.index
                          ? Icons.school_rounded
                          : Icons.topic_rounded,
                      color: theme.colorScheme.primary,
                      size: 18,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Text(
                    selectedGroup.id == KeyGroup.grades.index
                        ? '${locale.group_grades}: '
                        : '${locale.group_topics}: ',
                    style: theme.textTheme.small.copyWith(
                      color: theme.colorScheme.mutedForeground,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  Expanded(
                    child: Text(
                      selectedGroup.id == KeyGroup.grades.index
                          ? selectedGrade.title
                          : selectedTopic.title,
                      style: theme.textTheme.small.copyWith(
                        fontWeight: FontWeight.bold,
                        color: theme.colorScheme.foreground,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                color: theme.colorScheme.muted,
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.keyboard_arrow_down_rounded,
                color: theme.colorScheme.mutedForeground,
                size: 16,
              ),
            ),
          ],
        ),
      ),
    );

    return ClipRect(
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 12, sigmaY: 12),
        child: Container(
          decoration: BoxDecoration(
            color: theme.colorScheme.background.withValues(
              alpha: isDark ? 0.8 : 0.85,
            ),
            border: Border(
              bottom: BorderSide(
                color: theme.colorScheme.border.withValues(
                  alpha: isDark ? 0.3 : 0.15,
                ),
                width: 1.0,
              ),
            ),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
          alignment: Alignment.center,
          child: pickerTrigger,
        ),
      ),
    );
  }

  @override
  bool shouldRebuild(covariant MenuFilterHeaderDelegate oldDelegate) {
    return oldDelegate.selectedGroup != selectedGroup ||
        oldDelegate.selectedGrade != selectedGrade ||
        oldDelegate.selectedTopic != selectedTopic ||
        oldDelegate.height != height ||
        oldDelegate.isDark != isDark;
  }
}
