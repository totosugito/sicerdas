import 'dart:async';
import 'package:flutter/material.dart';
import 'package:bse/l10n/gen_l10n/app_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/core/database/database.dart';
import 'package:bse/widgets/loading_view.dart';
import '../group_detail_screen.dart';

class FilterBar extends ConsumerStatefulWidget {
  final int groupId;
  const FilterBar({super.key, required this.groupId});

  @override
  ConsumerState<FilterBar> createState() => _FilterBarState();
}

class _FilterBarState extends ConsumerState<FilterBar> {
  late final TextEditingController _controller;
  Timer? _debounce;

  @override
  void initState() {
    super.initState();
    final filter = ref.read(groupDetailFilterProvider);
    _controller = TextEditingController(text: filter.search);
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _controller.dispose();
    super.dispose();
  }

  void _clearSearch() {
    _controller.clear();
    if (_debounce?.isActive ?? false) _debounce!.cancel();
    ref.read(groupDetailFilterProvider.notifier).updateSearch('');
    setState(() {});
  }

  void _showFilterSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _FilterSheet(groupId: widget.groupId),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final l10n = AppLocalizations.of(context)!;

    // Listen for filter changes from elsewhere (e.g. clear all in sheet) and sync controller
    ref.listen<GroupDetailFilter>(groupDetailFilterProvider, (previous, next) {
      if (next.search != _controller.text) {
        _controller.text = next.search;
        setState(() {}); // Rebuild to update clear button visibility
      }
    });

    final filter = ref.watch(groupDetailFilterProvider);
    final activeFilters =
        (filter.gradeIds.isNotEmpty ? 1 : 0) +
        (filter.sortBy != 'version' ? 1 : 0) +
        (!filter.descending ? 1 : 0);

