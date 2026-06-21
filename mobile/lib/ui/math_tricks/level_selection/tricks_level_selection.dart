import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/i18n/strings.g.dart';
import 'package:bse/widgets/ads/ads_banner.dart';
import 'package:bse/core/utils/toast_utils.dart';
import '../../../core/database/database.dart';
import '../libs/providers/math_tricks_repository.dart';
import '../training/tricks_training.dart';
import 'widgets/level_card.dart';

class TricksLevelSelectionScreen extends ConsumerStatefulWidget {
  final String groupTitle;
  final String chapterKey;
  final String trickTitle;
  final Color themeColor;

  const TricksLevelSelectionScreen({
    super.key,
    required this.groupTitle,
    required this.chapterKey,
    required this.trickTitle,
    required this.themeColor,
  });

  static void navigate(
    BuildContext context, {
    required String groupTitle,
    required String chapterKey,
    required String trickTitle,
    required Color themeColor,
  }) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => TricksLevelSelectionScreen(
          groupTitle: groupTitle,
          chapterKey: chapterKey,
          trickTitle: trickTitle,
          themeColor: themeColor,
        ),
      ),
    );
  }

  @override
  ConsumerState<TricksLevelSelectionScreen> createState() =>
      _TricksLevelSelectionScreenState();
}

class _TricksLevelSelectionScreenState
    extends ConsumerState<TricksLevelSelectionScreen> {
  late Future<void> _loadingFuture;
  MathTrickChapter? _chapter;
  List<MathTrickLevel> _levels = [];
  static const int _totalLevels = 50;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  void _loadData() {
    setState(() {
      _loadingFuture = _fetchDbData();
    });
  }

  Future<void> _fetchDbData() async {
    final repo = ref.read(mathTricksRepositoryProvider);
    _chapter = await repo.getOrCreateChapter(
      widget.groupTitle,
      widget.chapterKey,
    );
    _levels = await repo.getLevelsForChapter(widget.chapterKey);
  }

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);
    final l10n = Translations.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          l10n.math_tricks.selectLevel,
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
      body: FutureBuilder<void>(
        future: _loadingFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          final unlockedLevelsCount = _chapter?.opened ?? 1;
          final width = MediaQuery.of(context).size.width;
          final crossAxisCount = (width / 95).floor().clamp(4, 12);

          final totalStars = _levels.fold<int>(0, (sum, lvl) => sum + lvl.star);
          final maxStars = _totalLevels * 3;
          final completedLevels = (unlockedLevelsCount - 1).clamp(0, 50);
          final progressPercent = completedLevels / 50.0;

          final totalSolved = (_chapter?.correct ?? 0) + (_chapter?.wrong ?? 0);
          final accuracy = totalSolved > 0
              ? ((_chapter?.correct ?? 0) / totalSolved * 100).round()
              : 0;

          return Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 12),
                ShadCard(
                  backgroundColor: widget.themeColor.withValues(
                    alpha: isDark ? 0.08 : 0.04,
                  ),
                  border: ShadBorder.all(
                    color: widget.themeColor.withValues(
                      alpha: isDark ? 0.25 : 0.15,
                    ),
                    width: 1.5,
                  ),
                  radius: BorderRadius.circular(16),
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 3,
                            ),
                            decoration: BoxDecoration(
                              color: widget.themeColor.withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              widget.groupTitle,
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: widget.themeColor,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        widget.trickTitle,
                        style: theme.textTheme.h4.copyWith(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: isDark ? Colors.white : Colors.black87,
                        ),
                      ),
                      const SizedBox(height: 16),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Icon(
                                      Icons.flag_rounded,
                                      size: 14,
                                      color: theme.colorScheme.mutedForeground,
                                    ),
                                    const SizedBox(width: 4),
                                    Text(
                                      l10n.math_tricks.progress,
                                      style: theme.textTheme.muted.copyWith(
                                        fontSize: 11,
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  '$completedLevels / $_totalLevels',
                                  style: TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.bold,
                                    color: isDark
                                        ? Colors.white
                                        : Colors.black87,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    const Icon(
                                      Icons.star_rounded,
                                      size: 14,
                                      color: Colors.amber,
                                    ),
                                    const SizedBox(width: 4),
                                    Text(
                                      l10n.math_tricks.achievement.stars,
                                      style: theme.textTheme.muted.copyWith(
                                        fontSize: 11,
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  '$totalStars / $maxStars',
                                  style: TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.bold,
                                    color: isDark
                                        ? Colors.white
                                        : Colors.black87,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Icon(
                                      Icons.insights_rounded,
                                      size: 14,
                                      color: widget.themeColor,
                                    ),
                                    const SizedBox(width: 4),
                                    Text(
                                      l10n.math_tricks.accuracy,
                                      style: theme.textTheme.muted.copyWith(
                                        fontSize: 11,
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  totalSolved > 0 ? '$accuracy%' : '-',
                                  style: TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.bold,
                                    color: isDark
                                        ? Colors.white
                                        : Colors.black87,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(4),
                        child: LinearProgressIndicator(
                          value: progressPercent,
                          backgroundColor: widget.themeColor.withValues(
                            alpha: 0.1,
                          ),
                          valueColor: AlwaysStoppedAnimation<Color>(
                            widget.themeColor,
                          ),
                          minHeight: 6,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                Expanded(
                  child: GridView.builder(
                    padding: const EdgeInsets.only(bottom: 24),
                    gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: crossAxisCount,
                      crossAxisSpacing: 12,
                      mainAxisSpacing: 12,
                      childAspectRatio: 1.0,
                    ),
                    itemCount: _totalLevels,
                    itemBuilder: (context, index) {
                      final levelId = index + 1;
                      final isUnlocked = levelId <= unlockedLevelsCount;

                      // Find level data from DB if exists
                      final MathTrickLevel dbLevel = _levels.firstWhere(
                        (l) => l.levelId == levelId,
                        orElse: () => MathTrickLevel(
                          id: 0,
                          userId: 'default',
                          chapterKey: widget.chapterKey,
                          levelId: levelId,
                          star: 0,
                          time: 0,
                          score: 0,
                          correct: 0,
                          wrong: 0,
                          extra: '{}',
                        ),
                      );

                      final starCount = dbLevel.star;

                      return LevelCard(
                        levelId: levelId,
                        isUnlocked: isUnlocked,
                        starCount: starCount,
                        themeColor: widget.themeColor,
                        isDark: isDark,
                        theme: theme,
                        onTap: () {
                          if (isUnlocked) {
                            TricksTrainingScreen.navigate(
                              context,
                              chapterKey: widget.chapterKey,
                              trickTitle: widget.trickTitle,
                              level: levelId,
                              themeColor: widget.themeColor,
                              onComplete: () {
                                _loadData();
                              },
                            );
                          } else {
                            ToastUtils.showWarning(
                              context,
                              title: l10n.math_tricks.levelLocked,
                              message: l10n.math_tricks.levelLockedDesc,
                            );
                          }
                        },
                      );
                    },
                  ),
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
