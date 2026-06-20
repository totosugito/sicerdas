import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/i18n/strings.g.dart';
import 'package:bse/widgets/ads/ads_banner.dart';
import '../achievement/tricks_achievement.dart';
import '../libs/providers/math_tricks_repository.dart';
import 'widgets/trick_list_item.dart';
import 'data/tricks_menu_data.dart';
import '../../../core/database/database.dart';

class TricksMenuScreen extends ConsumerStatefulWidget {
  const TricksMenuScreen({super.key});

  static void navigate(BuildContext context) {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const TricksMenuScreen()),
    );
  }

  @override
  ConsumerState<TricksMenuScreen> createState() => _TricksMenuScreenState();
}

class _TricksMenuScreenState extends ConsumerState<TricksMenuScreen> {
  late final ScrollController _scrollController;
  bool _isCollapsed = false;
  static const double _expandedHeight = 200.0;

  // Track expanded state for each group index
  final Map<int, bool> _expandedGroups = {
    0: true, // Expand the first group by default
  };

  @override
  void initState() {
    super.initState();
    _scrollController = ScrollController();
    _scrollController.addListener(_scrollListener);
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollListener() {
    if (_scrollController.hasClients) {
      final isCollapsed =
          _scrollController.offset >
          (_expandedHeight -
              kToolbarHeight -
              MediaQuery.of(context).padding.top -
              16);
      if (isCollapsed != _isCollapsed) {
        setState(() {
          _isCollapsed = isCollapsed;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);
    final l10n = Translations.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final chaptersProgressAsync = ref.watch(mathTricksChaptersStreamProvider);
    final chaptersProgress = chaptersProgressAsync.value ?? [];

    final backgroundColor = theme.colorScheme.background;
    final primaryHint = theme.colorScheme.primary.withValues(
      alpha: isDark ? 0.08 : 0.04,
    );

    // Get math tricks structure from separated data file
    final groups = getMathTricksGroups(l10n);

    return Scaffold(
      body: CustomScrollView(
        controller: _scrollController,
        slivers: [
          // Pinned Collapsible App Bar
          SliverAppBar(
            expandedHeight: _expandedHeight,
            pinned: true,
            elevation: 0,
            backgroundColor: Colors.transparent,
            leading: IconButton(
              icon: Icon(
                Icons.arrow_back_rounded,
                color: theme.colorScheme.foreground,
              ),
              onPressed: () => Navigator.of(context).pop(),
            ),
            actions: [
              IconButton(
                icon: Icon(
                  Icons.emoji_events_rounded,
                  color: theme.colorScheme.foreground,
                ),
                tooltip: 'Prestasi',
                onPressed: () => TricksAchievementScreen.navigate(context),
              ),
            ],
            bottom: PreferredSize(
              preferredSize: const Size.fromHeight(1.5),
              child: Container(
                color: theme.colorScheme.primary.withValues(
                  alpha: isDark ? 0.3 : 0.15,
                ),
                height: 1.5,
              ),
            ),
            flexibleSpace: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    Color.alphaBlend(primaryHint, backgroundColor),
                    backgroundColor,
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
              child: FlexibleSpaceBar(
                centerTitle: false,
                title: AnimatedOpacity(
                  duration: const Duration(milliseconds: 150),
                  opacity: _isCollapsed ? 1.0 : 0.0,
                  child: Text(
                    l10n.math_tricks.title,
                    style: theme.textTheme.large.copyWith(
                      color: theme.colorScheme.foreground,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                background: Padding(
                  padding: EdgeInsets.only(
                    top: MediaQuery.of(context).padding.top + 28,
                    bottom: 0,
                    left: 16,
                    right: 16,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: theme.colorScheme.primary.withValues(
                            alpha: 0.05,
                          ),
                          border: Border.all(
                            color: theme.colorScheme.primary.withValues(
                              alpha: isDark ? 0.2 : 0.1,
                            ),
                            width: 1.5,
                          ),
                        ),
                        child: Icon(
                          Icons.calculate_rounded,
                          size: 40,
                          color: theme.colorScheme.primary,
                        ),
                      ),
                      const SizedBox(height: 10),
                      Text(
                        l10n.math_tricks.title,
                        style: theme.textTheme.h3.copyWith(
                          color: theme.colorScheme.foreground,
                          fontSize: 22,
                          fontWeight: FontWeight.w800,
                          letterSpacing: -0.5,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        l10n.math_tricks.subtitle,
                        style: theme.textTheme.muted.copyWith(
                          fontSize: 12,
                          height: 1.3,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),

          // Scrollable list content
          SliverPadding(
            padding: const EdgeInsets.symmetric(
              horizontal: 16.0,
              vertical: 16.0,
            ),
            sliver: SliverList(
              delegate: SliverChildListDelegate([
                Text(
                  l10n.math_tricks.chooseModule,
                  style: theme.textTheme.large.copyWith(
                    fontWeight: FontWeight.w700,
                    fontSize: 16,
                  ),
                ),
                const SizedBox(height: 16),
                ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  padding: EdgeInsets.zero,
                  itemCount: groups.length,
                  separatorBuilder: (context, index) =>
                      const SizedBox(height: 14),
                  itemBuilder: (context, groupIndex) {
                    final group = groups[groupIndex];
                    final String title = group['title'] as String;
                    final String symbol = group['symbol'] as String;
                    final Color color = group['color'] as Color;
                    final List<Map<String, dynamic>> tricks =
                        group['tricks'] as List<Map<String, dynamic>>;

                    final isExpanded = _expandedGroups[groupIndex] ?? false;

                    return Container(
                      decoration: BoxDecoration(
                        color: isDark
                            ? color.withValues(alpha: 0.05)
                            : Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          BoxShadow(
                            color: color.withValues(alpha: isDark ? 0.0 : 0.06),
                            blurRadius: 8,
                            offset: const Offset(0, 4),
                          ),
                        ],
                        border: Border.all(
                          color: color.withValues(alpha: isDark ? 0.35 : 0.15),
                          width: 1,
                        ),
                      ),
                      child: Column(
                        children: [
                          // Header (Tap to expand/collapse)
                          InkWell(
                            onTap: () {
                              setState(() {
                                _expandedGroups[groupIndex] = !isExpanded;
                              });
                            },
                            borderRadius: BorderRadius.circular(16),
                            child: Padding(
                              padding: const EdgeInsets.all(16.0),
                              child: Row(
                                children: [
                                  // Math Symbol Icon Indicator
                                  Container(
                                    width: 38,
                                    height: 38,
                                    decoration: BoxDecoration(
                                      color: color.withValues(alpha: 0.15),
                                      borderRadius: BorderRadius.circular(10),
                                      border: Border.all(
                                        color: color.withValues(alpha: 0.3),
                                        width: 1,
                                      ),
                                    ),
                                    alignment: Alignment.center,
                                    child: Text(
                                      symbol,
                                      style: TextStyle(
                                        fontSize: 20,
                                        fontWeight: FontWeight.bold,
                                        color: color,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 14),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          title,
                                          style: theme.textTheme.large.copyWith(
                                            fontWeight: FontWeight.w700,
                                            fontSize: 15,
                                            color: isDark
                                                ? Colors.white
                                                : Colors.black87,
                                          ),
                                        ),
                                        const SizedBox(height: 2),
                                        Text(
                                          '${tricks.length} ${l10n.math_tricks.levels.toLowerCase()}',
                                          style: theme.textTheme.muted.copyWith(
                                            fontSize: 12,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  Icon(
                                    isExpanded
                                        ? Icons.keyboard_arrow_up_rounded
                                        : Icons.keyboard_arrow_down_rounded,
                                    color: color,
                                  ),
                                ],
                              ),
                            ),
                          ),

                          // Expandable child list
                          if (isExpanded) ...[
                            Divider(
                              height: 1,
                              color: color.withValues(alpha: 0.15),
                            ),
                            ListView.separated(
                              shrinkWrap: true,
                              physics: const NeverScrollableScrollPhysics(),
                              padding: const EdgeInsets.symmetric(
                                vertical: 8,
                                horizontal: 16,
                              ),
                              itemCount: tricks.length,
                              separatorBuilder: (context, idx) => Divider(
                                height: 1,
                                color: color.withValues(alpha: 0.05),
                              ),
                              itemBuilder: (context, trickIndex) {
                                final trick = tricks[trickIndex];
                                final int id = trick['id'] as int;
                                final String trickTitle =
                                    trick['title'] as String;
                                final String trickKey = trick['key'] as String;

                                MathTrickChapter? chapterProgress;
                                try {
                                  chapterProgress = chaptersProgress.firstWhere(
                                    (c) => c.chapterKey == trickKey,
                                  );
                                } catch (_) {
                                  chapterProgress = null;
                                }

                                return TrickListItem(
                                  id: id,
                                  trickKey: trickKey,
                                  trickTitle: trickTitle,
                                  groupTitle: title,
                                  themeColor: color,
                                  chapter: chapterProgress,
                                );
                              },
                            ),
                            const SizedBox(height: 8),
                          ],
                        ],
                      ),
                    );
                  },
                ),
              ]),
            ),
          ),
          const SliverToBoxAdapter(child: SizedBox(height: 24)),
        ],
      ),
      bottomNavigationBar: AdsBanner.buildBottomBar(ref),
    );
  }
}
