import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import '../../../core/database/database.dart';
import '../../../l10n/gen_l10n/app_localizations.dart';
import '../../../core/providers/settings_provider.dart';
import '../element_detail/element_detail.dart';
import '../libs/providers/periodic_sync_provider.dart';
import '../periodic_screen/widgets/element_overview_sheet.dart';
import 'widgets/element_comparison_card.dart';

class PropertyDef {
  final String key;
  final String Function(AppLocalizations) getLabel;
  PropertyDef(this.key, this.getLabel);
}

class _ElementWithProps {
  final PeriodicElement element;
  final Map<String, dynamic> properties;
  _ElementWithProps(this.element, this.properties);
}

// Memoize the JSON parsing so it ONLY runs when periodicSyncState changes
final _parsedElementsProvider = Provider<List<_ElementWithProps>>((ref) {
  final syncState = ref.watch(periodicSyncProvider);
  return syncState.elements
      .where((e) {
        return e.atomicNumber >= 1 && e.atomicNumber <= 200;
      })
      .map((e) {
        Map<String, dynamic> props = {};
        try {
          final decoded = jsonDecode(e.atomicProperties);
          if (decoded is Map<String, dynamic>) {
            props = decoded;
          }
        } catch (_) {}
        return _ElementWithProps(e, props);
      })
      .where((ep) => ep.properties.isNotEmpty)
      .toList();
});

class ElementComparisonScreen extends ConsumerStatefulWidget {
  const ElementComparisonScreen({super.key});

  @override
  ConsumerState<ElementComparisonScreen> createState() =>
      _ElementComparisonScreenState();
}

