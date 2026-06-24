import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../database/database.dart';
import '../database/dictionary_database.dart';

final databaseProvider = Provider<AppDatabase>((ref) {
  final db = AppDatabase();
  ref.onDispose(db.close);
  return db;
});

final dictionaryDatabaseProvider = Provider<DictionaryDatabase>((ref) {
  final db = DictionaryDatabase();
  ref.onDispose(db.close);
  return db;
});

