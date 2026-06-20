import 'package:drift/drift.dart';

class MathTrickChapters extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get userId => text().withDefault(const Constant('default'))();
  TextColumn get groupKey => text()();
  TextColumn get chapterKey => text()();
  IntColumn get correct => integer().withDefault(const Constant(0))();
  IntColumn get wrong => integer().withDefault(const Constant(0))();
  IntColumn get opened => integer().withDefault(const Constant(1))();
  TextColumn get extra => text().withDefault(const Constant('{}'))();
}
