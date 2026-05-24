import 'package:drift/drift.dart';
import '../app_versions.dart';
import 'book_groups.dart';
import 'education_grades.dart';
import '../enums.dart';

@TableIndex(name: 'books_title_idx', columns: {#title})
@TableIndex(name: 'books_author_idx', columns: {#author})
@TableIndex(name: 'books_group_idx', columns: {#bookGroupId})
@TableIndex(name: 'books_grade_idx', columns: {#educationGradeId})
@TableIndex(name: 'books_version_idx', columns: {#versionId})
@TableIndex(name: 'books_status_idx', columns: {#status})
class Books extends Table {
  TextColumn get id => text()(); // UUID
  IntColumn get bookId => integer()();
  IntColumn get versionId => integer().references(AppVersions, #id)();
  
  TextColumn get title => text()();
  TextColumn get description => text().nullable()();
  TextColumn get author => text().nullable()();
  TextColumn get publishedYear => text()();
  IntColumn get totalPages => integer()();
  IntColumn get size => integer()();
  TextColumn get status => textEnum<ContentStatus>()();
  
  // Relations (IDs for filtering)
  IntColumn get bookGroupId => integer().references(BookGroups, #id)();
  IntColumn get educationGradeId => integer().references(EducationGrades, #id)();

  @override
  Set<Column> get primaryKey => {id};
}
