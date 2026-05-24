import 'package:drift/drift.dart';
import '../app_versions.dart';
import 'categories.dart';
import '../enums.dart';

@TableIndex(name: 'book_groups_category_idx', columns: {#categoryId})
@TableIndex(name: 'book_groups_version_idx', columns: {#versionId})
class BookGroups extends Table {
  IntColumn get id => integer()();
  IntColumn get versionId => integer().references(AppVersions, #id)();
  IntColumn get categoryId => integer().references(Categories, #id)();
  TextColumn get name => text()();
  TextColumn get shortName => text()();
  TextColumn get desc => text().nullable()();
  IntColumn get bookTotal => integer().nullable()();
  TextColumn get status => textEnum<ContentStatus>()();

  @override
  Set<Column> get primaryKey => {id};
}


