import 'package:flutter/material.dart';
import '../../../l10n/gen_l10n/app_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import '../../../core/database/database.dart';
import '../../../core/providers/database_provider.dart';
import 'widgets/book_list_item.dart';
import 'widgets/filter_bar.dart';

// Local state for GroupDetail filtering
class GroupDetailFilter {
  final String search;
  final String sortBy;
  final bool descending;
  final List<int> gradeIds;

  GroupDetailFilter({this.search = '', this.sortBy = 'title', this.descending = false, this.gradeIds = const []});

  GroupDetailFilter copyWith({String? search, String? sortBy, bool? descending, List<int>? gradeIds}) {
    return GroupDetailFilter(
      search: search ?? this.search,
      sortBy: sortBy ?? this.sortBy,
      descending: descending ?? this.descending,
      gradeIds: gradeIds ?? this.gradeIds,
    );
  }
}

class GroupDetailNotifier extends Notifier<GroupDetailFilter> {
  @override
  GroupDetailFilter build() => GroupDetailFilter();

  void updateSearch(String value) => state = state.copyWith(search: value);
  void updateAll(GroupDetailFilter newFilter) => state = newFilter;
}

final groupDetailFilterProvider = NotifierProvider<GroupDetailNotifier, GroupDetailFilter>(GroupDetailNotifier.new);

final groupGradesProvider = StreamProvider.family<List<EducationGrade>, int>((ref, groupId) {
  return ref.watch(databaseProvider).watchGradesByGroup(groupId);
});

final groupBooksProvider = StreamProvider.family<List<BookWithMetadata>, int>((ref, groupId) {
  final db = ref.watch(databaseProvider);
  final filter = ref.watch(groupDetailFilterProvider);

  return db.watchFilteredBooks(
    groupId: groupId,
    gradeIds: filter.gradeIds.isEmpty ? null : filter.gradeIds,
    search: filter.search,
    sortBy: filter.sortBy,
    descending: filter.descending,
  );
});

class GroupDetailScreen extends ConsumerWidget {
  final BookGroup group;

  const GroupDetailScreen({super.key, required this.group});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = ShadTheme.of(context);
    final booksAsync = ref.watch(groupBooksProvider(group.id));

    // Automatically clean global filter when group grades are loaded/changed
    ref.listen(groupGradesProvider(group.id), (previous, next) {
      if (next is AsyncData<List<EducationGrade>>) {
        final availableIds = next.value.map((e) => e.id).toSet();
        final currentFilter = ref.read(groupDetailFilterProvider);
        final validGradeIds = currentFilter.gradeIds.where((id) => availableIds.contains(id)).toList();

        if (validGradeIds.length != currentFilter.gradeIds.length) {
          ref.read(groupDetailFilterProvider.notifier).updateAll(
            currentFilter.copyWith(gradeIds: validGradeIds),
          );
        }
      }
    });

    return Scaffold(
      backgroundColor: theme.colorScheme.background,
      appBar: AppBar(
        titleSpacing: 0,
        title: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [Text(group.name, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, letterSpacing: -0.5))],
              ),
            ),
            booksAsync.when(
              data: (books) => Container(
                margin: const EdgeInsets.only(right: 16),
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: theme.colorScheme.primary.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: theme.colorScheme.primary.withValues(alpha: 0.2)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.library_books_rounded, size: 12, color: theme.colorScheme.primary),
                    const SizedBox(width: 4),
                    Text(
                      '${books.length}${group.bookTotal != null ? " / ${group.bookTotal}" : ""}',
                      style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: theme.colorScheme.primary),
                    ),
                  ],
                ),
              ),
              loading: () => const SizedBox.shrink(),
              error: (err, stack) => const SizedBox.shrink(),
            ),
          ],
        ),
        centerTitle: false,
        elevation: 0,
        backgroundColor: theme.colorScheme.background,
        foregroundColor: theme.colorScheme.foreground,
      ),
      body: Column(
        children: [
          FilterBar(groupId: group.id),
          Expanded(
            child: booksAsync.when(
              data: (books) {
                if (books.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.library_books_rounded, size: 48, color: theme.colorScheme.mutedForeground.withValues(alpha: 0.5)),
                        const SizedBox(height: 12),
                        Text(AppLocalizations.of(context)!.noBooksFound, style: theme.textTheme.muted),
                      ],
                    ),
                  );
                }
                return RawScrollbar(
                  thumbColor: theme.colorScheme.primary.withValues(alpha: 0.3),
                  radius: const Radius.circular(8),
                  thickness: 4,
                  child: ListView.builder(
                    padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                    itemCount: books.length,
                    itemBuilder: (context, index) {
                      final item = books[index];
                      return BookListItem(item: item, index: index);
                    },
                  ),
                );
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (err, _) => Center(child: Text('Error: $err')),
            ),
          ),
        ],
      ),
    );
  }
}
