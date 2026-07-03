import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/i18n/strings.g.dart';
import '../../libs/models/model_chapter.dart';

class ChapterOptionsSheet extends StatefulWidget {
  final ModelChapter selectedChapter;
  final Function(int rangeIndex, int timeMode, int questionCount) onStart;

  const ChapterOptionsSheet({
    super.key,
    required this.selectedChapter,
    required this.onStart,
  });

  @override
  State<ChapterOptionsSheet> createState() => _ChapterOptionsSheetState();
}

class _ChapterOptionsSheetState extends State<ChapterOptionsSheet> {
  int _selectedRangeIndex = 0;
  final int _trainingTimeMode = 0; // 0 = no limit
  int _numberOfQuestions = 5; // default 5 questions

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

    return DraggableScrollableSheet(
      initialChildSize: 0.55,
      minChildSize: 0.4,
      maxChildSize: 0.85,
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
              Text(
                widget.selectedChapter.title,
                style: theme.textTheme.h3,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              Text(
                locale.select_difficulty_text,
                style: theme.textTheme.large.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              // Ranges Chips
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: widget.selectedChapter.ranges.asMap().entries.map((
                  entry,
                ) {
                  final index = entry.key;
                  final range = entry.value;
                  final isSelected = _selectedRangeIndex == index;
                  return ChoiceChip(
                    label: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(range.title),
                        const SizedBox(height: 2),
                        Text(
                          range.desc,
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.normal,
                            color: isSelected
                                ? theme.colorScheme.primaryForeground
                                      .withValues(alpha: 0.8)
                                : theme.colorScheme.mutedForeground,
                          ),
                        ),
                      ],
                    ),
                    selected: isSelected,
                    selectedColor: theme.colorScheme.primary,
                    labelStyle: TextStyle(
                      color: isSelected
                          ? theme.colorScheme.primaryForeground
                          : theme.colorScheme.foreground,
                      fontWeight: FontWeight.bold,
                    ),
                    onSelected: (val) {
                      if (val) {
                        setState(() => _selectedRangeIndex = index);
                      }
                    },
                  );
                }).toList(),
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
                    _selectedRangeIndex,
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
