import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../database/database.dart';
import '../providers/database_provider.dart';
import '../providers/dio_provider.dart';
import '../providers/sync_provider.dart';
import '../network/api_endpoints.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:internet_connection_checker_plus/internet_connection_checker_plus.dart';
import '../models/app_settings.dart';
import '../providers/logger_provider.dart';

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
  static const String _settingsKey = 'app_settings';

  Future<void> resetDatabase() async {
    final prefs = await SharedPreferences.getInstance();
    
    // 1. Clear database
    await _db.clearAllData();
    
    // 2. Clear last check timestamp and settings
    await prefs.remove(_lastCheckKey);
    await prefs.remove(_settingsKey);
    
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
        final List<dynamic> versionsJson = data['versions'] ?? [];
        final List<dynamic> booksJson = data['books'] ?? [];
        final List<dynamic> gradesJson = data['grades'] ?? [];
        final List<dynamic> categoriesJson = data['categories'] ?? [];
        final List<dynamic> groupsJson = data['groups'] ?? [];
        final settings = data['settings'];
        
        int addedCount = 0;

        // 1. Save settings to preferences
        if (settings != null) {
          try {
            final appSettings = AppSettings.fromJson(settings as Map<String, dynamic>);
            await prefs.setString(_settingsKey, jsonEncode(appSettings.toJson()));
          } catch (e, stack) {
            _ref.read(loggerProvider).e('Failed to parse app settings', error: e, stackTrace: stack);
          }
        }

        // 2. Save metadata tables
        if (gradesJson.isNotEmpty) {
          await _db.upsertGrades(gradesJson.map((g) => EducationGrade(
            id: g['id'],
            grade: g['grade'],
            name: g['name'],
            desc: g['desc'],
          )).toList());
        }

        if (categoriesJson.isNotEmpty) {
          await _db.upsertCategories(categoriesJson.map((c) => Category(
            id: c['id'],
            name: c['name'],
            key: c['key'],
            description: c['description'],
          )).toList());
        }

        if (groupsJson.isNotEmpty) {
          await _db.upsertGroups(groupsJson.map((g) => BookGroup(
            id: g['id'],
            versionId: g['versionId'],
            categoryId: g['categoryId'],
            name: g['name'],
            shortName: g['shortName'],
            desc: g['desc'],
            bookTotal: g['bookTotal'],
          )).toList());
        }

        if (versionsJson.isNotEmpty || booksJson.isNotEmpty) {
          // 3. Save all version logs
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

          // 4. Upsert all books returned in the delta
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
              bookGroupId: b['bookGroupId'],
              educationGradeId: b['educationGradeId'],
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
