import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/l10n/gen_l10n/app_localizations.dart';
import '../../libs/providers/books_provider.dart';

class GroupBookHeader extends ConsumerWidget {
  const GroupBookHeader({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context)!;
    final allGroupsAsync = ref.watch(allGroupsProvider);
    final expandAll = ref.watch(groupBookExpandAllProvider);
    final theme = ShadTheme.of(context);

    final totalBookCount = allGroupsAsync.value?.fold<int>(
      0,
      (sum, g) => sum + (g.group.bookTotal ?? 0),
    );

    final subtitleText = totalBookCount != null
        ? l10n.booksCount(totalBookCount, '$totalBookCount')
        : l10n.navBooks;

    return SliverAppBar(
      expandedHeight: 140.0,
      pinned: true,
      backgroundColor: theme.brightness == Brightness.dark
          ? theme.colorScheme.card
          : theme.colorScheme.primary,
      iconTheme: const IconThemeData(color: Colors.white),
      titleSpacing: 0,
      actions: [
        IconButton(
          icon: Icon(
            expandAll ? Icons.expand_less_rounded : Icons.expand_more_rounded,
          ),
          tooltip: expandAll ? l10n.collapseAll : l10n.expandAll,
          onPressed: () {
            ref.read(groupBookExpandAllProvider.notifier).toggle();
            ref.read(categoryExpansionProvider.notifier).resetAll();
          },
        ),
      ],
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
                    l10n.browseGroups,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                if (totalBookCount != null && showBadge)
                  Opacity(
                    opacity: opacity.clamp(0.0, 1.0),
                    child: Container(
                      margin: const EdgeInsets.only(right: 48),
                      padding: const EdgeInsets.symmetric(
                        horizontal: 6,
                        vertical: 2,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(
                        '$totalBookCount',
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
            color: theme.brightness == Brightness.dark
                ? theme.colorScheme.card
                : theme.colorScheme.primary,
          ),
          child: Stack(
            children: [
              Positioned(
                right: -10,
                bottom: -15,
                child: Icon(
                  Icons.library_books_rounded,
                  size: 90,
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
