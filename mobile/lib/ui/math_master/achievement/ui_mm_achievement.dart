import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/i18n/strings.g.dart';
import '../libs/data_math_master.dart';
import '../libs/models/achievement_parent.dart';
import '../libs/providers/math_master_repository.dart';
import '../../../../core/database/database.dart';
import 'widgets/achievement_stat_card.dart';
import 'widgets/achievement_today_card.dart';
import 'widgets/achievement_history_item.dart';
import 'widgets/achievement_progress_chart.dart';

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
  List<MathMasterScore> recentScores = [];
  int chapterTotal = 0;
  int chapterOpened = 0;
  int correctTotal = 0;
  int todayCorrect = 0;
  int todayWrong = 0;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadData();
    });
  }

  Future<void> _loadData() async {
    final allChapters = DataMathMaster.createChapterList(context);
    final repo = ref.read(mathMasterRepositoryProvider);
    final chapterSummary = await repo.getChapterSummary();
    final todaySummary = await repo.getTodayScores();
    final loadedRecentScores = await repo.getRecentScores(limit: 100);

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
      recentScores = loadedRecentScores;
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);
    final locale = Translations.of(context).math_master;
    final formatter = NumberFormat.decimalPattern();

    return Scaffold(
      appBar: AppBar(
        title: Text(
          locale.achievements,
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : FadeInTransition(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(
                  horizontal: 20.0,
                  vertical: 24.0,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Stat Cards Grid
                    Row(
                      children: [
                        // Opened Chapters Card
                        Expanded(
                          child: AchievementStatCard(
                            label: locale.completed_chapters,
                            value: '$chapterOpened / $chapterTotal',
                            icon: Icons.folder_open_rounded,
                            color: theme.colorScheme.primary,
                          ),
                        ),
                        const SizedBox(width: 14),
                        // Correct Total Card
                        Expanded(
                          child: AchievementStatCard(
                            label: locale.total_correct,
                            value: formatter.format(correctTotal),
                            icon: Icons.emoji_events_rounded,
                            color: Colors.amber,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),

                    // Today's Score Card
                    AchievementTodayCard(
                      todayCorrect: todayCorrect,
                      todayWrong: todayWrong,
                      titleLabel: locale.today_score,
                    ),
                    const SizedBox(height: 32),

                    // Progress Chart (Daily, Weekly, Monthly)
                    AchievementProgressChart(scores: recentScores),
                    const SizedBox(height: 32),

                    // Learning History Header
                    Row(
                      children: [
                        Container(
                          width: 4,
                          height: 18,
                          decoration: BoxDecoration(
                            color: theme.colorScheme.primary,
                            borderRadius: BorderRadius.circular(2),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          locale.learning_history,
                          style: theme.textTheme.large.copyWith(
                            fontWeight: FontWeight.w800,
                            fontSize: 16,
                            letterSpacing: -0.3,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),

                    if (achievementList.isEmpty)
                      Center(
                        child: Padding(
                          padding: const EdgeInsets.only(top: 40.0),
                          child: Text(
                            locale.no_data,
                            style: theme.textTheme.muted,
                          ),
                        ),
                      )
                    else
                      ...achievementList.map((parent) {
                        return AchievementHistoryItem(parent: parent);
                      }),
                  ],
                ),
              ),
            ),
    );
  }
}

// Simple Fade-in animation helper for load presentation
class FadeInTransition extends StatefulWidget {
  final Widget child;

  const FadeInTransition({super.key, required this.child});

  @override
  State<FadeInTransition> createState() => _FadeInTransitionState();
}

class _FadeInTransitionState extends State<FadeInTransition>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
    _animation = CurvedAnimation(parent: _controller, curve: Curves.easeOut);
    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(opacity: _animation, child: widget.child);
  }
}
