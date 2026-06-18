import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/core/database/database.dart';
import 'package:bse/i18n/strings.g.dart';
import '../libs/providers/periodic_provider.dart';
import '../element_detail/element_detail.dart';
import '../libs/providers/periodic_sync_provider.dart';
import '../periodic_screen/widgets/element_overview_sheet.dart';
import 'widgets/comparison_app_bar.dart';
import 'package:bse/widgets/empty_state.dart';
import 'widgets/comparison_filter_sheet.dart';
import 'widgets/comparison_models.dart';
import 'widgets/comparison_card.dart';
import 'package:bse/widgets/ads/ads_banner.dart';

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

  final List<PropertyDef> _properties = [
    PropertyDef('atomicWeight', (l10n) => l10n.periodic_table.atomicWeight),
    PropertyDef('numberOfElectron', (l10n) => l10n.periodic_table.electrons),
    PropertyDef('meltingPoint', (l10n) => l10n.periodic_table.meltingPoint),
    PropertyDef('boilingPoint', (l10n) => l10n.periodic_table.boilingPoint),
    PropertyDef('density', (l10n) => l10n.periodic_table.density),
    PropertyDef('molarVolume', (l10n) => l10n.periodic_table.molarVolume),
    PropertyDef('bulkModulus', (l10n) => l10n.periodic_table.bulkModulus),
    PropertyDef('shearModulus', (l10n) => l10n.periodic_table.shearModulus),
    PropertyDef('youngModulus', (l10n) => l10n.periodic_table.youngModulus),
    PropertyDef(
      'electronegativity',
      (l10n) => l10n.periodic_table.electronegativity,
    ),
    PropertyDef(
      'electricalConductivity',
      (l10n) => l10n.periodic_table.electricalConductivity,
    ),
    PropertyDef('resistivity', (l10n) => l10n.periodic_table.resistivity),
    PropertyDef('atomicRadius', (l10n) => l10n.periodic_table.atomicRadius),
    PropertyDef(
      'vanDerWaalsRadius',
      (l10n) => l10n.periodic_table.vanDerWaalsRadius,
    ),
  ];

  late final ScrollController _scrollController;

  @override
  void initState() {
    super.initState();
    _scrollController = ScrollController();
    _searchController.addListener(() {
      setState(() {
        _searchQuery = _searchController.text.trim().toLowerCase();
      });
    });
  }

  @override
  void dispose() {
    _scrollController.dispose();
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
    final sortState = ref.read(comparisonSortProvider);
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => ComparisonFilterSheet(
        initialSortBy: sortState.sortBy,
        initialSortDirection: sortState.sortDirection,
        properties: _properties,
        onApply: (sortBy, sortDirection) {
          ref.read(comparisonSortProvider.notifier).setSortBy(sortBy);
          ref
              .read(comparisonSortProvider.notifier)
              .setSortDirection(sortDirection);
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);
    final l10n = Translations.of(context);
    final parsedElements = ref.watch(_parsedElementsProvider);
    final periodicTheme = ref.watch(periodicThemeProvider);
    final sortState = ref.watch(comparisonSortProvider);
    final sortByData = sortState.sortBy;
    final sortDirectionData = sortState.sortDirection;
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
      final sortBy_ = sortDirectionData == 'auto' ? 'atomicNumber' : sortByData;

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

      if (sortDirectionData == 'desc') {
        return -comparison;
      }
      return comparison;
    });

    double maxVal = 1.0;
    for (final ep in sorted) {
      final val = _getPropertyValue(ep.properties, sortByData);
      if (val != null && val > maxVal) {
        maxVal = val;
      }
    }

    final activeFilters =
        (sortByData != 'atomicWeight' ? 1 : 0) +
        (sortDirectionData != 'auto' ? 1 : 0);

    return Scaffold(
      backgroundColor: theme.colorScheme.background,
      bottomNavigationBar: AdsBanner.buildBottomBar(ref),
      body: CustomScrollView(
        controller: _scrollController,
        slivers: [
          // Collapsible Hero Banner AppBar with Pinned Search & Filter Row
          ComparisonAppBar(
            searchController: _searchController,
            activeFilters: activeFilters,
            onFilterTap: () => _showFilterSheet(context),
          ),

          // Metadata count
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 8),
              child: Text(
                _searchQuery.isNotEmpty
                    ? l10n.common.elementComparisonElementsFoundMatching(
                        count: sorted.length,
                        term: _searchQuery,
                      )
                    : l10n.common.elementComparisonElementsFound(
                        count: sorted.length,
                      ),
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
                  child: EmptyState(
                    icon: Icons.search_off_rounded,
                    title: l10n.common.elementComparisonNoElementsFound,
                    description: _searchQuery.isNotEmpty
                        ? l10n.common.elementComparisonNoElementsFoundMatching(
                            term: _searchQuery,
                          )
                        : l10n.common.elementComparisonNoElementsFound,
                    actionLabel: l10n.constitution.constitution.clearSearch,
                    onActionPressed: () {
                      _searchController.clear();
                    },
                  ),
                )
              : SliverPadding(
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
                  sliver: SliverList(
                    delegate: SliverChildBuilderDelegate((context, index) {
                      final ep = sorted[index];
                      final value =
                          _getPropertyValue(ep.properties, sortByData) ?? 0.0;
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
                        sortBy: sortByData,
                        value: value,
                        percent: percent,
                        isDark: isDark,
                        onTap: () => _showOverview(ep.element, periodicTheme),
                      );
                    }, childCount: sorted.length),
                  ),
                ),
          const SliverToBoxAdapter(child: SizedBox(height: 200)),
        ],
      ),
    );
  }
}
