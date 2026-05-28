import 'package:drift/drift.dart';
import 'database.dart';

extension PeriodicTableDatabaseExtension on AppDatabase {
  Future<void> upsertPeriodicElements(List<PeriodicElement> elementList) async {
    await batch((batch) {
      batch.insertAll(
        periodicElements,
        elementList,
        mode: InsertMode.insertOrReplace,
      );
    });
  }

  Future<void> upsertPeriodicElementNotes(List<PeriodicElementNote> noteList) async {
    await batch((batch) {
      batch.insertAll(
        periodicElementNotes,
        noteList,
        mode: InsertMode.insertOrReplace,
      );
    });
  }

  Future<bool> hasPeriodicTableData() async {
    final countExp = periodicElements.id.count();
    final query = selectOnly(periodicElements)..addColumns([countExp]);
    final row = await query.getSingle();
    final count = row.read(countExp) ?? 0;
    return count > 0;
  }

  Future<List<PeriodicElement>> getPeriodicElements() {
    return select(periodicElements).get();
  }

  Future<List<PeriodicElementNote>> getPeriodicElementNotes() {
    return select(periodicElementNotes).get();
  }

  Future<PeriodicElementNote?> getPeriodicElementNote(int atomicNumber, String localeCode) {
    return (select(periodicElementNotes)
          ..where((t) => t.atomicNumber.equals(atomicNumber) & t.localeCode.equals(localeCode))
          ..limit(1))
        .getSingleOrNull();
  }
}
