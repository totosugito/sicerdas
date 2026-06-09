import 'dart:convert';
import 'dart:io';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';
import 'package:archive/archive.dart';
import 'package:bse/core/database/database.dart';
import 'package:bse/core/providers/database_provider.dart';
import 'package:bse/core/config/app_constants.dart';

enum PeriodicSyncStatus { checking, notDownloaded, downloading, success, error }

class PeriodicSyncState {
  final PeriodicSyncStatus status;
  final String? errorMessage;
  final String? errorKey;
  final List<PeriodicElement> elements;

  PeriodicSyncState({
    required this.status,
    this.errorMessage,
    this.errorKey,
    this.elements = const [],
  });

  PeriodicSyncState copyWith({
    PeriodicSyncStatus? status,
    String? errorMessage,
    String? errorKey,
    List<PeriodicElement>? elements,
  }) {
    return PeriodicSyncState(
      status: status ?? this.status,
      errorMessage: errorMessage ?? this.errorMessage,
      errorKey: errorKey ?? this.errorKey,
      elements: elements ?? this.elements,
    );
  }
}

class PeriodicSyncNotifier extends Notifier<PeriodicSyncState> {
  @override
  PeriodicSyncState build() {
    Future.microtask(() => checkInitial());
    return PeriodicSyncState(status: PeriodicSyncStatus.checking);
  }

  Future<void> checkInitial() async {
    state = PeriodicSyncState(status: PeriodicSyncStatus.checking);
    try {
      final db = ref.read(databaseProvider);
      final hasData = await db.hasPeriodicTableData();
      if (hasData) {
        final elements = await db.getPeriodicElements();
        state = PeriodicSyncState(
          status: PeriodicSyncStatus.success,
          elements: elements,
        );
      } else {
        state = PeriodicSyncState(status: PeriodicSyncStatus.notDownloaded);
      }
    } catch (e) {
      state = PeriodicSyncState(
        status: PeriodicSyncStatus.error,
        errorMessage: e.toString(),
        errorKey: 'syncFailedMessage',
      );
    }
  }

  void setSyncError() {
    state = state.copyWith(
      status: PeriodicSyncStatus.error,
      errorKey: 'syncFailedMessage',
    );
  }

  void setSyncNotDownloaded() {
    state = state.copyWith(status: PeriodicSyncStatus.notDownloaded);
  }

  Future<void> processDownloadedZip(String zipPath) async {
    state = state.copyWith(status: PeriodicSyncStatus.downloading);
    final tempZipFile = File(zipPath);
    try {
      final db = ref.read(databaseProvider);

      final bytes = await tempZipFile.readAsBytes();
      if (bytes.isEmpty) {
        state = state.copyWith(
          status: PeriodicSyncStatus.error,
          errorKey: 'periodicErrorEmptyZip',
          errorMessage: 'Empty ZIP archive downloaded.',
        );
        return;
      }

      // 2. Decode the ZIP archive
      final archive = ZipDecoder().decodeBytes(bytes);

      // 3. Locate and parse periodic-table.json in-memory
      dynamic parsedJson;
      for (final file in archive) {
        if (file.isFile && file.name == 'periodic-table.json') {
          final contentString = utf8.decode(file.content as List<int>);
          parsedJson = jsonDecode(contentString);
          break;
        }
      }

      if (parsedJson == null) {
        state = state.copyWith(
          status: PeriodicSyncStatus.error,
          errorKey: 'periodicErrorJsonNotFound',
          errorMessage: 'periodic-table.json not found in ZIP archive.',
        );
        return;
      }

      final data = parsedJson['data'];
      final List<dynamic> elementsJson = data['elements'] ?? [];
      final List<dynamic> notesJson = data['notes'] ?? [];

      final List<PeriodicElement> elements = elementsJson.map((e) {
        return PeriodicElement(
          id: e['id'] as int,
          idx: e['idx'] as int,
          idy: e['idy'] as int,
          atomicNumber: e['atomicNumber'] as int,
          atomicGroup: e['atomicGroup'] as String,
          atomicName: e['atomicName'] as String,
          atomicSymbol: e['atomicSymbol'] as String,
          atomicImages: jsonEncode(e['atomicImages'] ?? {}),
          atomicProperties: jsonEncode(e['atomicProperties'] ?? {}),
          atomicIsotope: jsonEncode(e['atomicIsotope'] ?? {}),
          atomicExtra: jsonEncode(e['atomicExtra'] ?? {}),
        );
      }).toList();

      final List<PeriodicElementNote> notes = notesJson.map((n) {
        return PeriodicElementNote(
          id: n['id'] as int,
          atomicNumber: n['atomicNumber'] as int,
          localeCode: n['localeCode'] as String,
          atomicOverview: n['atomicOverview'] as String,
          atomicHistory: n['atomicHistory'] as String,
          atomicApps: n['atomicApps'] as String,
          atomicFacts: n['atomicFacts'] as String,
        );
      }).toList();

      // 4. Save other files into the appDirPeriodic directory
      final dataDir = await getExternalStorageDirectory();
      if (dataDir == null) {
        state = state.copyWith(
          status: PeriodicSyncStatus.error,
          errorKey: 'periodicErrorStorageNotFound',
          errorMessage: 'External storage directory not found.',
        );
        return;
      }
      final targetPath = p.join(
        dataDir.path,
        AppConstants.appDirParent,
        AppConstants.appDirPeriodic,
      );

      for (final file in archive) {
        if (file.isFile && file.name != 'periodic-table.json') {
          final filePath = p.join(targetPath, file.name);
          final outFile = File(filePath);
          await outFile.create(recursive: true);
          await outFile.writeAsBytes(file.content as List<int>);
        }
      }

      // 5. Upsert database entries
      await db.upsertPeriodicElements(elements);
      await db.upsertPeriodicElementNotes(notes);

      final sortedElements = await db.getPeriodicElements();

      state = PeriodicSyncState(
        status: PeriodicSyncStatus.success,
        elements: sortedElements,
      );
    } catch (e) {
      state = state.copyWith(
        status: PeriodicSyncStatus.error,
        errorMessage: e.toString(),
        errorKey: 'syncFailedMessage',
      );
    } finally {
      try {
        if (await tempZipFile.exists()) {
          await tempZipFile.delete();
        }
      } catch (_) {}
    }
  }
}

final periodicSyncProvider =
    NotifierProvider<PeriodicSyncNotifier, PeriodicSyncState>(
      PeriodicSyncNotifier.new,
    );
