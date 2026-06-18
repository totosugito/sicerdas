import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/i18n/strings.g.dart';

class ComparisonAppBar extends StatelessWidget {
  final TextEditingController searchController;
  final int activeFilters;
  final VoidCallback onFilterTap;

  const ComparisonAppBar({
    super.key,
    required this.searchController,
    required this.activeFilters,
    required this.onFilterTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);
    final l10n = Translations.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return SliverAppBar(
      expandedHeight: 200.0,
      pinned: true,
      backgroundColor: isDark
          ? theme.colorScheme.card
          : theme.colorScheme.primary,
      iconTheme: const IconThemeData(color: Colors.white),
      flexibleSpace: FlexibleSpaceBar(
        title: Text(
          l10n.common.elementComparisonTitle,
          style: const TextStyle(
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        titlePadding: const EdgeInsets.only(left: 48, bottom: 76),
        background: Container(
          decoration: BoxDecoration(
            color: isDark ? theme.colorScheme.card : theme.colorScheme.primary,
          ),
          child: Stack(
            children: [
              Positioned(
                right: -10,
                bottom: 35,
                child: Icon(
                  LucideIcons.gitCompare,
                  size: 90,
                  color: Colors.white.withValues(alpha: 0.15),
                ),
              ),
            ],
          ),
        ),
      ),
      bottom: PreferredSize(
        preferredSize: const Size.fromHeight(62.0),
        child: Container(
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
          child: Padding(
            padding: EdgeInsets.only(top: 2),
            child: Row(
              children: [
                Expanded(
                  child: ShadInput(
                    controller: searchController,
                    placeholder: Text(
                      l10n.common.elementComparisonSearchPlaceholder,
                    ),
                    leading: const Padding(
                      padding: EdgeInsets.only(right: 8),
                      child: Icon(LucideIcons.search, size: 16),
                    ),
                    trailing: searchController.text.isNotEmpty
                        ? GestureDetector(
                            onTap: () => searchController.clear(),
                            child: const Icon(LucideIcons.x, size: 16),
                          )
                        : null,
                  ),
                ),
                const SizedBox(width: 8),
                Badge(
                  label: Text('$activeFilters'),
                  isLabelVisible: activeFilters > 0,
                  child: ShadButton.secondary(
                    width: 38,
                    height: 38,
                    padding: EdgeInsets.zero,
                    onPressed: onFilterTap,
                    child: Icon(
                      LucideIcons.slidersHorizontal,
                      size: 20,
                      color: theme.colorScheme.primary,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
