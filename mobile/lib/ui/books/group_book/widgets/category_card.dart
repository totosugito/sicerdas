import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import '../../../../core/database/database.dart';
import '../../../../l10n/gen_l10n/app_localizations.dart';
import 'group_item.dart';

class CategoryCard extends StatefulWidget {
  final Category category;
  final List<BookGroup> groups;
  final int index;

  const CategoryCard({
    super.key,
    required this.category,
    required this.groups,
    required this.index,
  });

  @override
  State<CategoryCard> createState() => _CategoryCardState();
}

class _CategoryCardState extends State<CategoryCard> {
  bool _isExpanded = false;

  final List<List<Color>> _gradients = [
    [const Color(0xFF6366F1), const Color(0xFF8B5CF6)], // Indigo-Violet
    [const Color(0xFFF59E0B), const Color(0xFFD97706)], // Amber-Orange
    [const Color(0xFFEC4899), const Color(0xFFDB2777)], // Pink-Rose
    [const Color(0xFF10B981), const Color(0xFF059669)], // Emerald-Green
    [const Color(0xFF3B82F6), const Color(0xFF2563EB)], // Blue-Royal
    [const Color(0xFF8B5CF6), const Color(0xFF7C3AED)], // Violet-Purple
    [const Color(0xFFF43F5E), const Color(0xFFE11D48)], // Rose-Red
    [const Color(0xFF06B6D4), const Color(0xFF0891B2)], // Cyan-Teal
    [const Color(0xFF84CC16), const Color(0xFF65A30D)], // Lime-Green
    [const Color(0xFF64748B), const Color(0xFF475569)], // Slate-Gray
    [const Color(0xFFD946EF), const Color(0xFFC026D3)], // Fuchsia-Purple
    [const Color(0xFF14B8A6), const Color(0xFF0D9488)], // Teal-Emerald
  ];

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final gradient = _gradients[widget.index % _gradients.length];
    final l10n = AppLocalizations.of(context)!;

    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: Column(
        children: [
          GestureDetector(
            onTap: () => setState(() => _isExpanded = !_isExpanded),
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: isDark ? gradient[0].withValues(alpha: 0.1) : Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: isDark ? gradient[0].withValues(alpha: 0.3) : gradient[0].withValues(alpha: 0.1),
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
                      widget.category.name,
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: isDark ? Colors.white.withValues(alpha: 0.9) : Colors.black87,
                      ),
                    ),
                  ),
                  Icon(
                    _isExpanded ? Icons.expand_less_rounded : Icons.expand_more_rounded,
                    color: isDark ? Colors.white.withValues(alpha: 0.5) : Colors.black45,
                  ),
                ],
              ),
            ),
          ),
          if (_isExpanded)
            Padding(
              padding: const EdgeInsets.only(top: 8.0, left: 8.0, right: 8.0),
              child: Column(
                children: [
                  if (widget.groups.isEmpty)
                    Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Text(
                        l10n.noGroupsInCategory,
                        style: theme.textTheme.muted.copyWith(fontSize: 12),
                      ),
                    )
                  else
                    ...widget.groups.asMap().entries.map(
                          (entry) => GroupItem(group: entry.value, itemIndex: entry.key),
                        ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}
