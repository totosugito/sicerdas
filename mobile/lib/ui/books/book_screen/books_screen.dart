import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../core/providers/books_provider.dart';
import '../../../core/providers/settings_provider.dart';
import '../../../core/database/database.dart';
import '../../../core/utils/book_utils.dart';
import '../../../core/utils/toast_utils.dart';
import '../../../l10n/gen_l10n/app_localizations.dart';
import '../../widgets/confirmation_dialog.dart';
import '../../pdf_viewer/pdf_viewer_screen.dart';
import '../group_book/group_book_screen.dart';

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
            tooltip: 'Add/Download Books',
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
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: ShadInput(
              placeholder: Text(l10n.searchPlaceholder),
              leading: const Padding(
                padding: EdgeInsets.only(right: 8.0),
                child: Icon(Icons.search, size: 18),
              ),
              onChanged: (value) {
                ref
                    .read(booksFilterProvider.notifier)
                    .update((state) => state.copyWith(search: value));
              },
            ),
          ),
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
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(
                          Icons.search_off,
                          size: 64,
                          color: Colors.grey,
                        ),
                        const SizedBox(height: 16),
                        Text(
                          l10n.noBooksFound,
                          style: ShadTheme.of(context).textTheme.large,
                        ),
                      ],
                    ),
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
                    return _BookItem(item: item);
                  },
                );
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (err, stack) => Center(child: Text('Error: $err')),
            ),
          ),
        ],
      ),
    );
  }

  int _countActiveFilters(BooksFilter filter) {
    int count = 0;
    if (filter.categoryId != null) count++;
    if (filter.groupId != null) count++;
    if (filter.gradeIds != null && filter.gradeIds!.isNotEmpty) count++;
    return count;
  }

  void _showFilterSheet(BuildContext context, WidgetRef ref) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => const _FilterSheet(),
    );
  }
}

class _BookItem extends ConsumerWidget {
  final BookWithMetadata item;

  const _BookItem({required this.item});

  Book get book => item.book;
  Category get category => item.category;
  EducationGrade get grade => item.grade;

  Future<void> _readBook(BuildContext context) async {
    final filePath = await book.getLocalFileName();
    if (context.mounted) {
      Navigator.of(context).push(
        MaterialPageRoute(
          builder: (context) =>
              PdfViewerScreen(filePath: filePath, title: book.title),
        ),
      );
    }
  }

