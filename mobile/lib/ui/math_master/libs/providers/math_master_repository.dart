import 'dart:math';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:drift/drift.dart';
import '../../../../core/database/database.dart';
import '../../../../core/providers/database_provider.dart';

final mathMasterRepositoryProvider = Provider<MathMasterRepository>((ref) {
  return MathMasterRepository(ref.read(databaseProvider));
});

class MathMasterRepository {
  final AppDatabase _db;

  MathMasterRepository(this._db);

  String _generateUuid() {
    final random = Random();
    final hex = List.generate(256, (i) => i.toRadixString(16).padLeft(2, '0'));
    final buf = List<String>.generate(36, (i) => '');
    int r;
    
    for (int i = 0; i < 36; i++) {
      if (i == 8 || i == 13 || i == 18 || i == 23) {
        buf[i] = '-';
      } else if (i == 14) {
        buf[i] = '4';
      } else {
        r = random.nextInt(16);
        if (i == 19) {
          r = (r & 0x3) | 0x8;
        }
        buf[i] = hex[r];
      }
    }
    return buf.join();
  }

  // Save score log
  Future<void> saveScore({
    required String chapterKey,
    required int correctCount,
    required int wrongCount,
    required int elapsedSeconds,
  }) async {
    final companion = MathMasterScoresCompanion.insert(
      id: _generateUuid(),
      chapterKey: chapterKey,
      correctCount: correctCount,
      wrongCount: wrongCount,
      elapsedSeconds: elapsedSeconds,
      completedAt: DateTime.now(),
      isSynced: const Value(false),
    );
    await _db.into(_db.mathMasterScores).insert(companion);
  }

  // Get total scores grouped by chapter
  Future<Map<String, Map<String, int>>> getChapterSummary() async {
    final scores = await _db.select(_db.mathMasterScores).get();
    final Map<String, Map<String, int>> summary = {};
    for (final score in scores) {
      final key = score.chapterKey;
      if (!summary.containsKey(key)) {
        summary[key] = {'correct': 0, 'wrong': 0};
      }
      summary[key]!['correct'] = summary[key]!['correct']! + score.correctCount;
      summary[key]!['wrong'] = summary[key]!['wrong']! + score.wrongCount;
    }
    return summary;
  }

  // Get today's total scores
  Future<Map<String, int>> getTodayScores() async {
    final now = DateTime.now();
    final startOfDay = DateTime(now.year, now.month, now.day);
    final query = _db.select(_db.mathMasterScores)
      ..where((tbl) => tbl.completedAt.isBiggerOrEqualValue(startOfDay));
    
    final scores = await query.get();
    int correct = 0;
    int wrong = 0;
    for (final score in scores) {
      correct += score.correctCount;
      wrong += score.wrongCount;
    }
    return {'correct': correct, 'wrong': wrong};
  }

  // Get score history for chart (e.g. last 30 days)
  Future<List<MathMasterScore>> getRecentScores({int limit = 100}) async {
    final query = _db.select(_db.mathMasterScores)
      ..orderBy([
        (t) => OrderingTerm(expression: t.completedAt, mode: OrderingMode.desc)
      ])
      ..limit(limit);
    return query.get();
  }

  // Unsynced scores queue
  Future<List<MathMasterScore>> getUnsyncedScores() async {
    final query = _db.select(_db.mathMasterScores)
      ..where((tbl) => tbl.isSynced.equals(false));
    return query.get();
  }

  // Mark scores as synced
  Future<void> markAsSynced(List<String> ids) async {
    if (ids.isEmpty) return;
    final query = _db.update(_db.mathMasterScores)
      ..where((tbl) => tbl.id.isIn(ids));
    await query.write(const MathMasterScoresCompanion(isSynced: Value(true)));
  }
}
