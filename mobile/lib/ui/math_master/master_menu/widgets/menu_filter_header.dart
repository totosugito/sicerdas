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

    final pickerTrigger = ShadButton.outline(
      onPressed: onPickerTriggered,
      width: double.infinity,
      height: 48,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Icon(
                selectedGroup.id == KeyGroup.grades.index
                    ? Icons.school_rounded
                    : Icons.topic_rounded,
                color: theme.colorScheme.primary,
                size: 18,
              ),
              const SizedBox(width: 8),
              Text(
                selectedGroup.id == KeyGroup.grades.index
                    ? '${locale.group_grades}: '
                    : '${locale.group_topics}: ',
                style: theme.textTheme.small.copyWith(
                  color: theme.colorScheme.mutedForeground,
                ),
              ),
              Text(
                selectedGroup.id == KeyGroup.grades.index
                    ? selectedGrade.title
                    : selectedTopic.title,
                style: theme.textTheme.small.copyWith(
                  fontWeight: FontWeight.bold,
                  color: theme.colorScheme.foreground,
                ),
              ),
            ],
          ),
          Icon(
            Icons.keyboard_arrow_down_rounded,
            color: theme.colorScheme.mutedForeground,
            size: 18,
          ),
        ],
      ),
    );

    return Container(
      decoration: BoxDecoration(
        color: theme.colorScheme.background,
        border: Border(
          bottom: BorderSide(
            color: theme.colorScheme.border.withValues(
              alpha: isDark ? 0.4 : 0.2,
            ),
            width: 1.0,
          ),
        ),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
      child: pickerTrigger,
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
