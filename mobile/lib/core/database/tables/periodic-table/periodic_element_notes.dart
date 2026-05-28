import 'package:drift/drift.dart';

@TableIndex(name: 'periodic_element_notes_atomic_number_idx', columns: {#atomicNumber})
@TableIndex(name: 'periodic_element_notes_locale_code_idx', columns: {#localeCode})
class PeriodicElementNotes extends Table {
  IntColumn get id => integer()();
  IntColumn get atomicNumber => integer()();
  TextColumn get localeCode => text().withLength(max: 3)();
  TextColumn get atomicOverview => text()();
  TextColumn get atomicHistory => text()();
  TextColumn get atomicApps => text()();
  TextColumn get atomicFacts => text()();

  @override
  Set<Column> get primaryKey => {id};
}
