import 'dart:io';
import 'package:path/path.dart' as p;
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:drift/drift.dart';
import '../database/database.dart';
import 'database_provider.dart';
import 'settings_provider.dart';
import '../utils/book_utils.dart';

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

final categoriesWithGroupsProvider = StreamProvider<List<Category>>((ref) {
  return ref.watch(databaseProvider).watchCategoriesWithGroups();
});

final gradesProvider = StreamProvider<List<EducationGrade>>((ref) {
  return ref.watch(databaseProvider).watchGrades();
});

final groupsProvider = StreamProvider<List<BookGroup>>((ref) {
  final filter = ref.watch(booksFilterProvider);
  return ref.watch(databaseProvider).watchGroups(categoryId: filter.categoryId);
});

class BookGroupWithMetadata {
  final BookGroup group;
  final bool isNew;

  BookGroupWithMetadata({
    required this.group,
    this.isNew = false,
  });
}

final latestBookVersionIdProvider = StreamProvider<int?>((ref) {
  final db = ref.watch(databaseProvider);
  return (db.select(db.appVersions)
        ..where((t) => t.dataType.equals(ContentType.book.name) & t.status.equals(ContentStatus.published.name))
        ..orderBy([
          (t) => OrderingTerm(
            expression: t.id,
            mode: OrderingMode.desc,
          ),
        ])
        ..limit(1))
      .watch()
      .map((list) => list.firstOrNull?.id);
});

final allGroupsProvider = StreamProvider<List<BookGroupWithMetadata>>((ref) {
  final db = ref.watch(databaseProvider);
  final latestVersionId = ref.watch(latestBookVersionIdProvider).value;

  final groupsStream = (db.select(db.bookGroups)
        ..where((t) =>
            t.status.equals(ContentStatus.published.name) &
            t.bookTotal.isBiggerThan(Constant(0))))
      .watch();

  return groupsStream.map((groups) {
    return groups.map((g) {
      return BookGroupWithMetadata(
        group: g,
        isNew: latestVersionId != null && g.versionId == latestVersionId,
      );
    }).toList();
  });
});

class GroupBookExpandAllNotifier extends Notifier<bool> {
  static const _key = 'expand_all_groups';

  @override
  bool build() {
    final prefs = ref.watch(sharedPreferencesProvider);
    return prefs.getBool(_key) ?? true;
  }

  void toggle() {
    final newValue = !state;
    state = newValue;
    ref.read(sharedPreferencesProvider).setBool(_key, newValue);
  }

  void setExpanded(bool value) {
    state = value;
    ref.read(sharedPreferencesProvider).setBool(_key, value);
  }
}

final groupBookExpandAllProvider = NotifierProvider<GroupBookExpandAllNotifier, bool>(() {
  return GroupBookExpandAllNotifier();
});

class CategoryExpansionNotifier extends Notifier<Map<int, bool>> {
  @override
  Map<int, bool> build() {
    return {};
  }

  void setExpanded(int categoryId, bool isExpanded) {
    state = {
      ...state,
      categoryId: isExpanded,
    };
  }

  void resetAll() {
    state = {};
  }
}

final categoryExpansionProvider = NotifierProvider.autoDispose<CategoryExpansionNotifier, Map<int, bool>>(() {
  return CategoryExpansionNotifier();
});

class DownloadedBookIdsNotifier extends AsyncNotifier<Set<int>> {
  @override
  Future<Set<int>> build() async {
    final rootDir = await BookUtils.getBookRootDir();
    final dir = Directory(rootDir);
    if (!await dir.exists()) {
      return {};
    }
    final files = dir.listSync();
    final ids = <int>{};
    for (final file in files) {
      if (file is File && file.path.endsWith('.pdf')) {
        final filename = p.basename(file.path);
        final prefix = filename.split('_').first;
        final id = int.tryParse(prefix);
        if (id != null) {
          ids.add(id);
        }
      }
    }
    return ids;
  }

  void addId(int id) {
    final current = state.value ?? {};
    state = AsyncValue.data({...current, id});
  }

  void removeId(int id) {
    final current = state.value ?? {};
    state = AsyncValue.data(current.where((x) => x != id).toSet());
  }
}

final downloadedBookIdsProvider = AsyncNotifierProvider<DownloadedBookIdsNotifier, Set<int>>(() {
  return DownloadedBookIdsNotifier();
});
