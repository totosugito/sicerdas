import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/l10n/gen_l10n/app_localizations.dart';
import '../latest_books_screen.dart';

class LatestBooksHeader extends ConsumerWidget {
  const LatestBooksHeader({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = ShadTheme.of(context);
    final booksAsync = ref.watch(latestBooksStreamProvider);
    final unfilteredAsync = ref.watch(unfilteredLatestBooksStreamProvider);
    final l10n = AppLocalizations.of(context)!;

    final booksCount = booksAsync.value?.length;
    final totalCount = unfilteredAsync.value?.length ?? booksCount ?? 0;
    final subtitleText = booksCount != null
        ? l10n.booksCount(booksCount, '$booksCount / $totalCount')
        : l10n.navBooks;

    final isDark = theme.brightness == Brightness.dark;

    return SliverAppBar(
      expandedHeight: 140.0,
      pinned: true,
      backgroundColor: isDark
          ? theme.colorScheme.card
          : const Color(0xFF6366F1), // Indigo color
      iconTheme: const IconThemeData(color: Colors.white),
      titleSpacing: 0,
      flexibleSpace: FlexibleSpaceBar(
        title: Builder(
          builder: (context) {
            final settings = context
                .dependOnInheritedWidgetOfExactType<FlexibleSpaceBarSettings>();
            double collapseProgress = 0.0;
            if (settings != null) {
              final deltaExtent = settings.maxExtent - settings.minExtent;
              if (deltaExtent > 0.0) {
                collapseProgress = (1.0 -
                        (settings.currentExtent - settings.minExtent) /
                            deltaExtent)
                    .clamp(0.0, 1.0);
              }
            }
            final showBadge = collapseProgress > 0.85;
            final opacity = showBadge ? (collapseProgress - 0.85) / 0.15 : 0.0;

            return Row(
              mainAxisSize: MainAxisSize.max,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Flexible(
                  child: Text(
                    l10n.latestBooks,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                if (showBadge)
                  Opacity(
                    opacity: opacity.clamp(0.0, 1.0),
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 6,
                        vertical: 2,
                      ),
                      margin: const EdgeInsets.only(right: 16),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(
                        '${booksCount ?? 0} / $totalCount',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 9,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
              ],
            );
          },
        ),
        titlePadding: const EdgeInsets.only(
          left: 48,
          bottom: 14,
          right: 16,
        ),
        background: Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: isDark
                  ? [theme.colorScheme.card, theme.colorScheme.card]
                  : [
                      const Color(0xFF4F46E5), // Deep Indigo
                      const Color(0xFF7C3AED), // Purple
                    ],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
          child: Stack(
            children: [
              Positioned(
                right: -10,
                bottom: -15,
                child: Icon(
                  Icons.star_rounded,
                  size: 96,
                  color: Colors.white.withValues(alpha: 0.15),
                ),
              ),
              Positioned(
                left: 48,
                bottom: 54,
                child: Text(
                  subtitleText,
                  style: TextStyle(
                    color: Colors.white.withValues(alpha: 0.85),
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
