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
import '../ui/ui_mm_training.dart';
import 'widgets/chapter_options_sheet.dart';
import 'widgets/master_chapter_list_item.dart';
import 'widgets/master_menu_app_bar.dart';

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
    final locale = Translations.of(context).math_master;
    final isGrades = selectedGroup.id == KeyGroup.grades.index;
    final list = isGrades ? gradeList : topicList;
    final title = isGrades ? locale.group_grades : locale.group_topics;
    String searchQuery = '';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: theme.colorScheme.background,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        return DraggableScrollableSheet(
          initialChildSize: 0.6,
          minChildSize: 0.4,
          maxChildSize: 0.85,
          expand: false,
          builder: (context, scrollController) {
            return StatefulBuilder(
              builder: (context, setSheetState) {
                final filteredList = list.where((item) {
                  return item.title.toLowerCase().contains(
                    searchQuery.toLowerCase(),
                  );
                }).toList();

                return Container(
                  padding: const EdgeInsets.only(top: 16, left: 16, right: 16),
                  child: Column(
                    children: [
                      Center(
                        child: Container(
                          width: 40,
                          height: 4,
                          decoration: BoxDecoration(
                            color: theme.colorScheme.muted,
                            borderRadius: BorderRadius.circular(2),
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        title,
                        style: theme.textTheme.large.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 16),
                      ShadInput(
                        placeholder: Text(
                          isGrades ? 'Cari kelas...' : 'Cari topik...',
                        ),
                        leading: const Padding(
                          padding: EdgeInsets.only(right: 8),
                          child: Icon(Icons.search_rounded, size: 18),
                        ),
                        onChanged: (val) {
                          setSheetState(() {
                            searchQuery = val;
                          });
                        },
                      ),
                      const SizedBox(height: 12),
                      Expanded(
                        child: ListView.builder(
                          controller: scrollController,
                          itemCount: filteredList.length,
                          itemBuilder: (context, index) {
                            final item = filteredList[index];
                            final isSelected = isGrades
                                ? selectedGrade.key == item.key
                                : selectedTopic.key == item.key;
                            return ListTile(
                              title: Text(
                                item.title,
                                style: theme.textTheme.small.copyWith(
                                  fontWeight: isSelected
                                      ? FontWeight.bold
                                      : FontWeight.normal,
                                  color: isSelected
                                      ? theme.colorScheme.primary
                                      : theme.colorScheme.foreground,
                                ),
                              ),
                              trailing: isSelected
                                  ? Icon(
                                      Icons.check_circle_rounded,
                                      color: theme.colorScheme.primary,
                                    )
                                  : null,
                              onTap: () {
                                setState(() {
                                  if (isGrades) {
                                    selectedGrade = item;
                                  } else {
                                    selectedTopic = item;
                                  }
                                  _updateSelectedChapters();
                                });
                                Navigator.pop(context);
                              },
                            );
                          },
                        ),
                      ),
                    ],
                  ),
                );
              },
            );
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
          onStart: (rangeIndex, timeMode, questionCount) {
            _startTraining(
              selectedChapter,
              rangeIndex,
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
    int rangeIndex,
    int timeMode,
    int questionCount,
  ) {
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

    return Scaffold(
      body: CustomScrollView(
        controller: _scrollController,
        slivers: [
          // App Bar
          MasterMenuAppBar(todayCorrect: todayCorrect, todayWrong: todayWrong),

          // Selection Dropdowns & Segmented Control
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(
                horizontal: 24.0,
                vertical: 12.0,
              ),
              child: LayoutBuilder(
                builder: (context, constraints) {
                  final isWide = constraints.maxWidth > 600;

                  final segmentedControl = Container(
                    width: isWide ? 280 : double.infinity,
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: theme.colorScheme.muted.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Row(
                      children: groupList.map((group) {
                        final isSelected = selectedGroup.key == group.key;
                        return Expanded(
                          child: GestureDetector(
                            onTap: () {
                              setState(() {
                                selectedGroup = group;
                                _updateSelectedChapters();
                              });
                            },
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 200),
                              curve: Curves.easeInOut,
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              decoration: BoxDecoration(
                                color: isSelected
                                    ? theme.colorScheme.background
                                    : Colors.transparent,
                                borderRadius: BorderRadius.circular(12),
                                boxShadow: isSelected
                                    ? [
                                        BoxShadow(
                                          color: Colors.black.withValues(
                                            alpha: 0.05,
                                          ),
                                          blurRadius: 4,
                                          offset: const Offset(0, 2),
                                        ),
                                      ]
                                    : [],
                              ),
                              child: Text(
                                group.title,
                                textAlign: TextAlign.center,
                                style: theme.textTheme.small.copyWith(
                                  fontWeight: isSelected
                                      ? FontWeight.bold
                                      : FontWeight.w500,
                                  color: isSelected
                                      ? theme.colorScheme.foreground
                                      : theme.colorScheme.mutedForeground,
                                ),
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  );

                  final pickerTrigger = ShadButton.outline(
                    onPressed: _showFilterPickerBottomSheet,
                    width: double.infinity,
                    height: 48,
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Icon(
                              selectedGroup.id == KeyGroup.grades.index
                                  ? Icons.school_rounded
                                  : Icons.topic_rounded,
                              color: theme.colorScheme.primary,
                              size: 18,
                            ),
                            const SizedBox(width: 8),
                            Text(
                              selectedGroup.id == KeyGroup.grades.index
                                  ? '${locale.group_grades}: '
                                  : '${locale.group_topics}: ',
                              style: theme.textTheme.small.copyWith(
                                color: theme.colorScheme.mutedForeground,
                              ),
                            ),
                            Text(
                              selectedGroup.id == KeyGroup.grades.index
                                  ? selectedGrade.title
                                  : selectedTopic.title,
                              style: theme.textTheme.small.copyWith(
                                fontWeight: FontWeight.bold,
                                color: theme.colorScheme.foreground,
                              ),
                            ),
                          ],
                        ),
                        Icon(
                          Icons.keyboard_arrow_down_rounded,
                          color: theme.colorScheme.mutedForeground,
                          size: 18,
                        ),
                      ],
                    ),
                  );

                  if (isWide) {
                    return Row(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        segmentedControl,
                        const SizedBox(width: 16),
                        Expanded(child: pickerTrigger),
                      ],
                    );
                  } else {
                    return Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        segmentedControl,
                        const SizedBox(height: 14),
                        pickerTrigger,
                      ],
                    );
                  }
                },
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
                          entry.key == KeyTopic.topicAddition
                              ? locale.topics_addition
                              : entry.key.name,
                          style: theme.textTheme.large.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
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
