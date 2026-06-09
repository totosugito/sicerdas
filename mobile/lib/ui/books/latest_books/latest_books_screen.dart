import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:drift/drift.dart' hide Column;
import 'package:bse/l10n/gen_l10n/app_localizations.dart';
import 'package:bse/core/database/database.dart';
import 'package:bse/core/providers/database_provider.dart';
import 'package:bse/widgets/error_view.dart';
import 'package:bse/widgets/loading_view.dart';
import 'widgets/latest_books_filter_bar.dart';
import 'widgets/latest_books_header.dart';
import 'package:bse/widgets/sliver_sticky_header_delegate.dart';
import '../libs/providers/books_provider.dart';
import '../book_screen/widgets/book_list_item.dart';

class LatestBooksFilter {
  final String search;
  final String sortBy;
  final bool descending;
  final List<int> gradeIds;

  LatestBooksFilter({
    this.search = '',
    this.sortBy = 'title',
    this.descending = false,
    this.gradeIds = const [],
  });

  LatestBooksFilter copyWith({
    String? search,
    String? sortBy,
    bool? descending,
    List<int>? gradeIds,
  }) {
    return LatestBooksFilter(
      search: search ?? this.search,
      sortBy: sortBy ?? this.sortBy,
      descending: descending ?? this.descending,
      gradeIds: gradeIds ?? this.gradeIds,
    );
  }
}

class LatestBooksNotifier extends Notifier<LatestBooksFilter> {
  @override
  LatestBooksFilter build() => LatestBooksFilter();

  void updateSearch(String value) => state = state.copyWith(search: value);
  void updateAll(LatestBooksFilter newFilter) => state = newFilter;
}

final latestBooksFilterProvider =
    NotifierProvider<LatestBooksNotifier, LatestBooksFilter>(
      LatestBooksNotifier.new,
    );

final latestBooksGradesProvider = StreamProvider<List<EducationGrade>>((ref) {
  final db = ref.watch(databaseProvider);
  final latestVersion = ref.watch(latestBookVersionIdProvider).value;
  if (latestVersion == null) return Stream.value([]);

  final query =
      db.select(db.educationGrades).join([
          innerJoin(
            db.books,
            db.books.educationGradeId.equalsExp(db.educationGrades.id),
          ),
        ])
        ..where(db.books.versionId.equals(latestVersion))
        ..groupBy([db.educationGrades.id]);

  return query.watch().map((rows) {
    return rows.map((row) => row.readTable(db.educationGrades)).toList();
  });
});

final latestBooksStreamProvider = StreamProvider<List<BookWithMetadata>>((ref) {
  final db = ref.watch(databaseProvider);
  final filter = ref.watch(latestBooksFilterProvider);
  final latestVersion = ref.watch(latestBookVersionIdProvider).value;
  if (latestVersion == null) return Stream.value([]);

  return db
      .watchFilteredBooks(
        gradeIds: filter.gradeIds.isEmpty ? null : filter.gradeIds,
        search: filter.search,
        sortBy: filter.sortBy,
        descending: filter.descending,
        versionId: latestVersion,
      )
      .map((books) {
        return books.map((b) => b.copyWith(isNew: true)).toList();
      });
});

final unfilteredLatestBooksStreamProvider =
    StreamProvider<List<BookWithMetadata>>((ref) {
      final db = ref.watch(databaseProvider);
      final latestVersion = ref.watch(latestBookVersionIdProvider).value;
      if (latestVersion == null) return Stream.value([]);

      return db.watchFilteredBooks(versionId: latestVersion);
    });

class LatestBooksScreen extends ConsumerWidget {
  const LatestBooksScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = ShadTheme.of(context);
    final booksAsync = ref.watch(latestBooksStreamProvider);
    final l10n = AppLocalizations.of(context)!;

    ref.listen(latestBooksGradesProvider, (previous, next) {
      if (next is AsyncData<List<EducationGrade>>) {
        final availableIds = next.value.map((e) => e.id).toSet();
        final currentFilter = ref.read(latestBooksFilterProvider);
        final validGradeIds = currentFilter.gradeIds
            .where((id) => availableIds.contains(id))
            .toList();

        if (validGradeIds.length != currentFilter.gradeIds.length) {
          ref
              .read(latestBooksFilterProvider.notifier)
              .updateAll(currentFilter.copyWith(gradeIds: validGradeIds));
        }
      }
    });

    return Scaffold(
      backgroundColor: theme.colorScheme.background,
      body: RawScrollbar(
        thumbColor: theme.colorScheme.primary.withValues(alpha: 0.3),
        radius: const Radius.circular(8),
        thickness: 4,
        child: CustomScrollView(
          slivers: [
            // Collapsible Hero Header with custom Purple/Indigo releases theme
            const LatestBooksHeader(),

            // Sticky Filter Bar
            SliverPersistentHeader(
              pinned: true,
              delegate: SliverStickyHeaderDelegate(
                height: 62.0,
                backgroundColor: theme.colorScheme.background,
                child: const LatestBooksFilterBar(),
              ),
            ),

            // Books List
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
                          Text(l10n.noBooksFound, style: theme.textTheme.muted),
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
              loading: () => const SliverFillRemaining(
                hasScrollBody: false,
                child: LoadingView(),
              ),
              error: (err, _) => SliverFillRemaining(
                hasScrollBody: false,
                child: ErrorView(
                  message: l10n.errorGeneric,
                  details: err.toString(),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

