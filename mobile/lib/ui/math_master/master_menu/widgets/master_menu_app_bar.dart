import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/i18n/strings.g.dart';
import '../../ui/ui_mm_achievement.dart';

class MasterMenuAppBar extends StatelessWidget {
  final int todayCorrect;
  final int todayWrong;

  const MasterMenuAppBar({
    super.key,
    required this.todayCorrect,
    required this.todayWrong,
  });

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);
    final locale = Translations.of(context).math_master;
    final isDark = theme.brightness == Brightness.dark;

    final primaryHint = theme.colorScheme.primary.withValues(
      alpha: isDark ? 0.08 : 0.04,
    );
    final backgroundColor = theme.colorScheme.background;

    return SliverAppBar(
      expandedHeight: 200,
      pinned: true,
      elevation: 0,
      backgroundColor: Colors.transparent,
      leading: IconButton(
        icon: Icon(
          Icons.arrow_back_rounded,
          color: theme.colorScheme.foreground,
        ),
        onPressed: () => Navigator.of(context).pop(),
      ),
      actions: [
        IconButton(
          icon: Icon(
            Icons.emoji_events_rounded,
            color: theme.colorScheme.foreground,
          ),
          onPressed: () => UiMmAchievement.navigate(context),
        ),
      ],
      bottom: PreferredSize(
        preferredSize: const Size.fromHeight(1.5),
        child: Container(
          color: theme.colorScheme.primary.withValues(
            alpha: isDark ? 0.3 : 0.15,
          ),
          height: 1.5,
        ),
      ),
      flexibleSpace: FlexibleSpaceBar(
        background: Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [
                Color.alphaBlend(primaryHint, backgroundColor),
                backgroundColor,
              ],
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
            ),
          ),
          alignment: Alignment.bottomLeft,
          padding: const EdgeInsets.only(left: 24, right: 24, bottom: 20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                locale.module_math_master,
                style: theme.textTheme.h1.copyWith(
                  fontWeight: FontWeight.w900,
                  letterSpacing: -0.5,
                ),
                overflow: TextOverflow.ellipsis,
                maxLines: 1,
              ),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    locale.daily_progress,
                    style: theme.textTheme.muted.copyWith(
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: theme.colorScheme.primary.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: theme.colorScheme.primary.withValues(alpha: 0.2),
                          ),
                        ),
                        child: Row(
                          children: [
                            Icon(
                              Icons.check_circle_rounded,
                              color: theme.colorScheme.primary,
                              size: 14,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              '$todayCorrect',
                              style: theme.textTheme.small.copyWith(
                                fontWeight: FontWeight.bold,
                                color: theme.colorScheme.primary,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.red.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: Colors.red.withValues(alpha: 0.2),
                          ),
                        ),
                        child: Row(
                          children: [
                            const Icon(
                              Icons.cancel_rounded,
                              color: Colors.red,
                              size: 14,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              '$todayWrong',
                              style: theme.textTheme.small.copyWith(
                                fontWeight: FontWeight.bold,
                                color: Colors.red,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
