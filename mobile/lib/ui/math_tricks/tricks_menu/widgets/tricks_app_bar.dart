import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/i18n/strings.g.dart';
import '../../achievement/tricks_achievement.dart';

class TricksAppBar extends StatelessWidget {
  final bool isCollapsed;
  final double expandedHeight;

  const TricksAppBar({
    super.key,
    required this.isCollapsed,
    required this.expandedHeight,
  });

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);
    final l10n = Translations.of(context);
    final isDark = theme.brightness == Brightness.dark;
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
      actions: [
        IconButton(
          icon: Icon(
            Icons.emoji_events_rounded,
            color: theme.colorScheme.foreground,
          ),
          tooltip: 'Prestasi',
          onPressed: () => TricksAchievementScreen.navigate(context),
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
          title: AnimatedOpacity(
            duration: const Duration(milliseconds: 150),
            opacity: isCollapsed ? 1.0 : 0.0,
            child: Text(
              l10n.math_tricks.title,
              style: theme.textTheme.large.copyWith(
                color: theme.colorScheme.foreground,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          background: Padding(
            padding: EdgeInsets.only(
              top: MediaQuery.of(context).padding.top + 28,
              bottom: 0,
              left: 16,
              right: 16,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
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
                    Icons.calculate_rounded,
                    size: 40,
                    color: theme.colorScheme.primary,
                  ),
                ),
                const SizedBox(height: 10),
                Text(
                  l10n.math_tricks.title,
                  style: theme.textTheme.h3.copyWith(
                    color: theme.colorScheme.foreground,
                    fontSize: 22,
                    fontWeight: FontWeight.w800,
                    letterSpacing: -0.5,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  l10n.math_tricks.subtitle,
                  style: theme.textTheme.muted.copyWith(
                    fontSize: 12,
                    height: 1.3,
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
