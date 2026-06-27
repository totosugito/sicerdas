import 'dart:io';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:path/path.dart' as p;
import 'package:dio/dio.dart';
import 'package:archive/archive.dart';
import 'package:bse/core/providers/dio_provider.dart';
import 'dictionary_providers.dart';
import 'package:bse/core/network/api_endpoints.dart';
import '../model/dictionary_package.dart';

final localDownloadedDbFilesProvider = FutureProvider<List<String>>((
  ref,
) async {
  final kamusDir = await getKamusDirectory();
  if (!await kamusDir.exists()) return [];
  final files = kamusDir.listSync();
  final List<String> downloaded = [];
  for (final entity in files) {
    if (entity is File && entity.path.endsWith('.db')) {
      downloaded.add(p.basename(entity.path));
    }
  }
  return downloaded;
});

final dictionaryPackagesProvider = FutureProvider<List<DictionaryPackage>>((
  ref,
) async {
  final dio = ref.watch(dioProvider);
  final response = await dio.get(ApiEndpoints.dictionaryData);
  if (response.data != null && response.data['success'] == true) {
    final list = response.data['data'] as List;
    return list.map((e) => DictionaryPackage.fromJson(e)).toList();
  }
  throw Exception('Failed to load dictionary packages');
});

class DictionaryDownloadProgressNotifier extends Notifier<Map<String, double>> {
  @override
  Map<String, double> build() => {};

  void setProgress(String packName, double progress) {
    state = {...state, packName: progress};
  }

  void clearProgress(String packName) {
    final next = Map<String, double>.from(state);
    next.remove(packName);
    state = next;
  }
}

final dictionaryDownloadProgressProvider =
    NotifierProvider<DictionaryDownloadProgressNotifier, Map<String, double>>(
      DictionaryDownloadProgressNotifier.new,
    );

class DictionaryCancelTokensNotifier
    extends Notifier<Map<String, CancelToken>> {
  @override
  Map<String, CancelToken> build() => {};

  void setToken(String packName, CancelToken token) {
    state = {...state, packName: token};
  }

  void removeToken(String packName) {
    final next = Map<String, CancelToken>.from(state);
    next.remove(packName);
    state = next;
  }
}

final dictionaryCancelTokensProvider =
    NotifierProvider<DictionaryCancelTokensNotifier, Map<String, CancelToken>>(
      DictionaryCancelTokensNotifier.new,
    );

class DictionaryPackageManager {
  final Ref ref;

  DictionaryPackageManager(this.ref);

  Future<void> downloadAndExtract(DictionaryPackage package) async {
    final dio = ref.read(dioProvider);
    final kamusDir = await getKamusDirectory();
    final tempZipPath = p.join(kamusDir.path, '${package.packName}.zip');

    final cancelToken = CancelToken();
    ref
        .read(dictionaryCancelTokensProvider.notifier)
        .setToken(package.packName, cancelToken);

    try {
      // 1. Download the zip file
      await dio.download(
        package.packUrl,
        tempZipPath,
        cancelToken: cancelToken,
        onReceiveProgress: (received, total) {
          if (total > 0) {
            final progress = received / total;
            ref
                .read(dictionaryDownloadProgressProvider.notifier)
                .setProgress(package.packName, progress);
          }
        },
      );

      // 2. Extract zip file
      final bytes = File(tempZipPath).readAsBytesSync();
      final archive = ZipDecoder().decodeBytes(bytes);
      for (final file in archive) {
        if (file.isFile) {
          final data = file.content as List<int>;
          final outFile = File(p.join(kamusDir.path, file.name));
          await outFile.writeAsBytes(data);
        }
      }

      // 3. Set as active DB if none is currently active
      final activeDb = await ref.read(activeDictionaryDbProvider.future);
      if (activeDb == null) {
        final dbFilename = '${package.packName}.db';
        await ref
            .read(activeDictionaryDbProvider.notifier)
            .setActiveDb(dbFilename);
      }
    } on DioException catch (e) {
      if (CancelToken.isCancel(e)) {
        // Download was cancelled by the user
        return;
      }
      rethrow;
    } finally {
      ref
          .read(dictionaryCancelTokensProvider.notifier)
          .removeToken(package.packName);

      // 4. Cleanup zip file
      try {
        final zipFile = File(tempZipPath);
        if (await zipFile.exists()) {
          await zipFile.delete();
        }
      } catch (_) {
        // Silently ignore or log cleanup errors
      }
      ref
          .read(dictionaryDownloadProgressProvider.notifier)
          .clearProgress(package.packName);
      ref.invalidate(localDownloadedDbFilesProvider);
    }
  }

  void cancelDownload(String packName) {
    final tokens = ref.read(dictionaryCancelTokensProvider);
    final token = tokens[packName];
    if (token != null) {
      token.cancel();
    }
  }

  Future<void> deletePackage(DictionaryPackage package) async {
    final kamusDir = await getKamusDirectory();
    final dbFilename = '${package.packName}.db';
    final dbPath = p.join(kamusDir.path, dbFilename);
    final dbFile = File(dbPath);

    // 1. Check if it is the currently active database
    final activePath = await ref.read(activeDictionaryDbProvider.future);
    if (activePath != null && p.basename(activePath) == dbFilename) {
      await ref.read(activeDictionaryDbProvider.notifier).clearActiveDb();
    }

    // 2. Delete file
    if (await dbFile.exists()) {
      await dbFile.delete();
    }

    ref.invalidate(localDownloadedDbFilesProvider);
  }
}

final dictionaryPackageManagerProvider = Provider<DictionaryPackageManager>((
  ref,
) {
  return DictionaryPackageManager(ref);
});