  Future<void> _deleteBook(BuildContext context, WidgetRef ref) async {
    final l10n = AppLocalizations.of(context)!;
    final theme = ShadTheme.of(context);

    ConfirmationDialog.show(
      context,
      icon: Icons.delete_outline,
      title: l10n.deleteBookConfirmTitle,
      descriptionWidget: Text.rich(
        TextSpan(
          style: theme.textTheme.muted.copyWith(fontSize: 14),
          children: [
            TextSpan(text: l10n.deleteBookConfirmPrefix),
            TextSpan(
              text: book.title,
              style: TextStyle(
                fontWeight: FontWeight.bold,
                color: theme.colorScheme.foreground,
              ),
            ),
            TextSpan(text: l10n.deleteBookConfirmSuffix),
          ],
        ),
        textAlign: TextAlign.center,
      ),
      confirmLabel: l10n.deleteAction,
      cancelLabel: l10n.cancel,
      onConfirm: () async {
        Navigator.of(context).pop();
        final success = await book.deleteLocalFile();
        if (success && context.mounted) {
          ref.read(downloadedBookIdsProvider.notifier).removeId(book.bookId);
          ToastUtils.showSuccess(
            context,
            title: book.title,
            message: l10n.deleteBookSuccess,
          );
        }
      },
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = ShadTheme.of(context);
    final cloudUrl = ref.watch(cloudUrlProvider);
    final coverUrl = BookUtils.getBookCoverUrl(
      baseUrl: cloudUrl,
      bookId: book.bookId,
    );

    return GestureDetector(
      onTap: () => _readBook(context),
      child: ShadCard(
        padding: EdgeInsets.zero,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Stack(
                children: [
                  Positioned.fill(
                    child: ClipRRect(
                      borderRadius: const BorderRadius.vertical(
                        top: Radius.circular(8),
                      ),
                      child: coverUrl.isEmpty
                          ? Container(
                              color: theme.colorScheme.muted,
                              child: const Center(
                                child: Icon(
                                  Icons.book,
                                  size: 48,
                                  color: Colors.grey,
                                ),
                              ),
                            )
                          : CachedNetworkImage(
                              imageUrl: coverUrl,
                              fit: BoxFit.cover,
                              placeholder: (context, url) => Container(
                                color: theme.colorScheme.muted,
                                child: const Center(
                                  child: CircularProgressIndicator(),
                                ),
                              ),
                              errorWidget: (context, url, error) => Container(
                                color: theme.colorScheme.muted,
                                child: const Center(
                                  child: Icon(
                                    Icons.broken_image_rounded,
                                    size: 48,
                                    color: Colors.grey,
                                  ),
                                ),
                              ),
                            ),
                    ),
                  ),
                  Positioned(
                    top: 8,
                    right: 8,
                    child: Container(
                      width: 32,
                      height: 32,
                      decoration: BoxDecoration(
                        color: Colors.black.withValues(alpha: 0.5),
                        shape: BoxShape.circle,
                      ),
                      child: IconButton(
                        padding: EdgeInsets.zero,
                        icon: const Icon(
                          Icons.delete_outline,
                          color: Colors.white,
                          size: 18,
                        ),
                        onPressed: () => _deleteBook(context, ref),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    book.title,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: theme.textTheme.small.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    book.author ?? '',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: theme.textTheme.muted,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _FilterSheet extends ConsumerWidget {
  const _FilterSheet();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context)!;
    final filter = ref.watch(booksFilterProvider);
    final categoriesAsync = ref.watch(categoriesProvider);
    final gradesAsync = ref.watch(gradesProvider);
    final groupsAsync = ref.watch(groupsProvider);

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Theme.of(context).scaffoldBackgroundColor,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(l10n.filterTitle, style: ShadTheme.of(context).textTheme.h4),
              IconButton(
                icon: const Icon(Icons.close),
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),
          const SizedBox(height: 24),

          // Category Filter
          Text(
            l10n.filterCategory,
            style: ShadTheme.of(context).textTheme.small,
          ),
          const SizedBox(height: 8),
          categoriesAsync.when(
            data: (items) => _FilterChips<int?>(
              items: [null, ...items.map((e) => e.id)],
              labels: [l10n.filterAll, ...items.map((e) => e.name)],
              selectedValue: filter.categoryId,
              onSelected: (val) {
                ref
                    .read(booksFilterProvider.notifier)
                    .update(
                      (state) => state.copyWith(categoryId: val, groupId: null),
                    );
              },
            ),
            loading: () => const LinearProgressIndicator(),
            error: (_, _) => Text(l10n.errorLoadingCategories),
          ),

          const SizedBox(height: 16),

          // Group Filter
          Text(l10n.filterGroup, style: ShadTheme.of(context).textTheme.small),
          const SizedBox(height: 8),
          groupsAsync.when(
            data: (items) => _FilterChips<int?>(
              items: [null, ...items.map((e) => e.id)],
              labels: [l10n.filterAll, ...items.map((e) => e.name)],
              selectedValue: filter.groupId,
              onSelected: (val) {
                ref
                    .read(booksFilterProvider.notifier)
                    .update((state) => state.copyWith(groupId: val));
              },
            ),
            loading: () => const LinearProgressIndicator(),
            error: (_, _) => Text(l10n.errorLoadingGroups),
          ),

          const SizedBox(height: 16),

          // Grade Filter
          Text(l10n.filterGrade, style: ShadTheme.of(context).textTheme.small),
          const SizedBox(height: 8),
          gradesAsync.when(
            data: (items) => _FilterChips<int?>(
              items: [null, ...items.map((e) => e.id)],
              labels: [l10n.filterAll, ...items.map((e) => e.name)],
              selectedValue: filter.gradeIds?.firstOrNull,
              onSelected: (val) {
                ref
                    .read(booksFilterProvider.notifier)
                    .update(
                      (state) =>
                          state.copyWith(gradeIds: val == null ? null : [val]),
                    );
              },
            ),
            loading: () => const LinearProgressIndicator(),
            error: (_, _) => Text(l10n.errorLoadingGrades),
          ),

          const SizedBox(height: 32),
          ShadButton(
            width: double.infinity,
            onPressed: () => Navigator.pop(context),
            child: Text(l10n.filterApply),
          ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }
}

class _FilterChips<T> extends StatelessWidget {
  final List<T> items;
  final List<String> labels;
  final T selectedValue;
  final Function(T) onSelected;

  const _FilterChips({
    required this.items,
    required this.labels,
    required this.selectedValue,
    required this.onSelected,
  });

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: List.generate(items.length, (index) {
          final isSelected = selectedValue == items[index];
          return Padding(
            padding: const EdgeInsets.only(right: 8.0),
            child: ChoiceChip(
              label: Text(labels[index]),
              selected: isSelected,
              onSelected: (selected) {
                if (selected) onSelected(items[index]);
              },
            ),
          );
        }),
      ),
    );
  }
}
