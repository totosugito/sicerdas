import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import '../../../../l10n/gen_l10n/app_localizations.dart';
import 'comparison_models.dart';

class ComparisonFilterSheet extends StatefulWidget {
  final String initialSortBy;
  final String initialSortDirection;
  final List<PropertyDef> properties;
  final Function(String sortBy, String sortDirection) onApply;

  const ComparisonFilterSheet({
    super.key,
    required this.initialSortBy,
    required this.initialSortDirection,
    required this.properties,
    required this.onApply,
  });

  @override
  State<ComparisonFilterSheet> createState() => _ComparisonFilterSheetState();
}

class _ComparisonFilterSheetState extends State<ComparisonFilterSheet> {
  late String _tempSortBy;
  late String _tempSortDirection;

  @override
  void initState() {
    super.initState();
    _tempSortBy = widget.initialSortBy;
    _tempSortDirection = widget.initialSortDirection;
  }

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);
    final l10n = AppLocalizations.of(context)!;

    return Container(
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
              if (_tempSortBy != 'atomicWeight' || _tempSortDirection != 'auto')
                TextButton(
                  onPressed: () {
                    setState(() {
                      _tempSortBy = 'atomicWeight';
                      _tempSortDirection = 'auto';
                    });
                  },
                  child: Text(l10n.filterClearAll),
                ),
            ],
          ),
          const SizedBox(height: 24),
          Text(
            l10n.elementComparisonSortBy,
            style: theme.textTheme.small.copyWith(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: widget.properties.map((p) {
              final isSelected = _tempSortBy == p.key;
              return GestureDetector(
                onTap: () {
                  setState(() {
                    _tempSortBy = p.key;
                  });
                },
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 150),
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 8,
                  ),
                  decoration: BoxDecoration(
                    color: isSelected
                        ? theme.colorScheme.primary
                        : theme.colorScheme.muted.withValues(alpha: 0.5),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    p.getLabel(l10n),
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: isSelected
                          ? FontWeight.bold
                          : FontWeight.w500,
                      color: isSelected
                          ? theme.colorScheme.primaryForeground
                          : theme.colorScheme.foreground,
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
          const SizedBox(height: 24),
          Text(
            l10n.elementComparisonSortDirection,
            style: theme.textTheme.small.copyWith(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              for (final direction in ['auto', 'asc', 'desc'])
                Padding(
                  padding: const EdgeInsets.only(right: 8.0),
                  child: GestureDetector(
                    onTap: () {
                      setState(() {
                        _tempSortDirection = direction;
                      });
                    },
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 150),
                      padding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 8,
                      ),
                      decoration: BoxDecoration(
                        color: _tempSortDirection == direction
                            ? theme.colorScheme.primary
                            : theme.colorScheme.muted.withValues(alpha: 0.5),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        direction == 'asc'
                            ? l10n.elementComparisonSortAsc
                            : direction == 'desc'
                            ? l10n.elementComparisonSortDesc
                            : l10n.elementComparisonSortAuto,
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: _tempSortDirection == direction
                              ? FontWeight.bold
                              : FontWeight.w500,
                          color: _tempSortDirection == direction
                              ? theme.colorScheme.primaryForeground
                              : theme.colorScheme.foreground,
                        ),
                      ),
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 24),
          ShadButton(
            width: double.infinity,
            onPressed: () {
              widget.onApply(_tempSortBy, _tempSortDirection);
              Navigator.pop(context);
            },
            child: Text(l10n.filterApply),
          ),
        ],
      ),
    );
  }
}
