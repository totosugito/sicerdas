import 'package:drift/drift.dart';
import 'words.dart';

class Favorites extends Table {
  IntColumn get id => integer().autoIncrement()();
  IntColumn get dictId => integer().references(Words, #dictId, onDelete: KeyAction.cascade)();
  IntColumn get mode => integer()();
}
