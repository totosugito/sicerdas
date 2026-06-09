import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:bse/core/providers/settings_provider.dart';

// --- Periodic Table Theme ---

class PeriodicThemeNotifier extends Notifier<String> {
  static const _key = 'periodic_table_theme';

  @override
  String build() {
    final prefs = ref.watch(sharedPreferencesProvider);
    return prefs.getString(_key) ?? 'theme1';
  }

  void setTheme(String theme) {
    state = theme;
    ref.read(sharedPreferencesProvider).setString(_key, theme);
  }
}

final periodicThemeProvider = NotifierProvider<PeriodicThemeNotifier, String>(
  PeriodicThemeNotifier.new,
);

// --- Comparison Sort Settings ---

class ComparisonSortState {
  final String sortBy;
  final String sortDirection;

  const ComparisonSortState({
    this.sortBy = 'atomicWeight',
    this.sortDirection = 'auto',
  });

  ComparisonSortState copyWith({String? sortBy, String? sortDirection}) {
    return ComparisonSortState(
      sortBy: sortBy ?? this.sortBy,
      sortDirection: sortDirection ?? this.sortDirection,
    );
  }
}

class ComparisonSortNotifier extends Notifier<ComparisonSortState> {
  static const _sortByKey = 'comparison_sort_by';
  static const _sortDirectionKey = 'comparison_sort_direction';

  @override
  ComparisonSortState build() {
    final prefs = ref.watch(sharedPreferencesProvider);
    return ComparisonSortState(
      sortBy: prefs.getString(_sortByKey) ?? 'atomicWeight',
      sortDirection: prefs.getString(_sortDirectionKey) ?? 'auto',
    );
  }

  void setSortBy(String sortBy) {
    state = state.copyWith(sortBy: sortBy);
    ref.read(sharedPreferencesProvider).setString(_sortByKey, sortBy);
  }

  void setSortDirection(String direction) {
    state = state.copyWith(sortDirection: direction);
    ref.read(sharedPreferencesProvider).setString(_sortDirectionKey, direction);
  }

  void reset() {
    setSortBy('atomicWeight');
    setSortDirection('auto');
  }
}

final comparisonSortProvider =
    NotifierProvider<ComparisonSortNotifier, ComparisonSortState>(
      ComparisonSortNotifier.new,
    );
