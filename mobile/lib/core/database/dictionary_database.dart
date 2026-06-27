import 'package:drift/drift.dart';
import 'tables.dart';

part 'dictionary_database.g.dart';

@DriftDatabase(tables: [Words, Favorites, WordsFts])
class DictionaryDatabase extends _$DictionaryDatabase {
  DictionaryDatabase(super.e) {
    driftRuntimeOptions.dontWarnAboutMultipleDatabases = true;
  }

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

  Future<List<Word>> getWordsByIds(List<int> dictIds) async {
    if (dictIds.isEmpty) return [];
    return (select(words)..where((t) => t.dictId.isIn(dictIds))).get();
  }

  Future<Word?> getWordByExactText(String text, bool isSwap) async {
    return (select(words)
          ..where((t) => t.word.equals(text) & t.dictSwap.equals(isSwap)))
        .getSingleOrNull();
  }
}