class _ElementComparisonScreenState
    extends ConsumerState<ElementComparisonScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';
  String _sortBy = 'atomicWeight';
  String _sortDirection = 'none';

  final List<PropertyDef> _properties = [
    PropertyDef('atomicWeight', (l10n) => l10n.atomicWeight),
    PropertyDef('numberOfElectron', (l10n) => l10n.electrons),
    PropertyDef('meltingPoint', (l10n) => l10n.meltingPoint),
    PropertyDef('boilingPoint', (l10n) => l10n.boilingPoint),
    PropertyDef('density', (l10n) => l10n.density),
    PropertyDef('molarVolume', (l10n) => l10n.molarVolume),
    PropertyDef('bulkModulus', (l10n) => l10n.bulkModulus),
    PropertyDef('shearModulus', (l10n) => l10n.shearModulus),
    PropertyDef('youngModulus', (l10n) => l10n.youngModulus),
    PropertyDef('electronegativity', (l10n) => l10n.electronegativity),
    PropertyDef(
      'electricalConductivity',
      (l10n) => l10n.electricalConductivity,
    ),
    PropertyDef('resistivity', (l10n) => l10n.resistivity),
    PropertyDef('atomicRadius', (l10n) => l10n.atomicRadius),
    PropertyDef('vanDerWaalsRadius', (l10n) => l10n.vanDerWaalsRadius),
  ];

  @override
  void initState() {
    super.initState();
    _searchController.addListener(() {
      setState(() {
        _searchQuery = _searchController.text.trim().toLowerCase();
      });
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  double? _getPropertyValue(Map<String, dynamic> properties, String key) {
    final val = properties[key];
    if (val == null || val == 'null' || val == 'undefined') return null;
    final valStr = val.toString().trim();
    if (valStr.isEmpty || valStr == 'null' || valStr == 'undefined') {
      return null;
    }
    return double.tryParse(valStr);
  }

  void _showOverview(PeriodicElement element, String periodicTheme) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => ElementOverviewSheet(
        element: element,
        theme: periodicTheme,
        onViewDetails: () {
          Navigator.pop(context); // close sheet
          final byNumber = {
            for (final e in ref.read(periodicSyncProvider).elements)
              e.atomicNumber: e,
          };
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => ElementDetailScreen(
                element: element,
                previous: byNumber[element.atomicNumber - 1],
                next: byNumber[element.atomicNumber + 1],
              ),
            ),
          );
        },
      ),
    );
  }

  void _showFilterSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _FilterSheet(
        initialSortBy: _sortBy,
        initialSortDirection: _sortDirection,
        properties: _properties,
        onApply: (sortBy, sortDirection) {
          setState(() {
            _sortBy = sortBy;
            _sortDirection = sortDirection;
          });
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);
    final l10n = AppLocalizations.of(context)!;
    final parsedElements = ref.watch(_parsedElementsProvider);
    final settings = ref.watch(settingsProvider);
    final periodicTheme = settings.periodicTheme;
    final isDark = theme.brightness == Brightness.dark;

    var filtered = parsedElements;
    if (_searchQuery.isNotEmpty) {
      filtered = filtered.where((ep) {
        return ep.element.atomicName.toLowerCase().contains(_searchQuery) ||
            ep.element.atomicSymbol.toLowerCase().contains(_searchQuery) ||
            ep.element.atomicNumber.toString().contains(_searchQuery);
      }).toList();
    }

    final sorted = List<_ElementWithProps>.from(filtered);
    sorted.sort((a, b) {
      int comparison = 0;
      final sortBy_ = _sortDirection == 'none' ? 'atomicNumber' : _sortBy;

      if (sortBy_ == 'atomicNumber') {
        comparison = a.element.atomicNumber.compareTo(b.element.atomicNumber);
      } else {
        final propA = _getPropertyValue(a.properties, sortBy_);
        final propB = _getPropertyValue(b.properties, sortBy_);

        if (propA != null && propB != null) {
          comparison = propA.compareTo(propB);
        } else if (propA != null) {
          comparison = 1;
        } else if (propB != null) {
          comparison = -1;
        } else {
          comparison = 0;
        }
      }

      if (_sortDirection == 'desc') {
        return -comparison;
      }
      return comparison;
    });

    double maxVal = 1.0;
    for (final ep in sorted) {
      final val = _getPropertyValue(ep.properties, _sortBy);
      if (val != null && val > maxVal) {
        maxVal = val;
      }
    }

    final activeFilters =
        (_sortBy != 'atomicWeight' ? 1 : 0) +
        (_sortDirection != 'none' ? 1 : 0);

    return Scaffold(
      backgroundColor: theme.colorScheme.background,
      body: CustomScrollView(
        slivers: [
          // Collapsible Hero Banner AppBar with Pinned Search & Filter Row
          SliverAppBar(
            expandedHeight: 180.0,
            pinned: true,
            backgroundColor: isDark
                ? theme.colorScheme.card
                : theme.colorScheme.primary,
            iconTheme: const IconThemeData(color: Colors.white),
            flexibleSpace: FlexibleSpaceBar(
              title: Text(
                l10n.elementComparisonTitle,
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              titlePadding: const EdgeInsets.only(left: 48, bottom: 76),
              background: Container(
                decoration: BoxDecoration(
                  color: isDark
                      ? theme.colorScheme.card
                      : theme.colorScheme.primary,
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
                child: Row(
                  children: [
                    Expanded(
                      child: ShadInput(
                        controller: _searchController,
                        placeholder: Text(
                          l10n.elementComparisonSearchPlaceholder,
                        ),
                        leading: const Padding(
                          padding: EdgeInsets.only(right: 8),
                          child: Icon(LucideIcons.search, size: 16),
                        ),
                        trailing: _searchController.text.isNotEmpty
                            ? GestureDetector(
                                onTap: () => _searchController.clear(),
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
                        onPressed: () => _showFilterSheet(context),
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

          // Metadata count
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 8),
              child: Text(
                _searchQuery.isNotEmpty
                    ? l10n.elementComparisonElementsFoundMatching(
                        sorted.length,
                        _searchQuery,
                      )
                    : l10n.elementComparisonElementsFound(sorted.length),
                style: theme.textTheme.small.copyWith(
                  color: theme.colorScheme.mutedForeground,
                ),
                textAlign: TextAlign.center,
              ),
            ),
          ),

          // Comparison List
          sorted.isEmpty
              ? SliverFillRemaining(
                  hasScrollBody: false,
                  child: Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          LucideIcons.fileSearch,
                          size: 48,
                          color: theme.colorScheme.mutedForeground,
                        ),
                        const SizedBox(height: 16),
                        Text(
                          l10n.elementComparisonNoElementsFound,
                          style: theme.textTheme.large.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          _searchQuery.isNotEmpty
                              ? l10n.elementComparisonNoElementsFoundMatching(
                                  _searchQuery,
                                )
                              : l10n.elementComparisonNoElementsFound,
                          style: theme.textTheme.muted,
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  ),
                )
              : SliverPadding(
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
                  sliver: SliverList(
                    delegate: SliverChildBuilderDelegate((context, index) {
                      final ep = sorted[index];
                      final value =
                          _getPropertyValue(ep.properties, _sortBy) ?? 0.0;
                      final double rawPercent = (maxVal > 0
                          ? (value / maxVal)
                          : 0.0);
                      final percent =
                          (rawPercent.isNaN || rawPercent.isInfinite)
                          ? 0.0
                          : rawPercent.clamp(0.0, 1.0);

                      return ElementComparisonCard(
                        element: ep.element,
                        periodicTheme: periodicTheme,
                        sortBy: _sortBy,
                        value: value,
                        percent: percent,
                        isDark: isDark,
                        onTap: () => _showOverview(ep.element, periodicTheme),
                      );
                    }, childCount: sorted.length),
                  ),
                ),
        ],
      ),
    );
  }
}

class _FilterSheet extends StatefulWidget {
  final String initialSortBy;
  final String initialSortDirection;
  final List<PropertyDef> properties;
  final Function(String sortBy, String sortDirection) onApply;

  const _FilterSheet({
    required this.initialSortBy,
    required this.initialSortDirection,
    required this.properties,
    required this.onApply,
  });

  @override
  State<_FilterSheet> createState() => _FilterSheetState();
}

class _FilterSheetState extends State<_FilterSheet> {
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
              if (_tempSortBy != 'atomicWeight' || _tempSortDirection != 'none')
                TextButton(
                  onPressed: () {
                    setState(() {
                      _tempSortBy = 'atomicWeight';
                      _tempSortDirection = 'none';
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
              for (final direction in ['none', 'asc', 'desc'])
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
                            : l10n.elementComparisonSortNone,
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
