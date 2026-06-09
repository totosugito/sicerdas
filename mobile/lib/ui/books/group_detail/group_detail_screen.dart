import 'package:flutter/material.dart';
import 'package:bse/l10n/gen_l10n/app_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/core/database/database.dart';
import 'package:bse/core/providers/database_provider.dart';
import 'package:bse/widgets/error_view.dart';
import 'package:bse/widgets/loading_view.dart';
import '../libs/providers/books_provider.dart';
import '../book_screen/widgets/book_list_item.dart';
import 'widgets/filter_bar.dart';
import 'widgets/group_detail_header.dart';
import 'package:bse/widgets/sliver_sticky_header_delegate.dart';

// Local state for GroupDetail filtering
class GroupDetailFilter {
  final String search;
  final String sortBy;
  final bool descending;
  final List<int> gradeIds;

  GroupDetailFilter({
    this.search = '',
    this.sortBy = 'version',
    this.descending = true,
    this.gradeIds = const [],
  });

  GroupDetailFilter copyWith({
    String? search,
    String? sortBy,
    bool? descending,
    List<int>? gradeIds,
  }) {
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

final groupDetailFilterProvider =
    NotifierProvider<GroupDetailNotifier, GroupDetailFilter>(
      GroupDetailNotifier.new,
    );

final groupGradesProvider = StreamProvider.family<List<EducationGrade>, int>((
  ref,
  groupId,
) {
  return ref.watch(databaseProvider).watchGradesByGroup(groupId);
});

final groupBooksProvider = StreamProvider.family<List<BookWithMetadata>, int>((
  ref,
  groupId,
) {
  final db = ref.watch(databaseProvider);
  final filter = ref.watch(groupDetailFilterProvider);
  final latestVersionId = ref.watch(latestBookVersionIdProvider).value;

  return db
      .watchFilteredBooks(
        groupId: groupId,
        gradeIds: filter.gradeIds.isEmpty ? null : filter.gradeIds,
        search: filter.search,
        sortBy: filter.sortBy,
        descending: filter.descending,
      )
      .map((books) {
        return books.map((b) {
          return b.copyWith(
            isNew:
                latestVersionId != null && b.book.versionId == latestVersionId,
          );
        }).toList();
      });
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
        final validGradeIds = currentFilter.gradeIds
            .where((id) => availableIds.contains(id))
            .toList();

        if (validGradeIds.length != currentFilter.gradeIds.length) {
          ref
              .read(groupDetailFilterProvider.notifier)
              .updateAll(currentFilter.copyWith(gradeIds: validGradeIds));
        }
      }
    });

    return Scaffold(
      backgroundColor: theme.colorScheme.background,
      body: CustomScrollView(
        slivers: [
          // Collapsible Hero Header
          GroupDetailHeader(group: group),

          // Sticky Filter Bar
          SliverPersistentHeader(
            pinned: true,
            delegate: SliverStickyHeaderDelegate(
              height: 62.0,
              backgroundColor: theme.colorScheme.background,
              child: FilterBar(groupId: group.id),
            ),
          ),

          booksAsync.when(
            data: (books) {
              if (books.isEmpty) {
                return SliverFillRemaining(
                  hasScrollBody: false,
                  child: Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.library_books_rounded,
                          size: 48,
                          color: theme.colorScheme.mutedForeground.withValues(
                            alpha: 0.5,
                          ),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          AppLocalizations.of(context)!.noBooksFound,
                          style: theme.textTheme.muted,
                        ),
                      ],
                    ),
                  ),
                );
              }
              return SliverPadding(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                sliver: SliverList(
                  delegate: SliverChildBuilderDelegate((context, index) {
                    final item = books[index];
                    return BookListItem(item: item, index: index);
                  }, childCount: books.length),
                ),
              );
            },
            loading: () {
              if (booksAsync.hasValue) {
                final books = booksAsync.value!;
                if (books.isEmpty) {
                  return const SliverFillRemaining(
                    hasScrollBody: false,
                    child: LoadingView(),
                  );
                }
                return SliverPadding(
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                  sliver: SliverList(
                    delegate: SliverChildBuilderDelegate((context, index) {
                      final item = books[index];
                      return BookListItem(item: item, index: index);
                    }, childCount: books.length),
                  ),
                );
              }
              return const SliverFillRemaining(
                hasScrollBody: false,
                child: LoadingView(),
              );
            },
            error: (err, _) {
              if (booksAsync.hasValue) {
                final books = booksAsync.value!;
                return SliverPadding(
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                  sliver: SliverList(
                    delegate: SliverChildBuilderDelegate((context, index) {
                      final item = books[index];
                      return BookListItem(item: item, index: index);
                    }, childCount: books.length),
                  ),
                );
              }
              return SliverFillRemaining(
                hasScrollBody: false,
                child: ErrorView(
                  message: AppLocalizations.of(context)!.errorGeneric,
                  details: err.toString(),
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}

