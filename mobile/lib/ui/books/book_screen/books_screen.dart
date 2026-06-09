import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/core/database/database.dart';
import 'package:bse/l10n/gen_l10n/app_localizations.dart';
import 'package:bse/widgets/empty_state.dart';
import 'package:bse/widgets/error_view.dart';
import 'package:bse/widgets/loading_view.dart';
import '../group_book/group_book_screen.dart';
import '../libs/providers/books_provider.dart';
import 'widgets/book_item.dart';
import 'widgets/filter_sheet.dart';
import 'widgets/book_list_item.dart';

class BooksScreen extends ConsumerWidget {
  const BooksScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context)!;
    final booksAsync = ref.watch(filteredBooksProvider);
    final filter = ref.watch(booksFilterProvider);
    final downloadedIdsAsync = ref.watch(downloadedBookIdsProvider);
    final viewType = ref.watch(booksViewTypeProvider);
    final theme = ShadTheme.of(context);

    final localBooksAsync = booksAsync.when(
      data: (books) => downloadedIdsAsync.when(
        data: (downloadedIds) {
          final filtered = books
              .where((item) => downloadedIds.contains(item.book.bookId))
              .toList();
          return AsyncValue.data(filtered);
        },
        loading: () => const AsyncValue<List<BookWithMetadata>>.loading(),
        error: (err, stack) =>
            AsyncValue<List<BookWithMetadata>>.error(err, stack),
      ),
      loading: () => const AsyncValue<List<BookWithMetadata>>.loading(),
      error: (err, stack) =>
          AsyncValue<List<BookWithMetadata>>.error(err, stack),
    );

    final filteredCount = localBooksAsync.value?.length;
    final totalLocalCount = downloadedIdsAsync.value?.length;
    final countText = (filteredCount != null && totalLocalCount != null)
        ? (filteredCount == totalLocalCount
              ? '$totalLocalCount'
              : '$filteredCount/$totalLocalCount')
        : null;

    return Scaffold(
      appBar: AppBar(
        title: Text.rich(
          TextSpan(
            text: l10n.library,
            children: [
              if (countText != null) ...[
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
                      l10n.booksCount(filteredCount ?? 0, countText),
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
        actions: [
          ShadButton.ghost(
            width: 40,
            height: 40,
            padding: EdgeInsets.zero,
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const GroupBookScreen(),
                ),
              );
            },
            child: Icon(Icons.add, color: theme.colorScheme.mutedForeground),
          ),
          ShadButton.ghost(
            width: 40,
            height: 40,
            padding: EdgeInsets.zero,
            onPressed: () => ref.read(booksViewTypeProvider.notifier).toggle(),
            child: Icon(
              viewType == BooksViewType.grid
                  ? Icons.view_list_rounded
                  : Icons.grid_view_rounded,
              color: theme.colorScheme.mutedForeground,
            ),
          ),
          ShadButton.ghost(
            width: 40,
            height: 40,
            padding: EdgeInsets.zero,
            onPressed: () => _showFilterSheet(context, ref),
            child: Badge(
              label: Text('${_countActiveFilters(filter)}'),
              isLabelVisible: _countActiveFilters(filter) > 0,
              child: Icon(
                Icons.filter_list,
                color: theme.colorScheme.mutedForeground,
              ),
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: localBooksAsync.when(
              data: (books) {
                if (books.isEmpty) {
                  final hasActiveFilters = _countActiveFilters(filter) > 0;
                  return EmptyState(
                    icon: Icons.search_off_rounded,
                    title: l10n.noBooksFound,
                    description: hasActiveFilters
                        ? l10n.emptyStateFilterDescription
                        : l10n.emptyStateDefaultDescription,
                    actionLabel: hasActiveFilters ? l10n.filterClearAll : null,
                    onActionPressed: hasActiveFilters
                        ? () {
                            ref
                                .read(booksFilterProvider.notifier)
                                .update(
                                  (state) => state.clearFilters().copyWith(
                                    clearGroupIds: true,
                                  ),
                                );
                          }
                        : null,
                  );
                }
                if (viewType == BooksViewType.list) {
                  return ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: books.length,
                    itemBuilder: (context, index) {
                      final item = books[index];
                      return BookListItem(item: item, index: index);
                    },
                  );
                }
                return GridView.builder(
                  padding: const EdgeInsets.all(16),
                  gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
                    maxCrossAxisExtent: 180,
                    childAspectRatio: 0.7,
                    crossAxisSpacing: 16,
                    mainAxisSpacing: 16,
                  ),
                  itemCount: books.length,
                  itemBuilder: (context, index) {
                    final item = books[index];
                    return BookItem(item: item);
                  },
                );
              },
              loading: () => const LoadingView(),
              error: (err, _) => ErrorView(
                message: l10n.errorGeneric,
                details: err.toString(),
              ),
            ),
          ),
        ],
      ),
    );
  }

  int _countActiveFilters(BooksFilter filter) {
    return filter.groupIds?.length ?? 0;
  }

  void _showFilterSheet(BuildContext context, WidgetRef ref) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => const FilterSheet(),
    );
  }
}
