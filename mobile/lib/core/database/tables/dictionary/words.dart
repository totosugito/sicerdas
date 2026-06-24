import 'package:drift/drift.dart';

class Words extends Table {
  IntColumn get dictId => integer()();
  TextColumn get word => text()();
  TextColumn get meaning => text()();
  IntColumn get mode => integer()();
  BoolColumn get dictSwap => boolean().withDefault(const Constant(false))();

  @override
  Set<Column> get primaryKey => {dictId};
}
