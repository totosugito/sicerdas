import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:bse/core/database/dictionary_database.dart';
import 'dictionary_db_provider.dart';
export 'dictionary_db_provider.dart';

class DictionarySearchQueryNotifier extends Notifier<String> {
  @override
  String build() => '';

  @override
  set state(String value) => super.state = value;
}

final dictionarySearchQueryProvider = NotifierProvider<DictionarySearchQueryNotifier, String>(
  DictionarySearchQueryNotifier.new,
);

class DictionaryIsSwapNotifier extends Notifier<bool> {
  @override
  bool build() => false;

  void toggle() => state = !state;
  void setSwap(bool value) => state = value;
}

final dictionaryIsSwapProvider = NotifierProvider<DictionaryIsSwapNotifier, bool>(DictionaryIsSwapNotifier.new);

class DictionaryFavoritesOnlyNotifier extends Notifier<bool> {
  @override
  bool build() => false;

  void toggle() => state = !state;
}

final dictionaryFavoritesOnlyProvider = NotifierProvider<DictionaryFavoritesOnlyNotifier, bool>(
  DictionaryFavoritesOnlyNotifier.new,
);

class DictionaryResultsNotifier extends Notifier<AsyncValue<List<Word>>> {
  int _currentPage = 0;
  final int _pageSize = 50;
  bool _hasMore = true;
  bool _isLoadingMore = false;
  final List<Word> _loadedWords = [];

  @override
  AsyncValue<List<Word>> build() {
    final db = ref.watch(dictionaryDatabaseProvider);
    final query = ref.watch(dictionarySearchQueryProvider);
    final isSwap = ref.watch(dictionaryIsSwapProvider);
    final favoritesOnly = ref.watch(dictionaryFavoritesOnlyProvider);

    _currentPage = 0;
    _hasMore = true;
    _isLoadingMore = false;
    _loadedWords.clear();

    if (db != null) {
      _fetchPage(db, query, isSwap, favoritesOnly);
      return const AsyncValue.loading();
    } else {
      return const AsyncValue.data([]);
    }
  }

  Future<void> _fetchPage(DictionaryDatabase db, String query, bool isSwap, bool favoritesOnly) async {
    try {
      List<Word> newWords;
      if (favoritesOnly) {
        newWords = await db.getFavoriteWords(isSwap);
        _hasMore = false;
      } else {
        newWords = await db.searchWords(
          query,
          isSwap,
          limit: _pageSize,
          offset: _currentPage * _pageSize,
        );
        _hasMore = newWords.length == _pageSize;
      }

      if (ref.read(dictionaryDatabaseProvider) != db) return;

      _loadedWords.addAll(newWords);
      state = AsyncValue.data(List.from(_loadedWords));
    } catch (e, stack) {
      if (ref.read(dictionaryDatabaseProvider) != db) return;
      state = AsyncValue.error(e, stack);
    }
  }

  Future<void> loadNextPage() async {
    if (!_hasMore || _isLoadingMore || state.isLoading) return;

    final db = ref.read(dictionaryDatabaseProvider);
    if (db == null) return;

    _isLoadingMore = true;
    _currentPage++;

    final query = ref.read(dictionarySearchQueryProvider);
    final isSwap = ref.read(dictionaryIsSwapProvider);

    try {
      final newWords = await db.searchWords(
        query,
        isSwap,
        limit: _pageSize,
        offset: _currentPage * _pageSize,
      );
      
      if (ref.read(dictionaryDatabaseProvider) != db) return;

      _hasMore = newWords.length == _pageSize;
      _loadedWords.addAll(newWords);
      state = AsyncValue.data(List.from(_loadedWords));
    } catch (e) {
      // Keep existing data on page fetch error
    } finally {
      _isLoadingMore = false;
    }
  }
}

final dictionaryResultsProvider = NotifierProvider<DictionaryResultsNotifier, AsyncValue<List<Word>>>(
  DictionaryResultsNotifier.new,
);

final wordFavoriteStateProvider = FutureProvider.family<bool, int>((ref, dictId) async {
  final db = ref.watch(dictionaryDatabaseProvider);
  if (db == null) return false;
  return db.isFavorite(dictId);
});
