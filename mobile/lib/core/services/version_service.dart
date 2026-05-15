import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../database/database.dart';
import '../providers/database_provider.dart';
import '../providers/dio_provider.dart';
import '../providers/sync_provider.dart';
import '../network/api_endpoints.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:internet_connection_checker_plus/internet_connection_checker_plus.dart';

final versionServiceProvider = Provider<VersionService>((ref) {
  final dio = ref.watch(dioProvider);
  final db = ref.watch(databaseProvider);
  return VersionService(dio, db, ref);
});

class VersionService {
  final Dio _dio;
  final AppDatabase _db;
  final Ref _ref;

  VersionService(this._dio, this._db, this._ref);

  static const String _lastCheckKey = 'last_version_check_timestamp';

  Future<void> resetDatabase() async {
    final prefs = await SharedPreferences.getInstance();
    
    // 1. Clear database
    await _db.clearAllData();
    
    // 2. Clear last check timestamp
    await prefs.remove(_lastCheckKey);
    
    // 3. Reset sync state to trigger the onboarding overlay
    _ref.read(syncProvider.notifier).reset();
    await _ref.read(syncProvider.notifier).checkInitial();
  }

  Future<void> checkAndSync({bool force = false}) async {
    final prefs = await SharedPreferences.getInstance();
    final lastCheck = prefs.getInt(_lastCheckKey) ?? 0;
    final now = DateTime.now().millisecondsSinceEpoch;
    
    final currentDbVersion = await _db.getGlobalLatestDbVersion();
    final isInitialSync = currentDbVersion == 0;

    if (!force && !isInitialSync && (now - lastCheck < 86400000)) {
      return;
    }

    _ref.read(syncProvider.notifier).setSyncing(isInitialSync);

    try {
      bool hasConnection = await InternetConnection().hasInternetAccess;
      if (!hasConnection) {
        if (isInitialSync) {
          _ref.read(syncProvider.notifier).setError('syncInternetRequiredMessage');
        } else {
          _ref.read(syncProvider.notifier).reset();
        }
        return;
      }

      final response = await _dio.post(ApiEndpoints.appLatest, data: {
        'dbVersion': currentDbVersion,
      });

      if (response.data['success'] == true) {
        final data = response.data['data'];
        final List<dynamic> versionsJson = data['versions'];
        final List<dynamic> booksJson = data['books'];
        int addedCount = 0;

        if (versionsJson.isNotEmpty || booksJson.isNotEmpty) {
          // 1. Save all version logs
          for (var vJson in versionsJson) {
            await _db.upsertVersion(AppVersion(
              id: vJson['id'],
              appVersion: vJson['appVersion'],
              dbVersion: vJson['dbVersion'],
              dataType: vJson['dataType'],
              status: vJson['status'],
              name: vJson['name'] ?? '',
              htmlNote: vJson['htmlNote'] ?? '',
              extra: (vJson['extra'] ?? {}).toString(), 
              createdAt: vJson['createdAt'] != null 
                  ? DateTime.parse(vJson['createdAt']) 
                  : DateTime.now(), 
            ));
          }

          // 2. Upsert all books returned in the delta
          if (booksJson.isNotEmpty) {
            final List<Book> newBooks = booksJson.map((b) => Book(
              id: b['id'],
              bookId: b['bookId'],
              versionId: b['versionId'], 
              title: b['title'],
              description: b['description'],
              author: b['author'],
              publishedYear: b['publishedYear'],
              totalPages: b['totalPages'] ?? 0,
              size: b['size'] ?? 0,
              status: b['status'],
              rating: (b['rating'] as num?)?.toDouble() ?? 0.0,
              viewCount: b['viewCount'] ?? 0,
              downloadCount: b['downloadCount'] ?? 0,
              bookmarkCount: b['bookmarkCount'] ?? 0,
              coverXs: (b['cover']?['xs']) ?? '',
              coverLg: (b['cover']?['lg']) ?? '',
              categoryId: b['category']['id'],
              categoryName: b['category']['name'],
              groupId: b['group']['id'],
              groupName: b['group']['name'],
              groupShortName: b['group']['shortName'],
              gradeId: b['grade']['id'],
              gradeName: b['grade']['name'],
              gradeLabel: b['grade']['grade'],
            )).toList();

            await _db.upsertBooks(newBooks);
            addedCount = newBooks.length;
          }
        }

        await prefs.setInt(_lastCheckKey, now);
        _ref.read(syncProvider.notifier).setSuccess(addedCount);

      }
    } catch (e) {
      if (isInitialSync) {
        _ref.read(syncProvider.notifier).setError('syncFailedMessage');
      } else {
        _ref.read(syncProvider.notifier).reset();
      }
    }
  }
}
