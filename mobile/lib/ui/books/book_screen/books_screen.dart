import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import '../../core/providers/books_provider.dart';
import '../../core/database/database.dart';
import '../../l10n/gen_l10n/app_localizations.dart';
import 'group_book/group_book_screen.dart';

class BooksScreen extends ConsumerWidget {
  const BooksScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context)!;
    final booksAsync = ref.watch(filteredBooksProvider);
    final filter = ref.watch(booksFilterProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.navBooks),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            tooltip: 'Add/Download Books',
            onPressed: () {
              Navigator.push(context, MaterialPageRoute(builder: (context) => const GroupBookScreen()));
            },
          ),
          IconButton(
            icon: Badge(label: Text('${_countActiveFilters(filter)}'), isLabelVisible: _countActiveFilters(filter) > 0, child: const Icon(Icons.filter_list)),
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
              leading: const Padding(padding: EdgeInsets.only(right: 8.0), child: Icon(Icons.search, size: 18)),
              onChanged: (value) {
                ref.read(booksFilterProvider.notifier).update((state) => state.copyWith(search: value));
              },
            ),
          ),
          if (_countActiveFilters(filter) > 0)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Row(
                children: [
                  Text(l10n.filterActiveCount(_countActiveFilters(filter)), style: ShadTheme.of(context).textTheme.muted),
                  const Spacer(),
                  TextButton(
                    onPressed: () {
                      ref.read(booksFilterProvider.notifier).update((state) => state.clearFilters());
                    },
                    child: Text(l10n.filterClearAll),
                  ),
                ],
              ),
            ),
          Expanded(
            child: booksAsync.when(
              data: (books) {
                if (books.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.search_off, size: 64, color: Colors.grey),
                        const SizedBox(height: 16),
                        Text(l10n.noBooksFound, style: ShadTheme.of(context).textTheme.large),
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
    showModalBottomSheet(context: context, isScrollControlled: true, builder: (context) => const _FilterSheet());
  }
}

class _BookItem extends StatelessWidget {
  final BookWithMetadata item;

  const _BookItem({required this.item});

  Book get book => item.book;
  Category get category => item.category;
  EducationGrade get grade => item.grade;

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);
    return ShadCard(
      padding: EdgeInsets.zero,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Container(
              decoration: BoxDecoration(
                color: theme.colorScheme.muted,
                borderRadius: const BorderRadius.vertical(top: Radius.circular(8)),
              ),
              child: const Center(child: Icon(Icons.book, size: 48, color: Colors.grey)),
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
                  style: theme.textTheme.small.copyWith(fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 4),
                Text(book.author ?? '', maxLines: 1, overflow: TextOverflow.ellipsis, style: theme.textTheme.muted),
              ],
            ),
          ),
        ],
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
              Text('Filters', style: ShadTheme.of(context).textTheme.h4),
              IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(context)),
            ],
          ),
          const SizedBox(height: 24),

          // Category Filter
          Text(l10n.filterCategory, style: ShadTheme.of(context).textTheme.small),
          const SizedBox(height: 8),
          categoriesAsync.when(
            data: (items) => _FilterChips<int?>(
              items: [null, ...items.map((e) => e.id)],
              labels: ['All', ...items.map((e) => e.name)],
              selectedValue: filter.categoryId,
              onSelected: (val) {
                ref.read(booksFilterProvider.notifier).update((state) => state.copyWith(categoryId: val, groupId: null));
              },
            ),
            loading: () => const LinearProgressIndicator(),
            error: (_, _) => const Text('Error loading categories'),
          ),

          const SizedBox(height: 16),

          // Group Filter
          Text(l10n.filterGroup, style: ShadTheme.of(context).textTheme.small),
          const SizedBox(height: 8),
          groupsAsync.when(
            data: (items) => _FilterChips<int?>(
              items: [null, ...items.map((e) => e.id)],
              labels: ['All', ...items.map((e) => e.name)],
              selectedValue: filter.groupId,
              onSelected: (val) {
                ref.read(booksFilterProvider.notifier).update((state) => state.copyWith(groupId: val));
              },
            ),
            loading: () => const LinearProgressIndicator(),
            error: (_, _) => const Text('Error loading groups'),
          ),

          const SizedBox(height: 16),

          // Grade Filter
          Text(l10n.filterGrade, style: ShadTheme.of(context).textTheme.small),
          const SizedBox(height: 8),
          gradesAsync.when(
            data: (items) => _FilterChips<int?>(
              items: [null, ...items.map((e) => e.id)],
              labels: ['All', ...items.map((e) => e.name)],
              selectedValue: filter.gradeIds?.firstOrNull,
              onSelected: (val) {
                ref.read(booksFilterProvider.notifier).update((state) => state.copyWith(gradeIds: val == null ? null : [val]));
              },
            ),
            loading: () => const LinearProgressIndicator(),
            error: (_, _) => const Text('Error loading grades'),
          ),

          const SizedBox(height: 32),
          ShadButton(width: double.infinity, onPressed: () => Navigator.pop(context), child: Text(l10n.filterApply)),
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

  const _FilterChips({required this.items, required this.labels, required this.selectedValue, required this.onSelected});

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
