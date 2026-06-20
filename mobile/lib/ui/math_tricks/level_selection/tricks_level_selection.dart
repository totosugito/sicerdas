import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/i18n/strings.g.dart';
import 'package:bse/widgets/ads/ads_banner.dart';
import '../../../core/database/database.dart';
import '../libs/providers/math_tricks_repository.dart';
import '../training/tricks_training.dart';

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
  ConsumerState<TricksLevelSelectionScreen> createState() => _TricksLevelSelectionScreenState();
}

class _TricksLevelSelectionScreenState extends ConsumerState<TricksLevelSelectionScreen> {
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
    _chapter = await repo.getOrCreateChapter(widget.groupTitle, widget.chapterKey);
    _levels = await repo.getLevelsForChapter(widget.chapterKey);
  }

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);
    final l10n = Translations.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.trickTitle, style: theme.textTheme.large.copyWith(fontSize: 16)),
        elevation: 0,
        backgroundColor: Colors.transparent,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_rounded, color: theme.colorScheme.foreground),
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

          return Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 8),
                Text(
                  l10n.math_tricks.chooseModule,
                  style: theme.textTheme.muted.copyWith(fontSize: 13),
                ),
                const SizedBox(height: 16),
                Expanded(
                  child: GridView.builder(
                    padding: const EdgeInsets.only(bottom: 24),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 4,
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

                      return _LevelCard(
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
                            ShadToaster.of(context).show(
                              const ShadToast(
                                title: Text('Level Locked'),
                                description: Text('Selesaikan level sebelumnya untuk membuka level ini.'),
                              ),
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

class _LevelCard extends StatelessWidget {
  final int levelId;
  final bool isUnlocked;
  final int starCount;
  final Color themeColor;
  final bool isDark;
  final ShadThemeData theme;
  final VoidCallback onTap;

  const _LevelCard({
    required this.levelId,
    required this.isUnlocked,
    required this.starCount,
    required this.themeColor,
    required this.isDark,
    required this.theme,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        decoration: BoxDecoration(
          color: isUnlocked
              ? (isDark ? themeColor.withValues(alpha: 0.15) : Colors.white)
              : (isDark ? Colors.white.withValues(alpha: 0.03) : Colors.grey.shade100),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isUnlocked
                ? themeColor.withValues(alpha: isDark ? 0.4 : 0.2)
                : (isDark ? Colors.white.withValues(alpha: 0.08) : Colors.grey.shade300),
            width: 1.5,
          ),
          boxShadow: isUnlocked
              ? [
                  BoxShadow(
                    color: themeColor.withValues(alpha: isDark ? 0.0 : 0.08),
                    blurRadius: 6,
                    offset: const Offset(0, 3),
                  ),
                ]
              : null,
        ),
        alignment: Alignment.center,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (!isUnlocked)
              Icon(
                Icons.lock_rounded,
                size: 20,
                color: isDark ? Colors.white24 : Colors.grey.shade400,
              )
            else ...[
              Text(
                '$levelId',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: isDark ? Colors.white : Colors.black87,
                ),
              ),
              const SizedBox(height: 4),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(3, (idx) {
                  final isFilled = idx < starCount;
                  return Icon(
                    Icons.star_rounded,
                    size: 11,
                    color: isFilled
                        ? Colors.amber
                        : (isDark ? Colors.white10 : Colors.grey.shade300),
                  );
                }),
              )
            ]
          ],
        ),
      ),
    );
  }
}
