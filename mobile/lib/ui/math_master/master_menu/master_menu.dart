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
import '../training/ui_mm_training.dart';
import 'widgets/chapter_options_sheet.dart';
import 'widgets/chapter_list_item.dart';
import 'widgets/menu_app_bar.dart';
import 'widgets/menu_filter_header.dart';
import 'widgets/filter_picker_sheet.dart';
import '../../../widgets/auto_height_grid_view.dart';

class UiMathMaster extends ConsumerStatefulWidget {
  const UiMathMaster({super.key});

  static void navigate(BuildContext context) {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const UiMathMaster()),
    );
  }

  @override
  ConsumerState<UiMathMaster> createState() => _UiMathMasterState();
}

class _UiMathMasterState extends ConsumerState<UiMathMaster> {
  late final ScrollController _scrollController;

  bool _isCollapsed = false;
  static const double _expandedHeight = 200.0;

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
    _scrollController.addListener(_scrollListener);
    _initDataView();
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollListener() {
    if (_scrollController.hasClients) {
      final isCollapsed = _scrollController.offset > 80;
      if (isCollapsed != _isCollapsed) {
        setState(() {
          _isCollapsed = isCollapsed;
        });
      }
    }
  }

  Future<void> _initDataView() async {
    final repo = ref.read(mathMasterRepositoryProvider);
    final summary = await repo.getTodayScores();
    final chapterSummary = await repo.getChapterSummary();

    if (!mounted) return;

    setState(() {
      todayCorrect = summary['correct'] ?? 0;
      todayWrong = summary['wrong'] ?? 0;

      groupList = DataMathMaster.createGroupList(context);
      gradeList = DataMathMaster.createGradesList(context);
      topicList = DataMathMaster.createTopicsList(context);
      chapterList = DataMathMaster.createChapterList(context);

      for (var chapter in chapterList) {
        if (chapterSummary.containsKey(chapter.chapterKey)) {
          chapter.correctAnswer =
              chapterSummary[chapter.chapterKey]?['correct'] ?? 0;
          chapter.wrongAnswer =
              chapterSummary[chapter.chapterKey]?['wrong'] ?? 0;
        }
      }

      selectedGroup = groupList.first;
      selectedGrade = gradeList.first;
      selectedTopic = topicList.first;

      _updateSelectedChapters();
    });
  }

  void _updateSelectedChapters() {
    if (selectedGroup.id == KeyGroup.grades.index) {
      selectedChapterList = DataMathMaster.createGroupByGrades(
        chapterList,
        KeyGrade.values[selectedGrade.id],
      );
    } else {
      selectedChapterList = DataMathMaster.createGroupByTopics(
        chapterList,
        KeyTopic.values[selectedTopic.id],
      );
    }
  }

  void _showFilterPickerBottomSheet() {
    final theme = ShadTheme.of(context);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: theme.colorScheme.background,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        return FilterPickerSheet(
          groupList: groupList,
          selectedGroup: selectedGroup,
          gradeList: gradeList,
          topicList: topicList,
          selectedGrade: selectedGrade,
          selectedTopic: selectedTopic,
          onSelected: (group, item) {
            setState(() {
              selectedGroup = group;
              if (group.id == KeyGroup.grades.index) {
                selectedGrade = item;
              } else {
                selectedTopic = item;
              }
              _updateSelectedChapters();
            });
          },
        );
      },
    );
  }

  Future<void> _showChapterOptionsDialog(ModelChapter selectedChapter) async {
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
          onStart: (selectedRanges, timeMode, questionCount) {
            _startTraining(
              selectedChapter,
              selectedRanges,
              timeMode,
              questionCount,
            );
          },
        );
      },
    );
  }

  void _startTraining(
    ModelChapter selectedChapter,
    List<bool> selectedRanges,
    int timeMode,
    int questionCount,
  ) {
    final clChapter = ClMmChapter.auto(userId: '', chapter: selectedChapter)
      ..correct = 0
      ..wrong = 0;

    for (int i = 0; i < selectedRanges.length; i++) {
      if (i < clChapter.ranges.length) {
        clChapter.ranges[i] = selectedRanges[i];
      }
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

    return Scaffold(
      body: CustomScrollView(
        controller: _scrollController,
        slivers: [
          // App Bar
          MenuAppBar(
            todayCorrect: todayCorrect,
            todayWrong: todayWrong,
            isCollapsed: _isCollapsed,
            isDark: theme.brightness == Brightness.dark,
            expandedHeight: _expandedHeight,
          ),

          // Selection Dropdowns & Segmented Control
          SliverPersistentHeader(
            pinned: true,
            delegate: MenuFilterHeaderDelegate(
              selectedGroup: selectedGroup,
              selectedGrade: selectedGrade,
              selectedTopic: selectedTopic,
              onPickerTriggered: _showFilterPickerBottomSheet,
              height: 64.0,
              isDark: theme.brightness == Brightness.dark,
            ),
          ),

          SliverPadding(
            padding: const EdgeInsets.only(
              left: 16,
              right: 16,
              top: 2,
              bottom: 24,
            ),
            sliver: SliverList(
              delegate: SliverChildListDelegate(
                selectedChapterList.entries.map((entry) {
                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Padding(
                        padding: const EdgeInsets.only(top: 8.0, bottom: 0.0),
                        child: Text(
                          entry.key == KeyTopic.topicAddition
                              ? locale.topics_addition
                              : entry.key == KeyTopic.topicClock
                              ? locale.topics_clock
                              : entry.key.name,
                          style: theme.textTheme.large.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      AutoHeightGridView(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        padding: const EdgeInsets.only(top: 8.0, bottom: 16.0),
                        crossAxisCount: 2,
                        crossAxisSpacing: 12,
                        mainAxisSpacing: 12,
                        itemCount: entry.value.length,
                        builder: (context, index) {
                          final chapter = entry.value[index];
                          return ChapterListItem(
                            chapter: chapter,
                            onTap: () => _showChapterOptionsDialog(chapter),
                          );
                        },
                      ),
                      const SizedBox(height: 16),
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
