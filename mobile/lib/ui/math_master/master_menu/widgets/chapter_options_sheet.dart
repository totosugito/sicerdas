import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/i18n/strings.g.dart';
import '../../libs/models/model_chapter.dart';
import 'package:flutter_math_fork/flutter_math.dart';

class ChapterOptionsSheet extends StatefulWidget {
  final ModelChapter selectedChapter;
  final Function(List<bool> selectedRanges, int timeMode, int questionCount)
  onStart;

  const ChapterOptionsSheet({
    super.key,
    required this.selectedChapter,
    required this.onStart,
  });

  @override
  State<ChapterOptionsSheet> createState() => _ChapterOptionsSheetState();
}

class _ChapterOptionsSheetState extends State<ChapterOptionsSheet> {
  late List<bool> _selectedRanges;
  final int _trainingTimeMode = 0; // 0 = no limit
  int _numberOfQuestions = 5; // default 5 questions

  @override
  void initState() {
    super.initState();
    _selectedRanges = List.generate(
      widget.selectedChapter.ranges.length,
      (index) => index == 0,
    );
  }

  Widget _buildOptionButton({
    required String label,
    required bool isSelected,
    required VoidCallback onPressed,
    required ShadThemeData theme,
  }) {
    if (isSelected) {
      return ShadButton(onPressed: onPressed, child: Text(label));
    }
    return ShadButton.outline(onPressed: onPressed, child: Text(label));
  }

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);
    final locale = Translations.of(context).math_master;
    final isDark = theme.brightness == Brightness.dark;

    return DraggableScrollableSheet(
      initialChildSize: 0.65,
      minChildSize: 0.4,
      maxChildSize: 0.95,
      expand: false,
      builder: (context, scrollController) {
        return SingleChildScrollView(
          controller: scrollController,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Handle bar
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  margin: const EdgeInsets.only(bottom: 20),
                  decoration: BoxDecoration(
                    color: theme.colorScheme.muted,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              Row(
                children: [
                  const SizedBox(width: 40),
                  Expanded(
                    child: Text(
                      widget.selectedChapter.title,
                      style: theme.textTheme.h3,
                      textAlign: TextAlign.center,
                    ),
                  ),
                  GestureDetector(
                    onTap: () => Navigator.pop(context),
                    child: Container(
                      width: 40,
                      height: 40,
                      decoration: const BoxDecoration(shape: BoxShape.circle),
                      child: Icon(
                        Icons.close_rounded,
                        color: theme.colorScheme.mutedForeground,
                        size: 20,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    locale.select_difficulty_text,
                    style: theme.textTheme.large.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  GestureDetector(
                    onTap: () {
                      setState(() {
                        final allSelected = _selectedRanges.every((val) => val);
                        if (allSelected) {
                          for (int i = 0; i < _selectedRanges.length; i++) {
                            _selectedRanges[i] = i == 0;
                          }
                        } else {
                          _selectedRanges.fillRange(
                            0,
                            _selectedRanges.length,
                            true,
                          );
                        }
                      });
                    },
                    child: Text(
                      _selectedRanges.every((val) => val)
                          ? locale.unselect_all
                          : locale.select_all,
                      style: theme.textTheme.small.copyWith(
                        color: theme.colorScheme.primary,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              // Ranges vertical list
              Container(
                decoration: BoxDecoration(
                  border: Border(
                    top: BorderSide(
                      color: theme.colorScheme.border.withValues(
                        alpha: isDark ? 0.25 : 0.45,
                      ),
                      width: 1.0,
                    ),
                  ),
                ),
                child: Column(
                  children: widget.selectedChapter.ranges.asMap().entries.map((
                    entry,
                  ) {
                    final index = entry.key;
                    final range = entry.value;
                    final isSelected = _selectedRanges[index];
                    return GestureDetector(
                      onTap: () {
                        setState(() {
                          final newSelected = !_selectedRanges[index];
                          // Prevent unselecting if it is the only one selected
                          if (!newSelected &&
                              _selectedRanges.where((val) => val).length <= 1) {
                            return;
                          }
                          _selectedRanges[index] = newSelected;
                        });
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          vertical: 12,
                          horizontal: 4,
                        ),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? theme.colorScheme.primary.withValues(
                                  alpha: isDark ? 0.08 : 0.04,
                                )
                              : Colors.transparent,
                          border: Border(
                            bottom: BorderSide(
                              color: theme.colorScheme.border.withValues(
                                alpha: isDark ? 0.25 : 0.45,
                              ),
                              width: 1.0,
                            ),
                          ),
                        ),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            // Custom checkbox indicator
                            Container(
                              width: 18,
                              height: 18,
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(4),
                                border: Border.all(
                                  color: isSelected
                                      ? theme.colorScheme.primary
                                      : theme.colorScheme.mutedForeground,
                                  width: 1.5,
                                ),
                                color: isSelected
                                    ? theme.colorScheme.primary
                                    : Colors.transparent,
                              ),
                              alignment: Alignment.center,
                              child: isSelected
                                  ? Icon(
                                      Icons.check_rounded,
                                      size: 12,
                                      color:
                                          theme.colorScheme.primaryForeground,
                                    )
                                  : null,
                            ),
                            const SizedBox(width: 12),
                            // Title & Typeset LaTeX Math description stacked
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    range.title,
                                    style: theme.textTheme.small.copyWith(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 13,
                                      color: theme.colorScheme.foreground,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Math.tex(
                                    range.desc,
                                    textStyle: TextStyle(
                                      fontSize: 12.5,
                                      color: theme.colorScheme.primary,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ),
              const SizedBox(height: 20),
              // Question Count
              Text(
                locale.number_of_questions,
                style: theme.textTheme.large.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              Row(
                children: [5, 10, 15, 20].map((qCount) {
                  return Padding(
                    padding: const EdgeInsets.only(right: 8.0),
                    child: _buildOptionButton(
                      label: locale.questions_count(count: qCount),
                      isSelected: _numberOfQuestions == qCount,
                      onPressed: () =>
                          setState(() => _numberOfQuestions = qCount),
                      theme: theme,
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 32),
              // Start Button
              ShadButton(
                size: ShadButtonSize.lg,
                onPressed: () {
                  Navigator.pop(context);
                  widget.onStart(
                    _selectedRanges,
                    _trainingTimeMode,
                    _numberOfQuestions,
                  );
                },
                child: Text(
                  locale.start_text,
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
