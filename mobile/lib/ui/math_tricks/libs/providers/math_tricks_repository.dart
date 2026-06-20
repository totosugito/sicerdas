import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:drift/drift.dart';
import '../../../../core/database/database.dart';
import '../../../../core/providers/database_provider.dart';

final mathTricksRepositoryProvider = Provider<MathTricksRepository>((ref) {
  return MathTricksRepository(ref.read(databaseProvider));
});

final mathTricksChaptersStreamProvider = StreamProvider<List<MathTrickChapter>>((ref) {
  final repo = ref.watch(mathTricksRepositoryProvider);
  return repo.watchAllChapters();
});

class MathTricksRepository {
  final AppDatabase _db;

  MathTricksRepository(this._db);

  Stream<List<MathTrickChapter>> watchAllChapters() {
    return _db.select(_db.mathTrickChapters).watch();
  }

  Future<List<MathTrickChapter>> getAllChapters() async {
    return _db.select(_db.mathTrickChapters).get();
  }

  // --- Chapter Progress ---

  Future<MathTrickChapter> getOrCreateChapter(String groupKey, String chapterKey) async {
    final existing = await (_db.select(_db.mathTrickChapters)
          ..where((tbl) => tbl.chapterKey.equals(chapterKey))
          ..limit(1))
        .getSingleOrNull();

    if (existing != null) {
      return existing;
    }

    final companion = MathTrickChaptersCompanion.insert(
      groupKey: groupKey,
      chapterKey: chapterKey,
      correct: const Value(0),
      wrong: const Value(0),
      opened: const Value(1), // First level is unlocked by default
    );

    final id = await _db.into(_db.mathTrickChapters).insert(companion);
    return (_db.select(_db.mathTrickChapters)..where((tbl) => tbl.id.equals(id))).getSingle();
  }

  Future<void> updateChapterProgress(String chapterKey, int correctIncrement, int wrongIncrement) async {
    final chapter = await getOrCreateChapter('', chapterKey);
    final solvedCount = await getSolvedLevelsCount(chapterKey);

    await (_db.update(_db.mathTrickChapters)
          ..where((tbl) => tbl.chapterKey.equals(chapterKey)))
        .write(
      MathTrickChaptersCompanion(
        correct: Value(chapter.correct + correctIncrement),
        wrong: Value(chapter.wrong + wrongIncrement),
        opened: Value(solvedCount + 1),
      ),
    );
  }

  // --- Level Progress ---

  Future<MathTrickLevel> getOrCreateLevel(String chapterKey, int levelId) async {
    final existing = await (_db.select(_db.mathTrickLevels)
          ..where((tbl) => tbl.chapterKey.equals(chapterKey) & tbl.levelId.equals(levelId))
          ..limit(1))
        .getSingleOrNull();

    if (existing != null) {
      return existing;
    }

    final companion = MathTrickLevelsCompanion.insert(
      chapterKey: chapterKey,
      levelId: levelId,
      star: const Value(0),
      time: const Value(0),
      score: const Value(0),
      correct: const Value(0),
      wrong: const Value(0),
    );

    final id = await _db.into(_db.mathTrickLevels).insert(companion);
    return (_db.select(_db.mathTrickLevels)..where((tbl) => tbl.id.equals(id))).getSingle();
  }

  Future<List<MathTrickLevel>> getLevelsForChapter(String chapterKey) async {
    return (_db.select(_db.mathTrickLevels)
          ..where((tbl) => tbl.chapterKey.equals(chapterKey))
          ..orderBy([(tbl) => OrderingTerm(expression: tbl.levelId)]))
        .get();
  }

  Future<int> getSolvedLevelsCount(String chapterKey) async {
    final query = _db.select(_db.mathTrickLevels)
      ..where((tbl) => tbl.chapterKey.equals(chapterKey) & tbl.star.isBiggerThan(const Constant(0)));
    final results = await query.get();
    return results.length;
  }

  Future<void> saveLevelResult(
    String chapterKey,
    int levelId,
    int correct,
    int wrong,
    int score,
    int time,
    int star,
  ) async {
    final level = await getOrCreateLevel(chapterKey, levelId);

    // Save only if star rating or score is better
    if (star > level.star || score > level.score) {
      await (_db.update(_db.mathTrickLevels)
            ..where((tbl) => tbl.chapterKey.equals(chapterKey) & tbl.levelId.equals(levelId)))
          .write(
        MathTrickLevelsCompanion(
          star: Value(star),
          score: Value(score),
          time: Value(time),
          correct: Value(correct),
          wrong: Value(wrong),
        ),
      );
    }

    // Update parent chapter progress
    await updateChapterProgress(chapterKey, correct, wrong);
  }

  // --- Daily Scores (History) ---

  int _createDateId(DateTime date) {
    return date.year * 10000 + date.month * 100 + date.day;
  }

  Future<MathTrickDailyScore> getOrCreateDailyScore(DateTime date) async {
    final dateId = _createDateId(date);
    final existing = await (_db.select(_db.mathTrickDailyScores)
          ..where((tbl) => tbl.dateId.equals(dateId))
          ..limit(1))
        .getSingleOrNull();

    if (existing != null) {
      return existing;
    }

    final companion = MathTrickDailyScoresCompanion.insert(
      dateId: dateId,
      updatedAt: date.millisecondsSinceEpoch,
      correctAnswer: const Value(0),
      wrongAnswer: const Value(0),
    );

    final id = await _db.into(_db.mathTrickDailyScores).insert(companion);
    return (_db.select(_db.mathTrickDailyScores)..where((tbl) => tbl.id.equals(id))).getSingle();
  }

  Future<void> addDailyScore(DateTime date, int correct, int wrong) async {
    final daily = await getOrCreateDailyScore(date);
    final dateId = _createDateId(date);

    await (_db.update(_db.mathTrickDailyScores)..where((tbl) => tbl.dateId.equals(dateId))).write(
      MathTrickDailyScoresCompanion(
        correctAnswer: Value(daily.correctAnswer + correct),
        wrongAnswer: Value(daily.wrongAnswer + wrong),
        updatedAt: Value(date.millisecondsSinceEpoch),
      ),
    );
  }

  Future<List<MathTrickDailyScore>> getDailyScores({int limit = 30}) async {
    return (_db.select(_db.mathTrickDailyScores)
          ..orderBy([
            (tbl) => OrderingTerm(expression: tbl.dateId, mode: OrderingMode.desc),
          ])
          ..limit(limit)) // Get last entries
        .get();
  }
}
