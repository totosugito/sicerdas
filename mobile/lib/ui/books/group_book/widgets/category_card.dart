import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import '../../../../core/database/database.dart';
import '../../../../core/providers/books_provider.dart';
import '../../../../l10n/gen_l10n/app_localizations.dart';
import 'group_item.dart';

class CategoryCard extends ConsumerWidget {
  final Category category;
  final List<BookGroupWithMetadata> groups;
  final int index;

  const CategoryCard({
    super.key,
    required this.category,
    required this.groups,
    required this.index,
  });

  static const List<List<Color>> _gradients = [
    [Color(0xFF6366F1), Color(0xFF8B5CF6)], // Indigo-Violet
    [Color(0xFFF59E0B), Color(0xFFD97706)], // Amber-Orange
    [Color(0xFFEC4899), Color(0xFFDB2777)], // Pink-Rose
    [Color(0xFF10B981), Color(0xFF059669)], // Emerald-Green
    [Color(0xFF3B82F6), Color(0xFF2563EB)], // Blue-Royal
    [Color(0xFF8B5CF6), Color(0xFF7C3AED)], // Violet-Purple
    [Color(0xFFF43F5E), Color(0xFFE11D48)], // Rose-Red
    [Color(0xFF06B6D4), Color(0xFF0891B2)], // Cyan-Teal
    [Color(0xFF84CC16), Color(0xFF65A30D)], // Lime-Green
    [Color(0xFF64748B), Color(0xFF475569)], // Slate-Gray
    [Color(0xFFD946EF), Color(0xFFC026D3)], // Fuchsia-Purple
    [Color(0xFF14B8A6), Color(0xFF0D9488)], // Teal-Emerald
  ];

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = ShadTheme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final gradient = _gradients[index % _gradients.length];
    final l10n = AppLocalizations.of(context)!;

    final expandAll = ref.watch(groupBookExpandAllProvider);
    final expansionStates = ref.watch(categoryExpansionProvider);
    final isExpanded = expansionStates[category.id] ?? expandAll;

    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: Column(
        children: [
          GestureDetector(
            onTap: () {
              ref
                  .read(categoryExpansionProvider.notifier)
                  .setExpanded(category.id, !isExpanded);
            },
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: isDark
                    ? gradient[0].withValues(alpha: 0.1)
                    : Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: isDark
                      ? gradient[0].withValues(alpha: 0.3)
                      : gradient[0].withValues(alpha: 0.1),
                  width: 1,
                ),
                boxShadow: [
                  BoxShadow(
                    color: gradient[0].withValues(alpha: isDark ? 0.0 : 0.05),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      category.name,
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: isDark
                            ? Colors.white.withValues(alpha: 0.9)
                            : Colors.black87,
                      ),
                    ),
                  ),
                  Container(
                    margin: const EdgeInsets.only(right: 8),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 7,
                      vertical: 2,
                    ),
                    decoration: BoxDecoration(
                      color: theme.colorScheme.muted,
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      '${groups.length}',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: theme.colorScheme.mutedForeground,
                      ),
                    ),
                  ),
                  Icon(
                    isExpanded
                        ? Icons.expand_less_rounded
                        : Icons.expand_more_rounded,
                    color: isDark
                        ? Colors.white.withValues(alpha: 0.5)
                        : Colors.black45,
                  ),
                ],
              ),
            ),
          ),
          if (isExpanded)
            Padding(
              padding: const EdgeInsets.only(top: 8.0, left: 8.0, right: 8.0),
              child: Column(
                children: [
                  if (groups.isEmpty)
                    Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Text(
                        l10n.noGroupsInCategory,
                        style: theme.textTheme.muted.copyWith(fontSize: 12),
                      ),
                    )
                  else
                    ...groups.map(
                      (group) => GroupItem(group: group, color: gradient[0]),
                    ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}
