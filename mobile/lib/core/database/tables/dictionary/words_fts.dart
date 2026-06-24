import 'package:drift/drift.dart';

class WordsFts extends Table {
  TextColumn get word => text()();
  TextColumn get meaning => text()();

  @override
  String get tableName => 'words_fts';
}
