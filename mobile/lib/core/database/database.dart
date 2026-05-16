import 'dart:io';

import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;
import 'tables.dart';

part 'database.g.dart';

@DriftDatabase(tables: [AppVersions, Books, Categories, EducationGrades, BookGroups])
class AppDatabase extends _$AppDatabase {
  AppDatabase() : super(_openConnection());

  @override
  int get schemaVersion => 1;

  // --- Global Helpers ---

  Future<void> clearAllData() async {
    await transaction(() async {
      await delete(books).go();
      await delete(appVersions).go();
      await delete(categories).go();
      await delete(educationGrades).go();
      await delete(bookGroups).go();
    });
  }

  // --- Versioning Helpers ---
  
  Future<int> upsertVersion(AppVersion version) {
    return into(appVersions).insertOnConflictUpdate(version);
  }

  Future<AppVersion?> getLatestVersion(String dataType) {
    return (select(appVersions)
          ..where((t) => t.dataType.equals(dataType))
          ..orderBy([(t) => OrderingTerm(expression: t.id, mode: OrderingMode.desc)])
          ..limit(1))
        .getSingleOrNull();
  }

  Future<int> getGlobalLatestDbVersion() async {
    final result = await (select(appVersions)
          ..orderBy([(t) => OrderingTerm(expression: t.dbVersion, mode: OrderingMode.desc)])
          ..limit(1))
        .getSingleOrNull();
    return result?.dbVersion ?? 0;
  }

  // --- Metadata Helpers ---

  Future<void> upsertCategories(List<Category> categoryList) async {
    await batch((batch) {
      batch.insertAll(categories, categoryList, mode: InsertMode.insertOrReplace);
    });
  }

  Future<void> upsertGrades(List<EducationGrade> gradeList) async {
    await batch((batch) {
      batch.insertAll(educationGrades, gradeList, mode: InsertMode.insertOrReplace);
    });
  }

  Future<void> upsertGroups(List<BookGroup> groupList) async {
    await batch((batch) {
      batch.insertAll(bookGroups, groupList, mode: InsertMode.insertOrReplace);
    });
  }

  // --- Book Helpers ---

  Future<void> replaceBooksForVersion(int versionId, List<Book> newBooks) async {
    await transaction(() async {
      await (delete(books)..where((t) => t.versionId.equals(versionId))).go();
      await batch((batch) {
        batch.insertAll(books, newBooks, mode: InsertMode.insertOrReplace);
      });
    });
  }

  Future<void> upsertBooks(List<Book> bookList) async {
    await batch((batch) {
      batch.insertAll(books, bookList, mode: InsertMode.insertOrReplace);
    });
  }

  Stream<List<Book>> watchBooks() => select(books).watch();

  Stream<List<BookWithMetadata>> watchFilteredBooks({
    String? search,
    int? groupId,
    List<int>? gradeIds,
    String? sortBy, // title, pages, size
    bool descending = false,
  }) {
    final query = select(books).join([
      innerJoin(bookGroups, bookGroups.id.equalsExp(books.bookGroupId)),
      innerJoin(categories, categories.id.equalsExp(bookGroups.categoryId)),
      innerJoin(educationGrades, educationGrades.id.equalsExp(books.educationGradeId)),
    ]);
    
    if (search != null && search.isNotEmpty) {
      query.where(books.title.contains(search) | books.author.contains(search));
    }
    
    if (groupId != null) {
      query.where(books.bookGroupId.equals(groupId));
    }
    
    if (gradeIds != null && gradeIds.isNotEmpty) {
      query.where(books.educationGradeId.isIn(gradeIds));
    }

    if (sortBy != null) {
      query.orderBy([
        OrderingTerm(
          expression: sortBy == 'pages' 
              ? books.totalPages 
              : (sortBy == 'size' ? books.size : books.title), 
          mode: descending ? OrderingMode.desc : OrderingMode.asc
        )
      ]);
    }

    return query.watch().map((rows) {
      return rows.map((row) {
        return BookWithMetadata(
          book: row.readTable(books),
          category: row.readTable(categories),
          grade: row.readTable(educationGrades),
        );
      }).toList();
    });
  }

  // --- Metadata Stream Helpers ---
  Stream<List<Category>> watchCategories() => select(categories).watch();
  Stream<List<EducationGrade>> watchGrades() => select(educationGrades).watch();
  Stream<List<BookGroup>> watchGroups({int? categoryId}) {
    final query = select(bookGroups);
    if (categoryId != null) {
      query.where((t) => t.categoryId.equals(categoryId));
    }
    return query.watch();
  }

  Stream<List<EducationGrade>> watchGradesByGroup(int groupId) {
    final query = select(educationGrades).join([
      innerJoin(books, books.educationGradeId.equalsExp(educationGrades.id)),
    ])
      ..where(books.bookGroupId.equals(groupId))
      ..groupBy([educationGrades.id]);

    return query.watch().map((rows) {
      return rows.map((row) => row.readTable(educationGrades)).toList();
    });
  }
}

class BookWithMetadata {
  final Book book;
  final Category category;
  final EducationGrade grade;

  BookWithMetadata({required this.book, required this.category, required this.grade});
}

LazyDatabase _openConnection() {
  return LazyDatabase(() async {
    final dbFolder = await getApplicationDocumentsDirectory();
    final file = File(p.join(dbFolder.path, 'db.sqlite'));
    return NativeDatabase.createInBackground(file);
  });
}
