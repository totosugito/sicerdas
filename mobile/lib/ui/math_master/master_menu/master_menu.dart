import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/i18n/strings.g.dart';
import '../libs/data_math_master.dart';
import '../libs/models/enums.dart';
import '../libs/models/model_chapter.dart';
import '../libs/models/cl_mm_chapter.dart';
import '../libs/models/model_item.dart';
import '../libs/providers/math_master_repository.dart';
import '../ui/ui_mm_achievement.dart';
import '../ui/ui_mm_training.dart';
import 'widgets/chapter_options_sheet.dart';
import 'widgets/master_chapter_list_item.dart';

class UiMathMaster extends ConsumerStatefulWidget {
  const UiMathMaster({super.key});

  static void navigate(BuildContext context) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const UiMathMaster(),
      ),
    );
  }

  @override
  ConsumerState<UiMathMaster> createState() => _UiMathMasterState();
}

class _UiMathMasterState extends ConsumerState<UiMathMaster> {
  late final ScrollController _scrollController;

  List<ModelItem> groupList = [];
  List<ModelItem> gradeList = [];
  List<ModelItem> topicList = [];
  List<ModelChapter> chapterList = [];
  Map<KeyTopic, List<ModelChapter>> selectedChapterList = {};

  ModelItem selectedGroup = ModelItem.create();
  ModelItem selectedGrade = ModelItem.create();
  ModelItem selectedTopic = ModelItem.create();

  int todayCorrect = 0;
  int todayWrong = 0;

