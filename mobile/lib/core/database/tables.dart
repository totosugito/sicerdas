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

class Books extends Table {
  TextColumn get id => text()(); // UUID
  IntColumn get bookId => integer()();
  IntColumn get versionId => integer().references(AppVersions, #id)();
  
  TextColumn get title => text()();
  TextColumn get description => text().nullable()();
  TextColumn get author => text().nullable()();
  TextColumn get publishedYear => text()();
  IntColumn get totalPages => integer()();
  IntColumn get size => integer()();
  TextColumn get status => text()();
  
  // Stats (Denormalized for performance)
  RealColumn get rating => real().withDefault(const Constant(0.0))();
  IntColumn get viewCount => integer().withDefault(const Constant(0))();
  IntColumn get downloadCount => integer().withDefault(const Constant(0))();
  IntColumn get bookmarkCount => integer().withDefault(const Constant(0))();
  
  // Cover
  TextColumn get coverXs => text().withDefault(const Constant(''))();
  TextColumn get coverLg => text().withDefault(const Constant(''))();
  
  // Relations (Denormalized labels for fast display, IDs for filtering)
  IntColumn get categoryId => integer()();
  TextColumn get categoryName => text()();
  
  IntColumn get groupId => integer()();
  TextColumn get groupName => text()();
  TextColumn get groupShortName => text()();
  
  IntColumn get gradeId => integer()();
  TextColumn get gradeName => text()();
  TextColumn get gradeLabel => text()();

  @override
  Set<Column> get primaryKey => {id};
}