    return Container(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
      decoration: BoxDecoration(
        color: theme.colorScheme.background,
        boxShadow: [
          if (!isDark)
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.02),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: ShadInput(
              controller: _controller,
              placeholder: Text(l10n.searchHintDetail),
              leading: Padding(
                padding: const EdgeInsets.only(right: 8),
                child: Icon(
                  Icons.search_rounded,
                  size: 18,
                  color: theme.colorScheme.mutedForeground,
                ),
              ),
              trailing: _controller.text.isNotEmpty
                  ? GestureDetector(
                      onTap: _clearSearch,
                      child: Icon(
                        Icons.close_rounded,
                        size: 18,
                        color: theme.colorScheme.mutedForeground,
                      ),
                    )
                  : null,
              onChanged: (val) {
                setState(
                  () {},
                ); // Rebuild to update clear button visibility immediately
                if (_debounce?.isActive ?? false) _debounce!.cancel();
                _debounce = Timer(const Duration(milliseconds: 400), () {
                  ref
                      .read(groupDetailFilterProvider.notifier)
                      .updateSearch(val);
                });
              },
              decoration: ShadDecoration(
                border: ShadBorder.all(
                  color: isDark
                      ? Colors.white.withValues(alpha: 0.1)
                      : Colors.black.withValues(alpha: 0.05),
                  width: 1,
                ),
              ),
            ),
          ),
          const SizedBox(width: 8),
          Badge(
            label: Text('$activeFilters'),
            isLabelVisible: activeFilters > 0,
            child: ShadButton.secondary(
              width: 42,
              height: 42,
              padding: EdgeInsets.zero,
              onPressed: () => _showFilterSheet(context),
              child: Icon(
                Icons.tune_rounded,
                size: 20,
                color: theme.colorScheme.primary,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _FilterSheet extends ConsumerStatefulWidget {
  final int groupId;
  const _FilterSheet({required this.groupId});

  @override
  ConsumerState<_FilterSheet> createState() => _FilterSheetState();
}

class _FilterSheetState extends ConsumerState<_FilterSheet> {
  late GroupDetailFilter pendingFilter;

  @override
  void initState() {
    super.initState();
    pendingFilter = ref.read(groupDetailFilterProvider);
  }

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);
    final l10n = AppLocalizations.of(context)!;
    final gradesAsync = ref.watch(groupGradesProvider(widget.groupId));

    // Automatically clear invalid grades from filters (both pending and global)
    ref.listen(groupGradesProvider(widget.groupId), (previous, next) {
      if (next is AsyncData<List<EducationGrade>>) {
        final availableIds = next.value.map((e) => e.id).toSet();

        // 1. Clean pending filter (local to sheet)
        final validPendingIds = pendingFilter.gradeIds
            .where((id) => availableIds.contains(id))
            .toList();
        if (validPendingIds.length != pendingFilter.gradeIds.length) {
          setState(() {
            pendingFilter = pendingFilter.copyWith(gradeIds: validPendingIds);
          });
        }

        // 2. Clean global filter (affects background list)
        final globalFilter = ref.read(groupDetailFilterProvider);
        final validGlobalIds = globalFilter.gradeIds
            .where((id) => availableIds.contains(id))
            .toList();
        if (validGlobalIds.length != globalFilter.gradeIds.length) {
          ref
              .read(groupDetailFilterProvider.notifier)
              .updateAll(globalFilter.copyWith(gradeIds: validGlobalIds));
        }
      }
    });

    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.sizeOf(context).height * 0.85,
      ),
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).padding.bottom + 24,
        top: 12,
        left: 24,
        right: 24,
      ),
      decoration: BoxDecoration(
        color: theme.colorScheme.background,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 20,
            offset: const Offset(0, -5),
          ),
        ],
      ),
      child: Stack(
        children: [
          SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: theme.colorScheme.border,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(l10n.filterTitle, style: theme.textTheme.h4),
                    if (pendingFilter.gradeIds.isNotEmpty ||
                        pendingFilter.sortBy != 'version' ||
                        !pendingFilter.descending)
                      TextButton(
                        onPressed: () {
                          setState(() {
                            pendingFilter = GroupDetailFilter(
                              search: pendingFilter.search,
                            );
                          });
                        },
                        child: Text(l10n.filterClearAll),
                      ),
                  ],
                ),
                const SizedBox(height: 24),

                // Grade Filter (Multi-select)
                Text(
                  l10n.filterGrade,
                  style: theme.textTheme.small.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 12),
                gradesAsync.when(
                  data: (grades) {
                    return Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        _FilterToggleChip(
                          label: l10n.seeAll,
                          selected: pendingFilter.gradeIds.isEmpty,
                          onTap: () {
                            setState(() {
                              pendingFilter = pendingFilter.copyWith(
                                gradeIds: [],
                              );
                            });
                          },
                        ),
                        ...grades.map((grade) {
                          final isSelected = pendingFilter.gradeIds.contains(
                            grade.id,
                          );
                          return _FilterToggleChip(
                            label: grade.name,
                            selected: isSelected,
                            onTap: () {
                              setState(() {
                                final newIds = List<int>.from(
                                  pendingFilter.gradeIds,
                                );
                                if (isSelected) {
                                  newIds.remove(grade.id);
                                } else {
                                  newIds.add(grade.id);
                                }
                                pendingFilter = pendingFilter.copyWith(
                                  gradeIds: newIds,
                                );
                              });
                            },
                          );
                        }),
                      ],
                    );
                  },
                  loading: () => const Padding(
                    padding: EdgeInsets.symmetric(vertical: 8.0),
                    child: LoadingView(size: 24),
                  ),
                  error: (err, stack) => Padding(
                    padding: const EdgeInsets.symmetric(vertical: 8.0),
                    child: Text(
                      '${l10n.errorGeneric}: $err',
                      style: theme.textTheme.muted.copyWith(
                        color: theme.colorScheme.destructive,
                      ),
                    ),
                  ),
                ),

                const SizedBox(height: 24),

                // Sort By
                Text(
                  l10n.sortBy,
                  style: theme.textTheme.small.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 12),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    _SortChip(
                      label: l10n.sortByVersion,
                      icon: Icons.update_rounded,
                      selected: pendingFilter.sortBy == 'version',
                      onTap: () => setState(
                        () => pendingFilter = pendingFilter.copyWith(
                          sortBy: 'version',
                        ),
                      ),
                    ),
                    _SortChip(
                      label: l10n.sortByTitle,
                      icon: Icons.sort_by_alpha_rounded,
                      selected: pendingFilter.sortBy == 'title',
                      onTap: () => setState(
                        () => pendingFilter = pendingFilter.copyWith(
                          sortBy: 'title',
                        ),
                      ),
                    ),
                    _SortChip(
                      label: l10n.sortByYear,
                      icon: Icons.calendar_today_rounded,
                      selected: pendingFilter.sortBy == 'publishedYear',
                      onTap: () => setState(
                        () => pendingFilter = pendingFilter.copyWith(
                          sortBy: 'publishedYear',
                        ),
                      ),
                    ),
                    _SortChip(
                      label: l10n.sortByPages,
                      icon: Icons.auto_stories_rounded,
                      selected: pendingFilter.sortBy == 'totalPages',
                      onTap: () => setState(
                        () => pendingFilter = pendingFilter.copyWith(
                          sortBy: 'totalPages',
                        ),
                      ),
                    ),
                    _SortChip(
                      label: l10n.sortBySize,
                      icon: Icons.storage_rounded,
                      selected: pendingFilter.sortBy == 'size',
                      onTap: () => setState(
                        () => pendingFilter = pendingFilter.copyWith(
                          sortBy: 'size',
                        ),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 24),

                // Order Toggle
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      l10n.orderLabel,
                      style: theme.textTheme.small.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Row(
                      children: [
                        Text(
                          pendingFilter.descending
                              ? l10n.orderDescending
                              : l10n.orderAscending,
                          style: theme.textTheme.muted.copyWith(fontSize: 12),
                        ),
                        const SizedBox(width: 12),
                        Switch(
                          value: pendingFilter.descending,
                          onChanged: (val) => setState(
                            () => pendingFilter = pendingFilter.copyWith(
                              descending: val,
                            ),
                          ),
                          activeTrackColor: theme.colorScheme.primary,
                        ),
                      ],
                    ),
                  ],
                ),

                const SizedBox(height: 24),
                ShadButton(
                  width: double.infinity,
                  onPressed: () {
                    ref
                        .read(groupDetailFilterProvider.notifier)
                        .updateAll(pendingFilter);
                    Navigator.pop(context);
                  },
                  child: Text(l10n.filterApply),
                ),
              ],
            ),
          ),
          Positioned(
            right: 0,
            top: 0,
            child: ShadButton.ghost(
              width: 32,
              height: 32,
              padding: EdgeInsets.zero,
              onPressed: () => Navigator.pop(context),
              child: Icon(
                Icons.close_rounded,
                size: 20,
                color: theme.colorScheme.mutedForeground,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _FilterToggleChip extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const _FilterToggleChip({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: selected
              ? theme.colorScheme.primary
              : theme.colorScheme.muted.withValues(alpha: 0.5),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: selected ? FontWeight.bold : FontWeight.w500,
            color: selected
                ? theme.colorScheme.primaryForeground
                : theme.colorScheme.foreground,
          ),
        ),
      ),
    );
  }
}

class _SortChip extends StatelessWidget {
  final String label;
  final IconData icon;
  final bool selected;
  final VoidCallback onTap;

  const _SortChip({
    required this.label,
    required this.icon,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: selected
              ? theme.colorScheme.primary.withValues(alpha: 0.1)
              : Colors.transparent,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: selected
                ? theme.colorScheme.primary
                : theme.colorScheme.border,
            width: 1.5,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              size: 16,
              color: selected
                  ? theme.colorScheme.primary
                  : theme.colorScheme.mutedForeground,
            ),
            const SizedBox(width: 8),
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: selected ? FontWeight.bold : FontWeight.w500,
                color: selected
                    ? theme.colorScheme.primary
                    : theme.colorScheme.mutedForeground,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
