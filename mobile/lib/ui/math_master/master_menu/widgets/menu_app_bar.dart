import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/i18n/strings.g.dart';
import '../../ui/ui_mm_achievement.dart';

class MenuAppBar extends StatelessWidget {
  final int todayCorrect;
  final int todayWrong;
  final bool isCollapsed;
  final bool isDark;
  final double expandedHeight;

  const MenuAppBar({
    super.key,
    required this.todayCorrect,
    required this.todayWrong,
    required this.isCollapsed,
    required this.isDark,
    required this.expandedHeight,
  });

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);
    final locale = Translations.of(context).math_master;
    final backgroundColor = theme.colorScheme.background;

    final primaryHint = theme.colorScheme.primary.withValues(
      alpha: isDark ? 0.08 : 0.04,
    );

    return SliverAppBar(
      expandedHeight: expandedHeight,
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
      title: AnimatedOpacity(
        duration: const Duration(milliseconds: 150),
        opacity: isCollapsed ? 1.0 : 0.0,
        child: Text(
          locale.module_math_master,
          style: theme.textTheme.large.copyWith(
            color: theme.colorScheme.foreground,
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      centerTitle: false,
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
      flexibleSpace: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [
              Color.alphaBlend(primaryHint, backgroundColor),
              backgroundColor,
            ],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: FlexibleSpaceBar(
          centerTitle: false,
          background: AnimatedOpacity(
            duration: const Duration(milliseconds: 150),
            opacity: isCollapsed ? 0.0 : 1.0,
            child: Padding(
              padding: EdgeInsets.only(
                top: MediaQuery.of(context).padding.top + 28,
                bottom: 0,
                left: 16,
                right: 16,
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: theme.colorScheme.primary.withValues(alpha: 0.05),
                      border: Border.all(
                        color: theme.colorScheme.primary.withValues(
                          alpha: isDark ? 0.2 : 0.1,
                        ),
                        width: 1.5,
                      ),
                    ),
                    child: Icon(
                      Icons.school_rounded,
                      size: 36,
                      color: theme.colorScheme.primary,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    locale.module_math_master,
                    style: theme.textTheme.h3.copyWith(
                      color: theme.colorScheme.foreground,
                      fontSize: 22,
                      fontWeight: FontWeight.w800,
                      letterSpacing: -0.5,
                    ),
                    textAlign: TextAlign.center,
                    overflow: TextOverflow.ellipsis,
                    maxLines: 1,
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        '${locale.daily_progress}: ',
                        style: theme.textTheme.muted.copyWith(
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(width: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 3,
                        ),
                        decoration: BoxDecoration(
                          color: theme.colorScheme.primary.withValues(
                            alpha: 0.1,
                          ),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(
                            color: theme.colorScheme.primary.withValues(
                              alpha: 0.2,
                            ),
                          ),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              Icons.check_circle_rounded,
                              color: theme.colorScheme.primary,
                              size: 12,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              '$todayCorrect',
                              style: theme.textTheme.small.copyWith(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: theme.colorScheme.primary,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 3,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.red.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(
                            color: Colors.red.withValues(alpha: 0.2),
                          ),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(
                              Icons.cancel_rounded,
                              color: Colors.red,
                              size: 12,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              '$todayWrong',
                              style: theme.textTheme.small.copyWith(
                                fontSize: 11,
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
            ),
          ),
        ),
      ),
    );
  }
}
