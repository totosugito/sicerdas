import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/i18n/strings.g.dart';
import 'package:bse/widgets/ads/ads_banner.dart';
import '../../../core/database/database.dart';
import '../../../../core/utils/my_utils.dart';
import '../libs/providers/math_tricks_repository.dart';
import '../tricks_menu/data/tricks_menu_data.dart';
import 'widgets/summary_card.dart';
import 'widgets/daily_history_card.dart';
import 'widgets/daily_trend_chart.dart';
import 'widgets/top_played_trick_card.dart';

class TricksAchievementScreen extends ConsumerStatefulWidget {
  final int maxTopTricks;
  final int maxHistoryListItems;

  const TricksAchievementScreen({
    super.key,
    this.maxTopTricks = 3,
    this.maxHistoryListItems = 7,
  });

  static void navigate(
    BuildContext context, {
    int maxTopTricks = 3,
    int maxHistoryListItems = 7,
  }) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => TricksAchievementScreen(
          maxTopTricks: maxTopTricks,
          maxHistoryListItems: maxHistoryListItems,
        ),
      ),
    );
  }

  @override
  ConsumerState<TricksAchievementScreen> createState() =>
      _TricksAchievementScreenState();
}

class _TricksAchievementScreenState
    extends ConsumerState<TricksAchievementScreen> {
  late Future<List<dynamic>> _dataFuture;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  void _loadData() {
    final repo = ref.read(mathTricksRepositoryProvider);
    setState(() {
      _dataFuture = Future.wait([
        repo.getDailyScores(limit: widget.maxHistoryListItems),
        repo.getAllChapters(),
      ]);
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);
    final l10n = Translations.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          l10n.math_tricks.achievement.title,
          style: theme.textTheme.large.copyWith(fontSize: 16),
        ),
        elevation: 0,
        backgroundColor: Colors.transparent,
        leading: IconButton(
          icon: Icon(
            Icons.arrow_back_rounded,
            color: theme.colorScheme.foreground,
          ),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: FutureBuilder<List<dynamic>>(
        future: _dataFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          final scores =
              (snapshot.data?[0] as List<MathTrickDailyScore>?) ?? [];
          final chapters = (snapshot.data?[1] as List<MathTrickChapter>?) ?? [];

          int totalCorrect = 0;
          int totalWrong = 0;
          for (final s in scores) {
            totalCorrect += s.correctAnswer;
            totalWrong += s.wrongAnswer;
          }

          final totalAnswers = totalCorrect + totalWrong;
          final double accuracy = totalAnswers > 0
              ? (totalCorrect / totalAnswers) * 100
              : 0.0;

          // Build maps to translate trick keys to readable titles and group colors
          final groups = getMathTricksGroups(l10n);
          final trickInfoMap = <String, Map<String, dynamic>>{};
          for (final group in groups) {
            final color = group['color'] as Color;
            final tricksList = group['tricks'] as List<Map<String, dynamic>>;
            for (final trick in tricksList) {
              final key = trick['key'] as String;
              final title = trick['title'] as String;
              trickInfoMap[key] = {'title': title, 'color': color};
            }
          }

          // Top Played Tricks calculation
          final activeChapters = chapters
              .where((c) => (c.correct + c.wrong) > 0)
              .toList();
          activeChapters.sort(
            (a, b) => (b.correct + b.wrong).compareTo(a.correct + a.wrong),
          );

          return SingleChildScrollView(
            padding: const EdgeInsets.only(
              left: 16.0,
              right: 16.0,
              bottom: 32.0,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Summary Stats Cards
                Text(
                  l10n.math_tricks.achievement.summary,
                  style: theme.textTheme.large.copyWith(
                    fontWeight: FontWeight.w700,
                    fontSize: 16,
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: SummaryCard(
                        label: l10n.math_tricks.achievement.totalCorrect,
                        value: '$totalCorrect',
                        icon: Icons.check_circle_outline_rounded,
                        color: Colors.green,
                        isDark: isDark,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: SummaryCard(
                        label: l10n.math_tricks.achievement.averageAccuracy,
                        value: '${accuracy.toStringAsFixed(1)}%',
                        icon: Icons.insights_rounded,
                        color: Colors.blue,
                        isDark: isDark,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                // Chart Section
                if (scores.isNotEmpty) ...[
                  Text(
                    l10n.math_tricks.achievement.dailyTrend,
                    style: theme.textTheme.large.copyWith(
                      fontWeight: FontWeight.w700,
                      fontSize: 16,
                    ),
                  ),
                  const SizedBox(height: 12),
                  DailyTrendChart(scores: scores),
                  const SizedBox(height: 24),
                ],

                // Top Played Tricks Section
                if (activeChapters.isNotEmpty) ...[
                  Text(
                    l10n.math_tricks.achievement.topTricks,
                    style: theme.textTheme.large.copyWith(
                      fontWeight: FontWeight.w700,
                      fontSize: 16,
                    ),
                  ),
                  const SizedBox(height: 12),
                  ListView.separated(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    padding: EdgeInsets.zero,
                    itemCount: activeChapters.take(widget.maxTopTricks).length,
                    separatorBuilder: (context, index) =>
                        const SizedBox(height: 10),
                    itemBuilder: (context, index) {
                      final chap = activeChapters[index];
                      final info =
                          trickInfoMap[chap.chapterKey] ??
                          {
                            'title': chap.chapterKey,
                            'color': theme.colorScheme.primary,
                          };
                      final title = info['title'] as String;
                      final color = info['color'] as Color;
                      final total = chap.correct + chap.wrong;
                      final acc = total > 0
                          ? (chap.correct / total * 100).round()
                          : 0;

                      return TopPlayedTrickCard(
                        title: title,
                        color: color,
                        total: total,
                        acc: acc,
                        isDark: isDark,
                      );
                    },
                  ),
                  const SizedBox(height: 24),
                ],

                // History Title
                Text(
                  l10n.math_tricks.achievement.dailyHistory(
                    count: widget.maxHistoryListItems,
                  ),
                  style: theme.textTheme.large.copyWith(
                    fontWeight: FontWeight.w700,
                    fontSize: 16,
                  ),
                ),
                const SizedBox(height: 12),

                if (scores.isEmpty)
                  Center(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 40.0),
                      child: Text(
                        l10n.math_tricks.achievement.noHistory,
                        style: theme.textTheme.muted,
                      ),
                    ),
                  )
                else
                  ListView.separated(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    padding: EdgeInsets.zero,
                    itemCount: scores.take(widget.maxHistoryListItems).length,
                    separatorBuilder: (context, index) =>
                        const SizedBox(height: 12),
                    itemBuilder: (context, index) {
                      final score = scores[index];
                      final dateTimeStr = MyUtils.formatDateTime(
                        score.updatedAt,
                      );

                      return DailyHistoryCard(
                        dateTimeStr: dateTimeStr,
                        correctAnswer: score.correctAnswer,
                        wrongAnswer: score.wrongAnswer,
                        isDark: isDark,
                      );
                    },
                  ),
              ],
            ),
          );
        },
      ),
      bottomNavigationBar: AdsBanner.buildBottomBar(ref),
    );
  }
}
