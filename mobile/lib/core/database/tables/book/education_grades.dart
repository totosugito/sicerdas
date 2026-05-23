import 'package:drift/drift.dart';

class EducationGrades extends Table {
  IntColumn get id => integer()();
  TextColumn get grade => text()();
  TextColumn get name => text()();
  TextColumn get desc => text().nullable()();

  @override
  Set<Column> get primaryKey => {id};

  @override
  List<Set<Column>> get uniqueKeys => [
        {grade}
      ];
}
