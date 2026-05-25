import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import '../../../core/providers/books_provider.dart';
import '../../../core/database/database.dart';
import '../../../l10n/gen_l10n/app_localizations.dart';
import '../../widgets/empty_state.dart';
import '../group_book/group_book_screen.dart';
import 'widgets/book_item.dart';
import 'widgets/filter_sheet.dart';

class BooksScreen extends ConsumerWidget {
  const BooksScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context)!;
    final booksAsync = ref.watch(filteredBooksProvider);
    final filter = ref.watch(booksFilterProvider);
    final downloadedIdsAsync = ref.watch(downloadedBookIdsProvider);

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

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.navBooks),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            tooltip: l10n.addDownloadBooks,
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const GroupBookScreen(),
                ),
              );
            },
          ),
          IconButton(
            icon: Badge(
              label: Text('${_countActiveFilters(filter)}'),
              isLabelVisible: _countActiveFilters(filter) > 0,
              child: const Icon(Icons.filter_list),
            ),
            onPressed: () => _showFilterSheet(context, ref),
          ),
        ],
      ),
      body: Column(
        children: [
          if (_countActiveFilters(filter) > 0)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Row(
                children: [
                  Text(
                    l10n.filterActiveCount(_countActiveFilters(filter)),
                    style: ShadTheme.of(context).textTheme.muted,
                  ),
                  const Spacer(),
                  TextButton(
                    onPressed: () {
                      ref
                          .read(booksFilterProvider.notifier)
                          .update((state) => state.clearFilters());
                    },
                    child: Text(l10n.filterClearAll),
                  ),
                ],
              ),
            ),
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
                return GridView.builder(
                  padding: const EdgeInsets.all(16),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
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
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (err, stack) =>
                  Center(child: Text('${l10n.errorTitle}: $err')),
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
      builder: (context) => const FilterSheet(),
    );
  }
}


