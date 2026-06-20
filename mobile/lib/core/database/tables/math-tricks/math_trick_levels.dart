import 'package:drift/drift.dart';

class MathTrickLevels extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get userId => text().withDefault(const Constant('default'))();
  TextColumn get chapterKey => text()();
  IntColumn get levelId => integer()();
  IntColumn get star => integer().withDefault(const Constant(0))();
  IntColumn get time => integer().withDefault(const Constant(0))();
  IntColumn get score => integer().withDefault(const Constant(0))();
  IntColumn get correct => integer().withDefault(const Constant(0))();
  IntColumn get wrong => integer().withDefault(const Constant(0))();
  TextColumn get extra => text().withDefault(const Constant('{}'))();
}
