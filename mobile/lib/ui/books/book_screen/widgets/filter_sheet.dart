import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import '../../libs/providers/books_provider.dart';
import '../../../../core/database/database.dart';
import '../../../../l10n/gen_l10n/app_localizations.dart';
import '../../../widgets/loading_view.dart';

class FilterSheet extends ConsumerStatefulWidget {
  const FilterSheet({super.key});

  @override
  ConsumerState<FilterSheet> createState() => _FilterSheetState();
}

class _FilterSheetState extends ConsumerState<FilterSheet> {
  List<int>? _localGroupIds;

  @override
  void initState() {
    super.initState();
    final filter = ref.read(booksFilterProvider);
    _localGroupIds = filter.groupIds;
  }

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);
    final l10n = AppLocalizations.of(context)!;
    final groupsAsync = ref.watch(localGroupsProvider);

    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.sizeOf(context).height * 0.85,
      ),
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).padding.bottom + 16,
        top: 12,
        left: 24,
        right: 24,
      ),
      decoration: BoxDecoration(
        color: Theme.of(context).scaffoldBackgroundColor,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Stack(
        children: [
          SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Drag handle at top
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
                const SizedBox(height: 16),
                // Sheet Title
                Text(
                  l10n.filterTitle,
                  style: theme.textTheme.h4.copyWith(
                    fontWeight: FontWeight.bold,
                    color: theme.colorScheme.foreground,
                  ),
                ),
                const SizedBox(height: 24),

                // Group Filter
                Text(
                  l10n.filterGroup,
                  style: theme.textTheme.large.copyWith(
                    fontWeight: FontWeight.bold,
                    fontSize: 15,
                    color: theme.colorScheme.foreground,
                  ),
                ),
                const SizedBox(height: 12),
                groupsAsync.when(
                  data: (items) {
                    final sortedItems = List<BookGroup>.from(items)
                      ..sort((a, b) => a.name.compareTo(b.name));
                    return _FilterChipsMultiselect<int>(
                      items: sortedItems.map((e) => e.id).toList(),
                      labels: sortedItems.map((e) => e.name).toList(),
                      selectedValues: _localGroupIds ?? [],
                      onSelectedChanged: (vals) {
                        setState(() {
                          _localGroupIds = vals.isEmpty ? null : vals;
                        });
                      },
                    );
                  },
                  loading: () => const Padding(
                    padding: EdgeInsets.symmetric(vertical: 8.0),
                    child: LoadingView(size: 24),
                  ),
                  error: (_, _) => Padding(
                    padding: const EdgeInsets.symmetric(vertical: 8.0),
                    child: Text(
                      l10n.errorLoadingGroups,
                      style: theme.textTheme.muted.copyWith(
                        color: theme.colorScheme.destructive,
                      ),
                    ),
                  ),
                ),

                const SizedBox(height: 24),
                ShadButton(
                  width: double.infinity,
                  onPressed: () {
                    ref
                        .read(booksFilterProvider.notifier)
                        .update(
                          (state) => state.copyWith(
                            groupIds: _localGroupIds,
                            clearGroupIds: _localGroupIds == null,
                          ),
                        );
                    Navigator.pop(context);
                  },
                  child: Text(l10n.filterApply),
                ),
                const SizedBox(height: 16),
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

class _FilterChipsMultiselect<T> extends StatelessWidget {
  final List<T> items;
  final List<String> labels;
  final List<T> selectedValues;
  final Function(List<T>) onSelectedChanged;

  const _FilterChipsMultiselect({
    required this.items,
    required this.labels,
    required this.selectedValues,
    required this.onSelectedChanged,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final isAllSelected = selectedValues.isEmpty;

    return Wrap(
      spacing: 8.0,
      runSpacing: 8.0,
      children: [
        // "All" option chip
        _BadgeChip(
          label: l10n.filterAll,
          isSelected: isAllSelected,
          onTap: () {
            onSelectedChanged([]);
          },
        ),
        // Individual items
        ...List.generate(items.length, (index) {
          final item = items[index];
          final isSelected = selectedValues.contains(item);
          return _BadgeChip(
            label: labels[index],
            isSelected: isSelected,
            onTap: () {
              final newSelection = List<T>.from(selectedValues);
              if (isSelected) {
                newSelection.remove(item);
              } else {
                newSelection.add(item);
              }
              onSelectedChanged(newSelection);
            },
          );
        }),
      ],
    );
  }
}

class _BadgeChip extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _BadgeChip({
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: isSelected
          ? ShadBadge(
              backgroundColor: theme.colorScheme.primary.withValues(
                alpha: isDark ? 0.2 : 0.08,
              ),
              hoverBackgroundColor: theme.colorScheme.primary.withValues(
                alpha: isDark ? 0.25 : 0.12,
              ),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
                side: BorderSide(
                  color: theme.colorScheme.primary.withValues(
                    alpha: isDark ? 0.35 : 0.2,
                  ),
                  width: 1,
                ),
              ),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              child: Text(
                label,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: theme.colorScheme.primary,
                ),
              ),
            )
          : ShadBadge.outline(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              child: Text(
                label,
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
    );
  }
}
