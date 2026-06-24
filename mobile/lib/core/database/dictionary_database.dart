import 'dart:io';
import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:flutter/services.dart' show rootBundle;
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;
import 'tables.dart';

part 'dictionary_database.g.dart';

@DriftDatabase(tables: [Words, Favorites, WordsFts])
class DictionaryDatabase extends _$DictionaryDatabase {
  DictionaryDatabase() : super(_openConnection());

  @override
  int get schemaVersion => 1;

  // --- Dictionary Query Helpers ---

  Future<List<Word>> searchWords(
    String query,
    bool isSwap, {
    int limit = 50,
    int offset = 0,
  }) async {
    final trimmed = query.trim();
    if (trimmed.isEmpty) {
      // Return default first entries for the direction
      return (select(words)
            ..where((t) => t.dictSwap.equals(isSwap))
            ..limit(limit, offset: offset))
          .get();
    }

    // Escape query and append '*' for prefix search (useful for auto-complete search)
    final escapedQuery = trimmed.replaceAll('"', '""');
    final ftsQuery = '"$escapedQuery"*';

    final rows = await customSelect(
      'SELECT w.* FROM words w JOIN words_fts f ON w.dict_id = f.rowid WHERE f.word MATCH ? AND w.dict_swap = ? LIMIT ? OFFSET ?',
      variables: [
        Variable.withString(ftsQuery),
        Variable.withBool(isSwap),
        Variable.withInt(limit),
        Variable.withInt(offset),
      ],
      readsFrom: {words, wordsFts},
    ).get();

    return rows.map((row) => words.map(row.data)).toList();
  }

  // --- Favorite Helpers ---

  Future<bool> isFavorite(int dictId) async {
    final query = select(favorites)..where((t) => t.dictId.equals(dictId));
    final result = await query.getSingleOrNull();
    return result != null;
  }

  Future<void> addFavorite(int dictId, int mode) async {
    await into(favorites).insert(
      FavoritesCompanion.insert(dictId: dictId, mode: mode),
      mode: InsertMode.insertOrReplace,
    );
  }

  Future<void> removeFavorite(int dictId) async {
    await (delete(favorites)..where((t) => t.dictId.equals(dictId))).go();
  }

  Future<List<Word>> getFavoriteWords(bool isSwap) async {
    final query = select(words).join([
      innerJoin(favorites, favorites.dictId.equalsExp(words.dictId)),
    ])..where(words.dictSwap.equals(isSwap));

    final rows = await query.get();
    return rows.map((row) => row.readTable(words)).toList();
  }
}

LazyDatabase _openConnection() {
  return LazyDatabase(() async {
    final dbFolder = await getApplicationDocumentsDirectory();
    final file = File(p.join(dbFolder.path, 'dictionary.sqlite'));

    if (!await file.exists()) {
      // Ensure the directory exists
      await file.parent.create(recursive: true);
      // Copy database from asset to documents directory
      final data = await rootBundle.load(
        'assets/dictionary/003_id_en_01_50F2.db',
      );
      final bytes = data.buffer.asUint8List(
        data.offsetInBytes,
        data.lengthInBytes,
      );
      await file.writeAsBytes(bytes);
    }

    return NativeDatabase.createInBackground(file);
  });
}
