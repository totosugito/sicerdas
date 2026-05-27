import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:drift/drift.dart' hide Column;
import '../../../../l10n/gen_l10n/app_localizations.dart';
import '../../../../core/database/database.dart';
import '../../../../core/providers/database_provider.dart';
import '../../../../core/providers/books_provider.dart';
import '../book_screen/widgets/book_list_item.dart';
import 'widgets/latest_books_filter_bar.dart';
import '../../widgets/error_view.dart';
import '../../widgets/loading_view.dart';

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
    final unfilteredAsync = ref.watch(unfilteredLatestBooksStreamProvider);
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
      appBar: AppBar(
        title: Text(
          l10n.latestBooks,
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w800,
            letterSpacing: -0.5,
          ),
        ),
        actions: [
          booksAsync.when(
            data: (books) {
              final totalCount = unfilteredAsync.value?.length ?? books.length;
              return Container(
                margin: const EdgeInsets.only(right: 16),
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 4,
                ),
                decoration: BoxDecoration(
                  color: theme.colorScheme.primary.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: theme.colorScheme.primary.withValues(alpha: 0.2),
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      '${books.length} / $totalCount',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: theme.colorScheme.primary,
                      ),
                    ),
                  ],
                ),
              );
            },
            loading: () => const SizedBox.shrink(),
            error: (err, stack) => const SizedBox.shrink(),
          ),
        ],
        centerTitle: false,
        elevation: 0,
        backgroundColor: theme.colorScheme.background,
        foregroundColor: theme.colorScheme.foreground,
      ),
      body: Column(
        children: [
          const LatestBooksFilterBar(),
          Expanded(
            child: booksAsync.when(
              data: (books) {
                if (books.isEmpty) {
                  return Center(
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
}
