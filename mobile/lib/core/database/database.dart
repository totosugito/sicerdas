import 'dart:io';

import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;
import 'tables.dart';

export 'book_database.dart';
export 'periodic_database.dart';
export 'tables.dart';

part 'database.g.dart';

@DriftDatabase(
  tables: [
    AppVersions,
    Books,
    Categories,
    EducationGrades,
    BookGroups,
    PeriodicElements,
    PeriodicElementNotes,
    MathTrickChapters,
    MathTrickLevels,
    MathTrickDailyScores,
    MathMasterScores,
  ],
)
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
      await delete(periodicElements).go();
      await delete(periodicElementNotes).go();
      await delete(mathMasterScores).go();
      // await delete(mathTrickChapters).go();
      // await delete(mathTrickLevels).go();
      // await delete(mathTrickDailyScores).go();
    });
  }

  // --- Versioning Helpers ---

  Future<int> upsertVersion(AppVersion version) {
    return into(appVersions).insertOnConflictUpdate(version);
  }

  Future<AppVersion?> getLatestVersion(ContentType dataType) {
    return (select(appVersions)
          ..where((t) => t.dataType.equals(dataType.name))
          ..orderBy([
            (t) => OrderingTerm(expression: t.id, mode: OrderingMode.desc),
          ])
          ..limit(1))
        .getSingleOrNull();
  }

  Future<int> getGlobalLatestDbVersion() async {
    final result =
        await (select(appVersions)
              ..orderBy([
                (t) => OrderingTerm(
                  expression: t.dbVersion,
                  mode: OrderingMode.desc,
                ),
              ])
              ..limit(1))
            .getSingleOrNull();
    return result?.dbVersion ?? 0;
  }
}

LazyDatabase _openConnection() {
  return LazyDatabase(() async {
    final dbFolder = await getApplicationDocumentsDirectory();
    final file = File(p.join(dbFolder.path, 'db.sqlite'));
    return NativeDatabase.createInBackground(file);
  });
}
