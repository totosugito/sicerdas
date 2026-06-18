import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/i18n/strings.g.dart';
import 'package:bse/widgets/empty_state.dart';
import 'widgets/uud_card.dart';
import 'widgets/uud_app_bar.dart';

enum UudMode { latest, asli, amandemen }

class Uud1945Screen extends ConsumerStatefulWidget {
  final UudMode mode;

  const Uud1945Screen({super.key, required this.mode});

  static void navigate(BuildContext context, UudMode mode) {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => Uud1945Screen(mode: mode)),
    );
  }

  @override
  ConsumerState<Uud1945Screen> createState() => _Uud1945ScreenState();
}

class _Uud1945ScreenState extends ConsumerState<Uud1945Screen> {
  late final ScrollController _scrollController;
  late final TextEditingController _searchController;

  bool _isCollapsed = false;
  static const double _expandedHeight = 220.0;

  List<dynamic> _articleList = [];
  List<dynamic> _filteredArticleList = [];
  String _searchTerm = '';
  bool _expandedAll = false;
  bool _isLoading = true;

  int _articleCount = 0;
  int _transitionalCount = 0;
  int _additionalCount = 0;

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
      String assetPath = 'assets/constitution/data/pasal_uud_1945.json';
      if (widget.mode == UudMode.asli) {
        assetPath = 'assets/constitution/data/pasal_uud_1945_asli.json';
      } else if (widget.mode == UudMode.amandemen) {
        assetPath = 'assets/constitution/data/pasal_uud_1945_amandemen.json';
      }

      final String response = await rootBundle.loadString(assetPath);
      final data = jsonDecode(response) as List<dynamic>;

      int articles = 0;
      int transitionals = 0;
      int additionals = 0;

      for (final item in data) {
        final title = (item['title'] as String? ?? '').toLowerCase();
        if (title.contains('peralihan')) {
          transitionals++;
        } else if (title.contains('tambahan') ||
            title.contains('pertambahan')) {
          additionals++;
        } else {
          articles++;
        }
      }

      if (mounted) {
        setState(() {
          _articleList = data;
          _filteredArticleList = data;
          _articleCount = articles;
          _transitionalCount = transitionals;
          _additionalCount = additionals;
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
        _filteredArticleList = _articleList;
      } else {
        final lowercaseQuery = query.toLowerCase();
        _filteredArticleList = _articleList.where((article) {
          final title = article['title'] as String? ?? '';
          final bab = article['bab'] as String? ?? '';
          final amandemen = article['amandemen'] as String? ?? '';

          final hasTitleMatch = title.toLowerCase().contains(lowercaseQuery);
          final hasBabMatch = bab.toLowerCase().contains(lowercaseQuery);
          final hasAmandemenMatch = amandemen.toLowerCase().contains(
            lowercaseQuery,
          );

          final ayatData = article['data'] as List<dynamic>? ?? [];
          final hasAyatMatch = ayatData.any((a) {
            final isi = a['isi'] as String? ?? '';
            return isi.toLowerCase().contains(lowercaseQuery);
          });

          return hasTitleMatch ||
              hasBabMatch ||
              hasAmandemenMatch ||
              hasAyatMatch;
        }).toList();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);
    final l10n = Translations.of(context);
    final isDark = theme.brightness == Brightness.dark;

    String screenTitle = l10n.constitution.uud1945Title;
    String screenSubtitle = l10n.constitution.uud1945Subtitle;

    if (widget.mode == UudMode.asli) {
      screenTitle = l10n.constitution.uud1945AsliTitle;
      screenSubtitle = l10n.constitution.uud1945AsliSubtitle;
    } else if (widget.mode == UudMode.amandemen) {
      screenTitle = l10n.constitution.amandemenTitle;
      screenSubtitle = l10n.constitution.amandemenSubtitle;
    }

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
                  Uud1945AppBar(
                    title: screenTitle,
                    subtitle: screenSubtitle,
                    isCollapsed: _isCollapsed,
                    isDark: isDark,
                    expandedHeight: _expandedHeight,
                    expandedAll: _expandedAll,
                    onToggleExpandAll: () {
                      setState(() {
                        _expandedAll = !_expandedAll;
                      });
                    },
                    articleCount: _articleCount,
                    transitionalCount: _transitionalCount,
                    additionalCount: _additionalCount,
                  ),

                  // Search Barpersistent header
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

                  // Articles list
                  SliverPadding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16.0,
                      vertical: 8.0,
                    ),
                    sliver: _filteredArticleList.isEmpty
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
                              final article = _filteredArticleList[index];
                              final title = article['title'] as String? ?? '';
                              final bab = article['bab'] as String?;
                              final amandemen = article['amandemen'] as String?;
                              final data =
                                  article['data'] as List<dynamic>? ?? [];

                              return Uud1945Card(
                                title: title,
                                data: data,
                                bab: bab,
                                amandemen: amandemen,
                                searchTerm: _searchTerm,
                                forceExpand:
                                    _expandedAll || _searchTerm.isNotEmpty,
                              );
                            }, childCount: _filteredArticleList.length),
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
