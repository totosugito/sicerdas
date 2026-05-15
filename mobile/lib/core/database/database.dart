import 'dart:io';

import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;
import 'tables.dart';

part 'database.g.dart';

@DriftDatabase(tables: [AppVersions, Books])
class AppDatabase extends _$AppDatabase {
  AppDatabase() : super(_openConnection());

  @override
  int get schemaVersion => 1;

  // --- Global Helpers ---

  Future<void> clearAllData() async {
    await transaction(() async {
      await delete(books).go();
      await delete(appVersions).go();
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
}

LazyDatabase _openConnection() {
  return LazyDatabase(() async {
    final dbFolder = await getApplicationDocumentsDirectory();
    final file = File(p.join(dbFolder.path, 'db.sqlite'));
    return NativeDatabase.createInBackground(file);
  });
}
