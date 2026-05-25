import 'package:drift/drift.dart';
import 'database.dart';

extension BookDatabaseExtension on AppDatabase {
  // --- Metadata Helpers ---

  Future<void> upsertCategories(List<Category> categoryList) async {
    await batch((batch) {
      batch.insertAll(
        categories,
        categoryList,
        mode: InsertMode.insertOrReplace,
      );
    });
  }

  Future<void> upsertGrades(List<EducationGrade> gradeList) async {
    await batch((batch) {
      batch.insertAll(
        educationGrades,
        gradeList,
        mode: InsertMode.insertOrReplace,
      );
    });
  }

  Future<void> upsertGroups(List<BookGroup> groupList) async {
    await batch((batch) {
      batch.insertAll(bookGroups, groupList, mode: InsertMode.insertOrReplace);
    });
  }

  // --- Book Helpers ---

  Future<void> replaceBooksForVersion(
    int versionId,
    List<Book> newBooks,
  ) async {
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
    List<int>? groupIds,
    List<int>? gradeIds,
    int? versionId,
    String? sortBy, // title, pages, size, version
    bool descending = false,
  }) {
    final query = select(books).join([
      innerJoin(bookGroups, bookGroups.id.equalsExp(books.bookGroupId)),
      innerJoin(categories, categories.id.equalsExp(bookGroups.categoryId)),
      innerJoin(
        educationGrades,
        educationGrades.id.equalsExp(books.educationGradeId),
      ),
    ]);

    if (search != null && search.isNotEmpty) {
      query.where(books.title.contains(search) | books.author.contains(search));
    }

    if (groupId != null) {
      query.where(books.bookGroupId.equals(groupId));
    }

    if (groupIds != null && groupIds.isNotEmpty) {
      query.where(books.bookGroupId.isIn(groupIds));
    }

    if (gradeIds != null && gradeIds.isNotEmpty) {
      query.where(books.educationGradeId.isIn(gradeIds));
    }

    if (versionId != null) {
      query.where(books.versionId.equals(versionId));
    }

    if (sortBy != null) {
      query.orderBy([
        OrderingTerm(
          expression: sortBy == 'pages'
              ? books.totalPages
              : (sortBy == 'size'
                    ? books.size
                    : (sortBy == 'version' ? books.versionId : books.title)),
          mode: descending ? OrderingMode.desc : OrderingMode.asc,
        ),
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
  Stream<List<Category>> watchCategoriesWithGroups() {
    final query =
        select(categories).join([
            innerJoin(
              bookGroups,
              bookGroups.categoryId.equalsExp(categories.id),
            ),
          ])
          ..where(
            bookGroups.status.equals(ContentStatus.published.name) &
                bookGroups.bookTotal.isBiggerThan(const Constant(0)),
          )
          ..groupBy([categories.id]);

    return query.watch().map((rows) {
      return rows.map((row) => row.readTable(categories)).toList();
    });
  }

  Stream<List<EducationGrade>> watchGrades() => select(educationGrades).watch();
  Stream<List<BookGroup>> watchGroups({int? categoryId}) {
    final query = select(bookGroups);
    if (categoryId != null) {
      query.where((t) => t.categoryId.equals(categoryId));
    }
    return query.watch();
  }

  Stream<List<EducationGrade>> watchGradesByGroup(int groupId) {
    final query =
        select(educationGrades).join([
            innerJoin(
              books,
              books.educationGradeId.equalsExp(educationGrades.id),
            ),
          ])
          ..where(books.bookGroupId.equals(groupId))
          ..groupBy([educationGrades.id]);

    return query.watch().map((rows) {
      return rows.map((row) => row.readTable(educationGrades)).toList();
    });
  }



  Stream<List<BookGroup>> watchGroupsForBookIds(List<int> bookIds, {int? categoryId}) {
    if (bookIds.isEmpty) {
      return Stream.value([]);
    }
    final query = select(bookGroups).join([
      innerJoin(books, books.bookGroupId.equalsExp(bookGroups.id)),
    ])..where(books.bookId.isIn(bookIds));
    
    if (categoryId != null) {
      query.where(bookGroups.categoryId.equals(categoryId));
    }
    
    query.groupBy([bookGroups.id]);

    return query.watch().map((rows) {
      return rows.map((row) => row.readTable(bookGroups)).toList();
    });
  }


}

class BookWithMetadata {
  final Book book;
  final Category category;
  final EducationGrade grade;
  final bool isNew;

  BookWithMetadata({
    required this.book,
    required this.category,
    required this.grade,
    this.isNew = false,
  });

  BookWithMetadata copyWith({
    Book? book,
    Category? category,
    EducationGrade? grade,
    bool? isNew,
  }) {
    return BookWithMetadata(
      book: book ?? this.book,
      category: category ?? this.category,
      grade: grade ?? this.grade,
      isNew: isNew ?? this.isNew,
    );
  }
}
