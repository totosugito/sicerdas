import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/i18n/strings.g.dart';
import 'package:bse/widgets/ads/ads_banner.dart';
import '../../../core/database/database.dart';
import '../libs/providers/math_tricks_repository.dart';

class TricksAchievementScreen extends ConsumerStatefulWidget {
  const TricksAchievementScreen({super.key});

  static void navigate(BuildContext context) {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const TricksAchievementScreen()),
    );
  }

  @override
  ConsumerState<TricksAchievementScreen> createState() => _TricksAchievementScreenState();
}

class _TricksAchievementScreenState extends ConsumerState<TricksAchievementScreen> {
  late Future<List<MathTrickDailyScore>> _scoresFuture;

  @override
  void initState() {
    super.initState();
    _scoresFuture = ref.read(mathTricksRepositoryProvider).getDailyScores();
  }

  String _formatDateId(int dateId) {
    // dateId format: yyyymmdd
    final year = dateId ~/ 10000;
    final month = (dateId % 10000) ~/ 100;
    final day = dateId % 100;

    final months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
      'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'
    ];

    final monthStr = (month >= 1 && month <= 12) ? months[month - 1] : '$month';
    return '$day $monthStr $year';
  }

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);
    final l10n = Translations.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.common.aboutSection, style: theme.textTheme.large.copyWith(fontSize: 16)),
        elevation: 0,
        backgroundColor: Colors.transparent,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_rounded, color: theme.colorScheme.foreground),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: FutureBuilder<List<MathTrickDailyScore>>(
        future: _scoresFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          final scores = snapshot.data ?? [];

          int totalCorrect = 0;
          int totalWrong = 0;
          for (final s in scores) {
            totalCorrect += s.correctAnswer;
            totalWrong += s.wrongAnswer;
          }

          final totalAnswers = totalCorrect + totalWrong;
          final double accuracy = totalAnswers > 0 ? (totalCorrect / totalAnswers) * 100 : 0.0;

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Summary Stats Cards
                Text(
                  'Ringkasan Latihan',
                  style: theme.textTheme.large.copyWith(fontWeight: FontWeight.w700, fontSize: 16),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: _buildSummaryCard(
                        'Total Benar',
                        '$totalCorrect',
                        Colors.green,
                        isDark,
                        theme,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _buildSummaryCard(
                        'Akurasi',
                        '${accuracy.toStringAsFixed(1)}%',
                        Colors.blue,
                        isDark,
                        theme,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                // History Title
                Text(
                  'Riwayat Harian (30 Hari Terakhir)',
                  style: theme.textTheme.large.copyWith(fontWeight: FontWeight.w700, fontSize: 16),
                ),
                const SizedBox(height: 12),

                if (scores.isEmpty)
                  Center(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 40.0),
                      child: Text(
                        'Belum ada riwayat latihan.',
                        style: theme.textTheme.muted,
                      ),
                    ),
                  )
                else
                  ListView.separated(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    padding: EdgeInsets.zero,
                    itemCount: scores.length,
                    separatorBuilder: (context, index) => const SizedBox(height: 12),
                    itemBuilder: (context, index) {
                      final score = scores[index];
                      final dateStr = _formatDateId(score.dateId);
                      final dailyTotal = score.correctAnswer + score.wrongAnswer;
                      final double dailyAccuracy =
                          dailyTotal > 0 ? (score.correctAnswer / dailyTotal) * 100 : 0.0;

                      return Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: isDark ? Colors.white.withValues(alpha: 0.03) : Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: isDark ? Colors.white10 : Colors.grey.shade200,
                          ),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  dateStr,
                                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                                ),
                                Text(
                                  'Akurasi: ${dailyAccuracy.toStringAsFixed(0)}%',
                                  style: TextStyle(
                                    fontWeight: FontWeight.w600,
                                    fontSize: 12,
                                    color: dailyAccuracy >= 80
                                        ? Colors.green
                                        : (dailyAccuracy >= 50 ? Colors.orange : Colors.red),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            Row(
                              children: [
                                Expanded(
                                  child: ClipRRect(
                                    borderRadius: BorderRadius.circular(4),
                                    child: SizedBox(
                                      height: 8,
                                      child: LinearProgressIndicator(
                                        value: dailyTotal > 0 ? score.correctAnswer / dailyTotal : 0,
                                        backgroundColor: Colors.red.withValues(alpha: 0.2),
                                        color: Colors.green,
                                      ),
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Text(
                                  '${score.correctAnswer} B / ${score.wrongAnswer} S',
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600,
                                    color: theme.colorScheme.mutedForeground,
                                  ),
                                ),
                              ],
                            )
                          ],
                        ),
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

  Widget _buildSummaryCard(
    String label,
    String value,
    Color color,
    bool isDark,
    ShadThemeData theme,
  ) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? color.withValues(alpha: 0.08) : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: color.withValues(alpha: isDark ? 0.35 : 0.15),
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: theme.textTheme.muted.copyWith(fontSize: 12)),
          const SizedBox(height: 6),
          Text(
            value,
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w800,
              color: color,
            ),
          ),
        ],
      ),
    );
  }
}
