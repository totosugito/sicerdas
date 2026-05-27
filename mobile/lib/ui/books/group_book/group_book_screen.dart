import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import '../../../core/providers/books_provider.dart';
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

    return Scaffold(
      appBar: AppBar(
        title: Text.rich(
          TextSpan(
            text: l10n.browseGroups,
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            children: [
              if (totalBookCount != null) ...[
                const WidgetSpan(child: SizedBox(width: 8)),
                WidgetSpan(
                  alignment: PlaceholderAlignment.middle,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 10,
                      vertical: 3,
                    ),
                    decoration: BoxDecoration(
                      color: ShadTheme.of(context).colorScheme.muted,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      l10n.booksCount(totalBookCount, '$totalBookCount'),
                      style: ShadTheme.of(context).textTheme.small.copyWith(
                        color: ShadTheme.of(
                          context,
                        ).colorScheme.mutedForeground,
                        fontWeight: FontWeight.bold,
                        fontSize: 13,
                      ),
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
        elevation: 0,
        backgroundColor: Colors.transparent,
        foregroundColor: ShadTheme.of(context).colorScheme.foreground,
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
      ),
      body: categoriesAsync.when(
        data: (categories) => allGroupsAsync.when(
          data: (groups) {
            if (categories.isEmpty) {
              return Center(child: Text(l10n.noCategoriesFound));
            }

            final showLatest =
                latestBooksAsync.value != null &&
                latestBooksAsync.value!.isNotEmpty;

            return ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              itemCount: categories.length + (showLatest ? 1 : 0),
              itemBuilder: (context, index) {
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
                            builder: (context) => const LatestBooksScreen(),
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
                                color: theme.colorScheme.primary.withValues(
                                  alpha: 0.15,
                                ),
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
                                crossAxisAlignment: CrossAxisAlignment.start,
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
                                  color: theme.colorScheme.primary.withValues(
                                    alpha: 0.1,
                                  ),
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(
                                    color: theme.colorScheme.primary.withValues(
                                      alpha: 0.2,
                                    ),
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
              },
            );
          },
          loading: () => const LoadingView(),
          error: (err, _) => ErrorView(
            message: l10n.errorLoadingGroups,
            details: err.toString(),
          ),
        ),
        loading: () => const LoadingView(),
        error: (err, _) => ErrorView(
          message: l10n.errorLoadingCategories,
          details: err.toString(),
        ),
      ),
    );
  }
}
