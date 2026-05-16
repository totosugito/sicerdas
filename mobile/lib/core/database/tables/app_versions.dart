import 'package:drift/drift.dart';

class AppVersions extends Table {
  IntColumn get id => integer()();
  IntColumn get appVersion => integer()();
  IntColumn get dbVersion => integer()();
  TextColumn get dataType => text()();
  TextColumn get status => text()();
  TextColumn get name => text().withDefault(const Constant(''))();
  TextColumn get htmlNote => text().withDefault(const Constant(''))();
  TextColumn get extra => text().withDefault(const Constant('{}'))();
  DateTimeColumn get createdAt => dateTime().withDefault(currentDateAndTime)();

  @override
  Set<Column> get primaryKey => {id};
}
