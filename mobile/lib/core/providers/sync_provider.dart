import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'database_provider.dart';

enum SyncStatus { idle, syncing, success, error }

class SyncState {
  final SyncStatus status;
  final String? errorKey;
  final bool isInitialSync;
  final int booksAdded;
  final bool hasCheckedInitial;

  SyncState({
    required this.status,
    this.errorKey,
    required this.isInitialSync,
    this.booksAdded = 0,
    this.hasCheckedInitial = false,
  });

  SyncState copyWith({
    SyncStatus? status,
    String? errorKey,
    bool? isInitialSync,
    int? booksAdded,
    bool? hasCheckedInitial,
  }) {
    return SyncState(
      status: status ?? this.status,
      errorKey: errorKey ?? this.errorKey,
      isInitialSync: isInitialSync ?? this.isInitialSync,
      booksAdded: booksAdded ?? this.booksAdded,
      hasCheckedInitial: hasCheckedInitial ?? this.hasCheckedInitial,
    );
  }
}

class SyncNotifier extends Notifier<SyncState> {
  @override
  SyncState build() {
    return SyncState(
      status: SyncStatus.idle,
      isInitialSync: false,
      hasCheckedInitial: false,
    );
  }

  Future<void> checkInitial() async {
    if (state.hasCheckedInitial) return;
    final db = ref.read(databaseProvider);
    final version = await db.getGlobalLatestDbVersion();
    if (version == 0) {
      state = state.copyWith(isInitialSync: true, hasCheckedInitial: true);
    } else {
      state = state.copyWith(isInitialSync: false, hasCheckedInitial: true);
    }
  }

  void setSyncing(bool isInitial) {
    state = state.copyWith(
      status: SyncStatus.syncing,
      isInitialSync: isInitial,
      booksAdded: 0,
    );
  }

  void setSuccess(int addedCount) {
    state = state.copyWith(status: SyncStatus.success, booksAdded: addedCount);
  }

  void setError(String l10nKey) {
    state = state.copyWith(status: SyncStatus.error, errorKey: l10nKey);
  }

  void reset() {
    state = SyncState(
      status: SyncStatus.idle,
      isInitialSync: false,
      hasCheckedInitial: false,
    );
  }
}

final syncProvider = NotifierProvider<SyncNotifier, SyncState>(SyncNotifier.new);
