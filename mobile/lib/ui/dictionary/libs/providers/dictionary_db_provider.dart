import 'dart:io';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;
import 'package:drift/native.dart';
import 'package:bse/core/providers/settings_provider.dart';
import 'package:bse/core/config/app_constants.dart';
import 'package:bse/core/database/dictionary_database.dart';

Future<Directory> getKamusDirectory() async {
  final dataDir = await getApplicationDocumentsDirectory();
  final kamusDir = Directory(
    p.join(dataDir.path, AppConstants.appDirParent, AppConstants.appDirKamus),
  );
  if (!await kamusDir.exists()) {
    await kamusDir.create(recursive: true);
  }
  return kamusDir;
}

class ActiveDictionaryDbNotifier extends AsyncNotifier<String?> {
  static const _activeDbKey = 'active_dictionary_db';

  @override
  Future<String?> build() async {
    final prefs = ref.watch(sharedPreferencesProvider);
    final savedDbName = prefs.getString(_activeDbKey);
    final kamusDir = await getKamusDirectory();

    if (savedDbName != null) {
      final file = File(p.join(kamusDir.path, savedDbName));
      if (await file.exists()) {
        return file.path;
      }
    }

    // Fallback: search for any .db file in Kamus directory
    try {
      if (await kamusDir.exists()) {
        final files = kamusDir.listSync();
        for (final entity in files) {
          if (entity is File && entity.path.endsWith('.db')) {
            await prefs.setString(_activeDbKey, p.basename(entity.path));
            return entity.path;
          }
        }
      }
    } catch (_) {}

    return null;
  }

  Future<void> setActiveDb(String dbName) async {
    final prefs = ref.read(sharedPreferencesProvider);
    final currentDbName = prefs.getString(_activeDbKey);
    if (currentDbName == dbName && state.hasValue && state.value != null) {
      return;
    }
    await prefs.setString(_activeDbKey, dbName);
    ref.invalidateSelf();
  }

  Future<void> clearActiveDb() async {
    final prefs = ref.read(sharedPreferencesProvider);
    await prefs.remove(_activeDbKey);
    ref.invalidateSelf();
  }
}

final activeDictionaryDbProvider =
    AsyncNotifierProvider<ActiveDictionaryDbNotifier, String?>(
      ActiveDictionaryDbNotifier.new,
    );

final dictionaryDatabaseProvider = Provider<DictionaryDatabase?>((ref) {
  final activeDbVal = ref.watch(activeDictionaryDbProvider);
  return activeDbVal.maybeWhen(
    data: (dbPath) {
      if (dbPath == null) return null;
      final file = File(dbPath);
      if (!file.existsSync()) return null;
      final db = DictionaryDatabase(NativeDatabase.createInBackground(file));
      ref.onDispose(() async {
        await db.close();
      });
      return db;
    },
    orElse: () => null,
  );
});
