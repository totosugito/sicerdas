import 'package:drift/drift.dart';
import 'enums.dart';

class AppVersions extends Table {
  IntColumn get id => integer()();
  IntColumn get appVersion => integer()();
  IntColumn get dbVersion => integer()();
  TextColumn get dataType => textEnum<ContentType>()();
  TextColumn get status => textEnum<ContentStatus>()();
  TextColumn get name => text().withDefault(const Constant(''))();
  TextColumn get htmlNote => text().withDefault(const Constant(''))();
  TextColumn get extra => text().withDefault(const Constant('{}'))();
  DateTimeColumn get createdAt => dateTime().withDefault(currentDateAndTime)();

  @override
  Set<Column> get primaryKey => {id};
}
