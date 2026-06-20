import 'package:drift/drift.dart';

class MathTrickDailyScores extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get userId => text().withDefault(const Constant('default'))();
  IntColumn get dateId => integer()();
  IntColumn get day => integer()();
  IntColumn get correctAnswer => integer().withDefault(const Constant(0))();
  IntColumn get wrongAnswer => integer().withDefault(const Constant(0))();
  TextColumn get extra => text().withDefault(const Constant('{}'))();
}
