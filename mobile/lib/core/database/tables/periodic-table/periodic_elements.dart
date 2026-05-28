import 'package:drift/drift.dart';

@TableIndex(name: 'periodic_elements_atomic_number_idx', columns: {#atomicNumber})
@TableIndex(name: 'periodic_elements_atomic_symbol_idx', columns: {#atomicSymbol})
@TableIndex(name: 'periodic_elements_idx_idy_idx', columns: {#idx, #idy})
class PeriodicElements extends Table {
  IntColumn get id => integer()();
  IntColumn get idx => integer()();
  IntColumn get idy => integer()();
  IntColumn get atomicNumber => integer()();
  TextColumn get atomicGroup => text()();
  TextColumn get atomicName => text().withLength(max: 128)();
  TextColumn get atomicSymbol => text().withLength(max: 8)();
  TextColumn get atomicImages => text().withDefault(const Constant('{}'))();
  TextColumn get atomicProperties => text().withDefault(const Constant('{}'))();
  TextColumn get atomicIsotope => text().withDefault(const Constant('{}'))();
  TextColumn get atomicExtra => text().withDefault(const Constant('{}'))();

  @override
  Set<Column> get primaryKey => {id};
}
