import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import '../../libs/models/enums.dart';
import '../../libs/models/model_item.dart';

class FilterPickerSheet extends StatefulWidget {
  final List<ModelItem> groupList;
  final ModelItem selectedGroup;
  final List<ModelItem> gradeList;
  final List<ModelItem> topicList;
  final ModelItem selectedGrade;
  final ModelItem selectedTopic;
  final void Function(ModelItem group, ModelItem item) onSelected;

  const FilterPickerSheet({
    super.key,
    required this.groupList,
    required this.selectedGroup,
    required this.gradeList,
    required this.topicList,
    required this.selectedGrade,
    required this.selectedTopic,
    required this.onSelected,
  });

  @override
  State<FilterPickerSheet> createState() => _FilterPickerSheetState();
}

class _FilterPickerSheetState extends State<FilterPickerSheet> {
  late ModelItem _selectedGroup;

  @override
  void initState() {
    super.initState();
    _selectedGroup = widget.selectedGroup;
  }

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return DraggableScrollableSheet(
      initialChildSize: 0.6,
      minChildSize: 0.4,
      maxChildSize: 0.85,
      expand: false,
      builder: (context, scrollController) {
        final isGrades = _selectedGroup.id == KeyGroup.grades.index;
        final currentList = isGrades ? widget.gradeList : widget.topicList;
        final currentSelectedItem = isGrades ? widget.selectedGrade : widget.selectedTopic;

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
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: isDark
                      ? theme.colorScheme.muted.withValues(alpha: 0.25)
                      : theme.colorScheme.muted.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Row(
                  children: widget.groupList.map((group) {
                    final isSelected = _selectedGroup.key == group.key;
                    return Expanded(
                      child: GestureDetector(
                        onTap: () {
                          setState(() {
                            _selectedGroup = group;
                          });
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          decoration: BoxDecoration(
                            color: isSelected
                                ? (isDark
                                    ? theme.colorScheme.card
                                    : theme.colorScheme.background)
                                : Colors.transparent,
                            borderRadius: BorderRadius.circular(12),
                            boxShadow: isSelected
                                ? [
                                    BoxShadow(
                                      color: isDark
                                          ? Colors.black.withValues(alpha: 0.3)
                                          : Colors.black.withValues(alpha: 0.05),
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
                              fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
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
              ),
              const SizedBox(height: 16),
              Expanded(
                child: ListView.builder(
                  controller: scrollController,
                  itemCount: currentList.length,
                  itemBuilder: (context, index) {
                    final item = currentList[index];
                    final isSelected = currentSelectedItem.key == item.key;
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
                        widget.onSelected(_selectedGroup, item);
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
  }
}

