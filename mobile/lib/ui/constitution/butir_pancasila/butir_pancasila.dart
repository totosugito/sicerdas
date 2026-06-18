import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/i18n/strings.g.dart';
import 'package:bse/widgets/empty_state.dart';
import 'widgets/butir_card.dart';
import 'widgets/butir_app_bar.dart';

class ButirPancasilaScreen extends ConsumerStatefulWidget {
  const ButirPancasilaScreen({super.key});

  static void navigate(BuildContext context) {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const ButirPancasilaScreen()),
    );
  }

  @override
  ConsumerState<ButirPancasilaScreen> createState() =>
      _ButirPancasilaScreenState();
}

class _ButirPancasilaScreenState extends ConsumerState<ButirPancasilaScreen> {
  late final ScrollController _scrollController;
  late final TextEditingController _searchController;

  bool _isCollapsed = false;
  static const double _expandedHeight = 220.0;

  List<dynamic> _silaList = [];
  List<dynamic> _filteredSilaList = [];
  String _searchTerm = '';
  bool _expandedAll = false;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _scrollController = ScrollController();
    _scrollController.addListener(_scrollListener);
    _searchController = TextEditingController();
    _loadData();
  }

  @override
  void dispose() {
    _scrollController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  void _scrollListener() {
    if (_scrollController.hasClients) {
      final isCollapsed =
          _scrollController.offset >
          (_expandedHeight -
              kToolbarHeight -
              MediaQuery.of(context).padding.top -
              16);
      if (isCollapsed != _isCollapsed) {
        setState(() {
          _isCollapsed = isCollapsed;
        });
      }
    }
  }

  Future<void> _loadData() async {
    try {
      final String response = await rootBundle.loadString(
        'assets/constitution/data/butir_pancasila.json',
      );
      final data = jsonDecode(response) as List<dynamic>;
      if (mounted) {
        setState(() {
          _silaList = data;
          _filteredSilaList = data;
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  void _runSearch(String query) {
    setState(() {
      _searchTerm = query;
      if (query.isEmpty) {
        _filteredSilaList = _silaList;
      } else {
        final lowercaseQuery = query.toLowerCase();
        _filteredSilaList = _silaList.where((sila) {
          final title = sila['sila'] as String;
          final hasSilaMatch = title.toLowerCase().contains(lowercaseQuery);

          final butirData = sila['data'] as List<dynamic>;
          final hasButirMatch = butirData.any((b) {
            final isi = b['isi'] as String;
            return isi.toLowerCase().contains(lowercaseQuery);
          });

          return hasSilaMatch || hasButirMatch;
        }).toList();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);
    final l10n = Translations.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final searchResultsTemplate = l10n.constitution.constitution.searchResults(
      query: '#QUERY#',
    );
    final searchResultsParts = searchResultsTemplate.split('#QUERY#');

    return Scaffold(
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SelectionArea(
              child: CustomScrollView(
                controller: _scrollController,
                slivers: [
                  // Pinned Collapsible App Bar
                  ButirPancasilaAppBar(
                    isCollapsed: _isCollapsed,
                    isDark: isDark,
                    expandedHeight: _expandedHeight,
                    expandedAll: _expandedAll,
                    onToggleExpandAll: () {
                      setState(() {
                        _expandedAll = !_expandedAll;
                      });
                    },
                  ),

                  // Pinned Search Input Header
                  SliverPersistentHeader(
                    pinned: true,
                    delegate: _SearchInputDelegate(
                      height: 86.0,
                      child: Container(
                        color: theme.colorScheme.background,
                        padding: const EdgeInsets.only(
                          top: 12.0,
                          left: 16.0,
                          right: 16.0,
                          bottom: 8.0,
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            ShadInput(
                              controller: _searchController,
                              placeholder: Text(
                                l10n
                                    .constitution
                                    .constitution
                                    .searchPlaceholder,
                                style: TextStyle(
                                  color: theme.colorScheme.mutedForeground,
                                  fontSize: 14,
                                ),
                              ),
                              onChanged: _runSearch,
                              leading: const Padding(
                                padding: EdgeInsets.symmetric(horizontal: 8.0),
                                child: Icon(Icons.search, size: 18),
                              ),
                              trailing: _searchTerm.isNotEmpty
                                  ? GestureDetector(
                                      onTap: () {
                                        _searchController.clear();
                                        _runSearch('');
                                      },
                                      child: Padding(
                                        padding: const EdgeInsets.symmetric(
                                          horizontal: 8.0,
                                        ),
                                        child: Icon(
                                          Icons.clear,
                                          size: 18,
                                          color:
                                              theme.colorScheme.mutedForeground,
                                        ),
                                      ),
                                    )
                                  : null,
                            ),
                            if (_searchTerm.isNotEmpty) ...[
                              const SizedBox(height: 8),
                              Text.rich(
                                TextSpan(
                                  children: [
                                    if (searchResultsParts.isNotEmpty)
                                      TextSpan(text: searchResultsParts[0]),
                                    TextSpan(
                                      text: _searchTerm,
                                      style: TextStyle(
                                        fontWeight: FontWeight.bold,
                                        color: theme.colorScheme.primary,
                                      ),
                                    ),
                                    if (searchResultsParts.length > 1)
                                      TextSpan(text: searchResultsParts[1]),
                                  ],
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: theme.textTheme.muted.copyWith(
                                  fontSize: 13,
                                ),
                              ),
                            ],
                          ],
                        ),
                      ),
                    ),
                  ),

                  // Cards List
                  SliverPadding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16.0,
                      vertical: 8.0,
                    ),
                    sliver: _filteredSilaList.isEmpty
                        ? SliverFillRemaining(
                            hasScrollBody: false,
                            child: EmptyState(
                              icon: Icons.search_off_rounded,
                              title: l10n.constitution.constitution.noResult,
                              description: l10n.constitution.constitution
                                  .noResultFor(query: _searchTerm),
                              actionLabel:
                                  l10n.constitution.constitution.clearSearch,
                              onActionPressed: () {
                                _searchController.clear();
                                _runSearch('');
                              },
                            ),
                          )
                        : SliverList(
                            delegate: SliverChildBuilderDelegate((
                              context,
                              index,
                            ) {
                              final sila = _filteredSilaList[index];
                              final id = sila['id'] as int;
                              final title = sila['sila'] as String;
                              final image = sila['image'] as String;
                              final data = sila['data'] as List<dynamic>;

                              return ButirPancasilaCard(
                                id: id,
                                title: title,
                                imagePath: image,
                                butirData: data,
                                searchTerm: _searchTerm,
                                forceExpand:
                                    _expandedAll || _searchTerm.isNotEmpty,
                              );
                            }, childCount: _filteredSilaList.length),
                          ),
                  ),
                  const SliverToBoxAdapter(child: SizedBox(height: 200)),
                ],
              ),
            ),
    );
  }
}

class _SearchInputDelegate extends SliverPersistentHeaderDelegate {
  final Widget child;
  final double height;

  _SearchInputDelegate({required this.child, required this.height});

  @override
  double get minExtent => height;

  @override
  double get maxExtent => height;

  @override
  Widget build(
    BuildContext context,
    double shrinkOffset,
    bool overlapsContent,
  ) {
    return child;
  }

  @override
  bool shouldRebuild(covariant _SearchInputDelegate oldDelegate) {
    return child != oldDelegate.child || height != oldDelegate.height;
  }
}
