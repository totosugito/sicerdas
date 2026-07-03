import 'package:drift/drift.dart';

class MathMasterScores extends Table {
  TextColumn get id => text()();                     // Client-generated UUID (Primary Key)
  TextColumn get chapterKey => text()();             // e.g. "addition2Digit"
  IntColumn get correctCount => integer()();
  IntColumn get wrongCount => integer()();
  IntColumn get elapsedSeconds => integer()();
  DateTimeColumn get completedAt => dateTime()();
  BoolColumn get isSynced => boolean().withDefault(const Constant(false))();

  @override
  Set<Column> get primaryKey => {id};
}
