import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/i18n/strings.g.dart';
import '../libs/data_math_master.dart';
import '../libs/models/achievement_parent.dart';
import '../libs/providers/math_master_repository.dart';
import 'ui_mm_daily_chart.dart';

class UiMmAchievement extends ConsumerStatefulWidget {
  const UiMmAchievement({super.key});

  static void navigate(BuildContext context) {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const UiMmAchievement()),
    );
  }

  @override
  ConsumerState<UiMmAchievement> createState() => _UiMmAchievementState();
}

class _UiMmAchievementState extends ConsumerState<UiMmAchievement> {
  List<AchievementParent> achievementList = [];
  int chapterTotal = 0;
  int chapterOpened = 0;
  int correctTotal = 0;
  int todayCorrect = 0;
  int todayWrong = 0;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    final allChapters = DataMathMaster.createChapterList(context);
    final repo = ref.read(mathMasterRepositoryProvider);
    final chapterSummary = await repo.getChapterSummary();
    final todaySummary = await repo.getTodayScores();

    if (!mounted) return;

    int totalCorrect = 0;
    int opened = 0;

    for (final chapter in allChapters) {
      final summary = chapterSummary[chapter.chapterKey];
      if (summary != null) {
        chapter.correctAnswer = summary['correct'] ?? 0;
        chapter.wrongAnswer = summary['wrong'] ?? 0;
        totalCorrect += chapter.correctAnswer;
        opened++;
      }
    }

    setState(() {
      correctTotal = totalCorrect;
      chapterOpened = opened == 0
          ? 1
          : opened; // Minimum 1 chapter is accessible
      chapterTotal = allChapters.length;
      todayCorrect = todaySummary['correct'] ?? 0;
      todayWrong = todaySummary['wrong'] ?? 0;
      achievementList = DataMathMaster.createAchievementList(
        context,
        allChapters,
      );
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);
    final locale = Translations.of(context).math_master;

    return Scaffold(
      appBar: AppBar(
        title: Text(locale.achievements),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.area_chart_rounded),
            onPressed: () => UiMmDailyChart.navigate(context),
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Stat Cards Grid
                  Row(
                    children: [
                      // Opened Chapters
                      Expanded(
                        child: ShadCard(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Icon(
                                Icons.folder_open_rounded,
                                color: theme.colorScheme.primary,
                              ),
                              const SizedBox(height: 8),
                              Text('Bab Selesai', style: theme.textTheme.muted),
                              const SizedBox(height: 4),
                              Text(
                                '$chapterOpened / $chapterTotal',
                                style: theme.textTheme.large.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(width: 16),
                      // Correct Total
                      Expanded(
                        child: ShadCard(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Icon(
                                Icons.emoji_events_rounded,
                                color: Colors.amber,
                              ),
                              const SizedBox(height: 8),
                              Text('Total Benar', style: theme.textTheme.muted),
                              const SizedBox(height: 4),
                              Text(
                                '$correctTotal',
                                style: theme.textTheme.large.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Today's Score Card
                  ShadCard(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: theme.colorScheme.primary.withValues(
                              alpha: 0.1,
                            ),
                            shape: BoxShape.circle,
                          ),
                          child: Icon(
                            Icons.today_rounded,
                            color: theme.colorScheme.primary,
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                locale.today_score,
                                style: theme.textTheme.large.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Row(
                                children: [
                                  Text(
                                    '$todayCorrect Benar',
                                    style: const TextStyle(
                                      color: Colors.green,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  const Text('|'),
                                  const SizedBox(width: 8),
                                  Text(
                                    '$todayWrong Salah',
                                    style: const TextStyle(
                                      color: Colors.red,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 32),

                  // Expandable list of chapters
                  Text(
                    'Riwayat Pembelajaran',
                    style: theme.textTheme.large.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 12),
                  if (achievementList.isEmpty)
                    const Center(child: Text('Belum ada data latihan'))
                  else
                    ...achievementList.map((parent) {
                      return ShadCard(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Text(
                                  parent.title,
                                  style: theme.textTheme.large.copyWith(
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            ...parent.child.map((chapter) {
                              return Padding(
                                padding: const EdgeInsets.symmetric(
                                  vertical: 6.0,
                                ),
                                child: Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      chapter.title,
                                      style: theme.textTheme.muted,
                                    ),
                                    Row(
                                      children: [
                                        Text(
                                          '${chapter.correctAnswer}',
                                          style: const TextStyle(
                                            color: Colors.green,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                        const Text(' / '),
                                        Text(
                                          '${chapter.wrongAnswer}',
                                          style: const TextStyle(
                                            color: Colors.red,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              );
                            }),
                          ],
                        ),
                      );
                    }),
                ],
              ),
            ),
    );
  }
}
