import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../database/database.dart';
import 'database_provider.dart';

class BooksFilter {
  final String search;
  final int? groupId;
  final List<int>? gradeIds;
  final int? categoryId;

  final String? sortBy;
  final bool descending;

  BooksFilter({
    this.search = '',
    this.groupId,
    this.gradeIds,
    this.categoryId,
    this.sortBy,
    this.descending = false,
  });

  BooksFilter copyWith({
    String? search,
    int? groupId,
    List<int>? gradeIds,
    int? categoryId,
    String? sortBy,
    bool? descending,
  }) {
    return BooksFilter(
      search: search ?? this.search,
      groupId: groupId ?? this.groupId,
      gradeIds: gradeIds ?? this.gradeIds,
      categoryId: categoryId ?? this.categoryId,
      sortBy: sortBy ?? this.sortBy,
      descending: descending ?? this.descending,
    );
  }

  BooksFilter clearFilters() {
    return BooksFilter(search: search, groupId: groupId);
  }
}

class BooksFilterNotifier extends Notifier<BooksFilter> {
  @override
  BooksFilter build() => BooksFilter();

  void update(BooksFilter Function(BooksFilter) cb) {
    state = cb(state);
  }
}

final booksFilterProvider = NotifierProvider<BooksFilterNotifier, BooksFilter>(BooksFilterNotifier.new);

final filteredBooksProvider = StreamProvider<List<BookWithMetadata>>((ref) {
  final db = ref.watch(databaseProvider);
  final filter = ref.watch(booksFilterProvider);

  return db.watchFilteredBooks(
    search: filter.search,
    groupId: filter.groupId,
    gradeIds: filter.gradeIds,
    sortBy: filter.sortBy,
    descending: filter.descending,
  );
});

final categoriesProvider = StreamProvider<List<Category>>((ref) {
  return ref.watch(databaseProvider).watchCategories();
});

final gradesProvider = StreamProvider<List<EducationGrade>>((ref) {
  return ref.watch(databaseProvider).watchGrades();
});

final groupsProvider = StreamProvider<List<BookGroup>>((ref) {
  final filter = ref.watch(booksFilterProvider);
  return ref.watch(databaseProvider).watchGroups(categoryId: filter.categoryId);
});

final allGroupsProvider = StreamProvider<List<BookGroup>>((ref) {
  final db = ref.watch(databaseProvider);
  return (db.select(db.bookGroups)).watch();
});