  @override
  void initState() {
    super.initState();
    _scrollController = ScrollController();
    _initDataView();
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _initDataView() async {
    final repo = ref.read(mathMasterRepositoryProvider);
    final summary = await repo.getTodayScores();
    
    if (!mounted) return;
    
    setState(() {
      todayCorrect = summary['correct'] ?? 0;
      todayWrong = summary['wrong'] ?? 0;
      
      groupList = DataMathMaster.createGroupList(context);
      gradeList = DataMathMaster.createGradesList(context);
      topicList = DataMathMaster.createTopicsList(context);
      chapterList = DataMathMaster.createChapterList(context);

      selectedGroup = groupList.first;
      selectedGrade = gradeList.first;
      selectedTopic = topicList.first;

      _updateSelectedChapters();
    });
  }

  void _updateSelectedChapters() {
    if (selectedGroup.id == KeyGroup.grades.index) {
      selectedChapterList = DataMathMaster.createGroupByGrades(chapterList, KeyGrade.values[selectedGrade.id]);
    } else {
      selectedChapterList = DataMathMaster.createGroupByTopics(chapterList, KeyTopic.values[selectedTopic.id]);
    }
  }

  _showChapterOptionsDialog(ModelChapter selectedChapter) async {
    final theme = ShadTheme.of(context);
    
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: theme.colorScheme.background,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        return ChapterOptionsSheet(
          selectedChapter: selectedChapter,
          onStart: (rangeIndex, timeMode, questionCount) {
            _startTraining(selectedChapter, rangeIndex, timeMode, questionCount);
          },
        );
      },
    );
  }

  void _startTraining(ModelChapter selectedChapter, int rangeIndex, int timeMode, int questionCount) {
    final clChapter = ClMmChapter.auto(userId: '', chapter: selectedChapter)
      ..correct = 0
      ..wrong = 0;

    if (rangeIndex >= 0 && rangeIndex < clChapter.ranges.length) {
      clChapter.ranges.fillRange(0, clChapter.ranges.length, false);
      clChapter.ranges[rangeIndex] = true;
    }

    UiMmTraining.navigate(
      context: context,
      chapter: clChapter,
      mdChapter: selectedChapter,
      timeLimitMode: timeMode,
      questionCount: questionCount,
      onComplete: () {
        _initDataView(); // Refresh dashboard score
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);
    final locale = Translations.of(context).math_master;
    final isDark = theme.brightness == Brightness.dark;
    
    final primaryHint = theme.colorScheme.primary.withValues(alpha: isDark ? 0.08 : 0.04);
    final backgroundColor = theme.colorScheme.background;

    return Scaffold(
      body: CustomScrollView(
        controller: _scrollController,
        slivers: [
          // App Bar
          SliverAppBar(
            expandedHeight: 180,
            pinned: true,
            elevation: 0,
            backgroundColor: Colors.transparent,
            leading: IconButton(
              icon: Icon(Icons.arrow_back_rounded, color: theme.colorScheme.foreground),
              onPressed: () => Navigator.of(context).pop(),
            ),
            actions: [
              IconButton(
                icon: Icon(Icons.emoji_events_rounded, color: theme.colorScheme.foreground),
                onPressed: () => UiMmAchievement.navigate(context),
              ),
            ],
            bottom: PreferredSize(
              preferredSize: const Size.fromHeight(1.5),
              child: Container(color: theme.colorScheme.primary.withValues(alpha: isDark ? 0.3 : 0.15), height: 1.5),
            ),
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Color.alphaBlend(primaryHint, backgroundColor), backgroundColor],
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                  ),
                ),
                padding: const EdgeInsets.only(top: 80, left: 24, right: 24),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          locale.module_math_master,
                          style: theme.textTheme.h2.copyWith(fontWeight: FontWeight.w800),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          locale.daily_progress,
                          style: theme.textTheme.muted,
                        ),
                      ],
                    ),
                    // Quick Stats Badge
                    ShadCard(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      backgroundColor: theme.colorScheme.muted.withValues(alpha: 0.3),
                      child: Row(
                        children: [
                          Icon(Icons.check_circle_rounded, color: theme.colorScheme.primary),
                          const SizedBox(width: 6),
                          Text(
                            '$todayCorrect',
                            style: theme.textTheme.large.copyWith(fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(width: 12),
                          const Icon(Icons.cancel_rounded, color: Colors.red),
                          const SizedBox(width: 6),
                          Text(
                            '$todayWrong',
                            style: theme.textTheme.large.copyWith(fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          
          // Selection Dropdowns
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 12.0),
              child: Row(
                children: [
                  Expanded(
                    flex: 2,
                    child: DropdownButtonFormField<String>(
                      value: selectedGroup.key,
                      decoration: InputDecoration(
                        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      items: groupList.map((g) => DropdownMenuItem(value: g.key, child: Text(g.title))).toList(),
                      onChanged: (val) {
                        if (val == null) return;
                        setState(() {
                          selectedGroup = groupList.firstWhere((g) => g.key == val);
                          _updateSelectedChapters();
                        });
                      },
                    ),
                  ),
                  const SizedBox(width: 12),
                  if (selectedGroup.id == KeyGroup.grades.index)
                    Expanded(
                      flex: 3,
                      child: DropdownButtonFormField<String>(
                        value: selectedGrade.key,
                        decoration: InputDecoration(
                          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        items: gradeList.map((g) => DropdownMenuItem(value: g.key, child: Text(g.title))).toList(),
                        onChanged: (val) {
                          if (val == null) return;
                          setState(() {
                            selectedGrade = gradeList.firstWhere((g) => g.key == val);
                            _updateSelectedChapters();
                          });
                        },
                      ),
                    ),
                  if (selectedGroup.id == KeyGroup.topics.index)
                    Expanded(
                      flex: 3,
                      child: DropdownButtonFormField<String>(
                        value: selectedTopic.key,
                        decoration: InputDecoration(
                          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        items: topicList.map((g) => DropdownMenuItem(value: g.key, child: Text(g.title))).toList(),
                        onChanged: (val) {
                          if (val == null) return;
                          setState(() {
                            selectedTopic = topicList.firstWhere((g) => g.key == val);
                            _updateSelectedChapters();
                          });
                        },
                      ),
                    ),
                ],
              ),
            ),
          ),
          
          // Chapters Grid/List
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
            sliver: SliverList(
              delegate: SliverChildListDelegate(
                selectedChapterList.entries.map((entry) {
                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 8.0),
                        child: Text(
                          entry.key == KeyTopic.topicAddition ? locale.topics_addition : entry.key.name,
                          style: theme.textTheme.large.copyWith(fontWeight: FontWeight.bold),
                        ),
                      ),
                      ...entry.value.map((chapter) {
                        return MasterChapterListItem(
                          chapter: chapter,
                          onTap: () => _showChapterOptionsDialog(chapter),
                        );
                      }),
                    ],
                  );
                }).toList(),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
