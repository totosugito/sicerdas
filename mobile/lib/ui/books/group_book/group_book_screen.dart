import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import '../libs/providers/books_provider.dart';
import '../../../l10n/gen_l10n/app_localizations.dart';
import 'widgets/category_card.dart';
import '../latest_books/latest_books_screen.dart';
import '../../widgets/error_view.dart';
import '../../widgets/loading_view.dart';

class GroupBookScreen extends ConsumerWidget {
  const GroupBookScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context)!;
    final categoriesAsync = ref.watch(categoriesWithGroupsProvider);
    final allGroupsAsync = ref.watch(allGroupsProvider);
    final expandAll = ref.watch(groupBookExpandAllProvider);
    final latestBooksAsync = ref.watch(unfilteredLatestBooksStreamProvider);

    final totalBookCount = allGroupsAsync.value?.fold<int>(
      0,
      (sum, g) => sum + (g.group.bookTotal ?? 0),
    );

    final theme = ShadTheme.of(context);

    final subtitleText = totalBookCount != null
        ? l10n.booksCount(totalBookCount, '$totalBookCount')
        : l10n.navBooks;

    return Scaffold(
      backgroundColor: theme.colorScheme.background,
      body: CustomScrollView(
        slivers: [
          // Collapsible Hero Header
          SliverAppBar(
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
                  expandAll
                      ? Icons.expand_less_rounded
                      : Icons.expand_more_rounded,
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
                      .dependOnInheritedWidgetOfExactType<
                        FlexibleSpaceBarSettings
                      >();
                  double collapseProgress = 0.0;
                  if (settings != null) {
                    final deltaExtent = settings.maxExtent - settings.minExtent;
                    if (deltaExtent > 0.0) {
                      collapseProgress =
                          (1.0 -
                                  (settings.currentExtent -
                                          settings.minExtent) /
                                      deltaExtent)
                              .clamp(0.0, 1.0);
                    }
                  }
                  final showBadge = collapseProgress > 0.85;
                  final opacity = showBadge
                      ? (collapseProgress - 0.85) / 0.15
                      : 0.0;

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
          ),

          // Main Content Slivers
          categoriesAsync.when(
            data: (categories) => allGroupsAsync.when(
              data: (groups) {
                if (categories.isEmpty) {
                  return SliverFillRemaining(
                    hasScrollBody: false,
                    child: Center(child: Text(l10n.noCategoriesFound)),
                  );
                }

                final showLatest =
                    latestBooksAsync.value != null &&
                    latestBooksAsync.value!.isNotEmpty;

                return SliverPadding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 8,
                  ),
                  sliver: SliverList(
                    delegate: SliverChildBuilderDelegate((context, index) {
                      if (showLatest && index == 0) {
                        final theme = ShadTheme.of(context);
                        final isDark = theme.brightness == Brightness.dark;

                        return Padding(
                          padding: const EdgeInsets.only(bottom: 12.0),
                          child: InkWell(
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) =>
                                      const LatestBooksScreen(),
                                ),
                              );
                            },
                            borderRadius: BorderRadius.circular(16),
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 16,
                                vertical: 14,
                              ),
                              decoration: BoxDecoration(
                                gradient: LinearGradient(
                                  colors: isDark
                                      ? [
                                          theme.colorScheme.primary.withValues(
                                            alpha: 0.15,
                                          ),
                                          theme.colorScheme.primary.withValues(
                                            alpha: 0.05,
                                          ),
                                        ]
                                      : [
                                          theme.colorScheme.primary.withValues(
                                            alpha: 0.08,
                                          ),
                                          theme.colorScheme.primary.withValues(
                                            alpha: 0.03,
                                          ),
                                        ],
                                  begin: Alignment.topLeft,
                                  end: Alignment.bottomRight,
                                ),
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(
                                  color: theme.colorScheme.primary.withValues(
                                    alpha: 0.25,
                                  ),
                                  width: 1.2,
                                ),
                                boxShadow: [
                                  BoxShadow(
                                    color: theme.colorScheme.primary.withValues(
                                      alpha: isDark ? 0.0 : 0.05,
                                    ),
                                    blurRadius: 10,
                                    offset: const Offset(0, 4),
                                  ),
                                ],
                              ),
                              child: Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.all(8),
                                    decoration: BoxDecoration(
                                      color: theme.colorScheme.primary
                                          .withValues(alpha: 0.15),
                                      shape: BoxShape.circle,
                                    ),
                                    child: Icon(
                                      Icons.star_rounded,
                                      color: theme.colorScheme.primary,
                                      size: 20,
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          l10n.latestBooks,
                                          style: TextStyle(
                                            fontSize: 14,
                                            fontWeight: FontWeight.w800,
                                            color: isDark
                                                ? Colors.white
                                                : theme.colorScheme.primary,
                                          ),
                                        ),
                                        const SizedBox(height: 2),
                                        Text(
                                          l10n.seeAll,
                                          style: theme.textTheme.muted.copyWith(
                                            fontSize: 11,
                                            fontWeight: FontWeight.w500,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  latestBooksAsync.when(
                                    data: (books) => Container(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 10,
                                        vertical: 4,
                                      ),
                                      margin: const EdgeInsets.only(right: 8),
                                      decoration: BoxDecoration(
                                        color: theme.colorScheme.primary
                                            .withValues(alpha: 0.1),
                                        borderRadius: BorderRadius.circular(8),
                                        border: Border.all(
                                          color: theme.colorScheme.primary
                                              .withValues(alpha: 0.2),
                                        ),
                                      ),
                                      child: Text(
                                        '${books.length}',
                                        style: TextStyle(
                                          fontSize: 11,
                                          fontWeight: FontWeight.w800,
                                          color: theme.colorScheme.primary,
                                        ),
                                      ),
                                    ),
                                    loading: () => const SizedBox(),
                                    error: (_, _) => const SizedBox(),
                                  ),
                                  Icon(
                                    Icons.arrow_forward_ios_rounded,
                                    size: 16,
                                    color: theme.colorScheme.primary.withValues(
                                      alpha: 0.7,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        );
                      }

                      final categoryIndex = showLatest ? index - 1 : index;
                      final category = categories[categoryIndex];
                      final categoryGroups = groups
                          .where((g) => g.group.categoryId == category.id)
                          .toList();

                      return CategoryCard(
                        category: category,
                        groups: categoryGroups,
                        index: categoryIndex,
                      );
                    }, childCount: categories.length + (showLatest ? 1 : 0)),
                  ),
                );
              },
              loading: () => const SliverFillRemaining(
                hasScrollBody: false,
                child: LoadingView(),
              ),
              error: (err, _) => SliverFillRemaining(
                hasScrollBody: false,
                child: ErrorView(
                  message: l10n.errorLoadingGroups,
                  details: err.toString(),
                ),
              ),
            ),
            loading: () => const SliverFillRemaining(
              hasScrollBody: false,
              child: LoadingView(),
            ),
            error: (err, _) => SliverFillRemaining(
              hasScrollBody: false,
              child: ErrorView(
                message: l10n.errorLoadingCategories,
                details: err.toString(),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
