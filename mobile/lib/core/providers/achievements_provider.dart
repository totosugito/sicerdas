import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/database_provider.dart';
import '../../ui/math_master/libs/providers/math_master_repository.dart';
import '../../ui/math_tricks/libs/providers/math_tricks_repository.dart';

class UserAchievements {
  final int mathMasterPlayed;
  final int mathMasterCorrect;
  final int mathMasterWrong;
  final int mathTricksChaptersUnlocked;
  final int mathTricksLevelsSolved;
  final int mathTricksStarsEarned;

  UserAchievements({
    required this.mathMasterPlayed,
    required this.mathMasterCorrect,
    required this.mathMasterWrong,
    required this.mathTricksChaptersUnlocked,
    required this.mathTricksLevelsSolved,
    required this.mathTricksStarsEarned,
  });
}

final userAchievementsProvider = FutureProvider<UserAchievements>((ref) async {
  final masterRepo = ref.watch(mathMasterRepositoryProvider);
  final tricksRepo = ref.watch(mathTricksRepositoryProvider);

  // 1. Math Master Stats
  final recentScores = await masterRepo.getRecentScores(limit: 9999);
  final mmPlayed = recentScores.length;
  int mmCorrect = 0;
  int mmWrong = 0;
  for (final score in recentScores) {
    mmCorrect += score.correctCount;
    mmWrong += score.wrongCount;
  }

  // 2. Math Tricks Stats
  final chapters = await tricksRepo.getAllChapters();
  final mtChaptersUnlocked = chapters.length;

  final db = ref.read(databaseProvider);
  final allLevels = await db.select(db.mathTrickLevels).get();
  final mtLevelsSolved = allLevels.where((l) => l.star > 0).length;
  final mtStarsEarned = allLevels.fold(0, (sum, l) => sum + l.star);

  return UserAchievements(
    mathMasterPlayed: mmPlayed,
    mathMasterCorrect: mmCorrect,
    mathMasterWrong: mmWrong,
    mathTricksChaptersUnlocked: mtChaptersUnlocked,
    mathTricksLevelsSolved: mtLevelsSolved,
    mathTricksStarsEarned: mtStarsEarned,
  );
});
