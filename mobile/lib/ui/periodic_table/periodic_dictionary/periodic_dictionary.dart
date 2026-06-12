import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/core/utils/toast_utils.dart';
import 'package:bse/i18n/strings.g.dart';
import 'widgets/chemistry_term_card.dart';
import 'widgets/dictionary_empty_state.dart';
import 'widgets/dictionary_hero_app_bar.dart';
import 'package:bse/widgets/sliver_sticky_header_delegate.dart';
import 'package:bse/widgets/ads/ads_banner.dart';

class ChemistryTerm {
  final int id;
  final String word;
  final String translation;

  ChemistryTerm({
    required this.id,
    required this.word,
    required this.translation,
  });

  factory ChemistryTerm.fromJson(Map<String, dynamic> json) {
    return ChemistryTerm(
      id: json['id'] as int,
      word: json['w'] as String,
      translation: json['tr'] as String,
    );
  }
}

class ChemistryDictionaryScreen extends ConsumerStatefulWidget {
  const ChemistryDictionaryScreen({super.key});

  @override
  ConsumerState<ChemistryDictionaryScreen> createState() =>
      _ChemistryDictionaryScreenState();
}

class _ChemistryDictionaryScreenState
    extends ConsumerState<ChemistryDictionaryScreen> {
  final TextEditingController _searchController = TextEditingController();
  bool _isLoading = true;
  List<ChemistryTerm> _allTerms = [];
  List<ChemistryTerm> _filteredTerms = [];
  String _activeGroup = 'all';
  String _searchQuery = '';
  Locale? _loadedLocale;

  @override
  void initState() {
    super.initState();
    _searchController.addListener(() {
      setState(() {
        _searchQuery = _searchController.text.trim().toLowerCase();
        _applyFilters();
      });
    });
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final locale = Localizations.localeOf(context);
    if (_loadedLocale != locale) {
      _loadedLocale = locale;
      _loadDictionary(locale.languageCode);
    }
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadDictionary(String languageCode) async {
    setState(() {
      _isLoading = true;
    });

    try {
      final String assetPath = languageCode == 'id'
          ? 'assets/periodic_dictionary/id.json'
          : 'assets/periodic_dictionary/en.json';

      final String jsonString = await rootBundle.loadString(assetPath);
      final List<dynamic> jsonList = jsonDecode(jsonString) as List<dynamic>;

      final terms = jsonList
          .map((item) => ChemistryTerm.fromJson(item as Map<String, dynamic>))
          .toList();

      // Sort terms alphabetically by word
      terms.sort(
        (a, b) => a.word.toLowerCase().compareTo(b.word.toLowerCase()),
      );

      if (mounted) {
        setState(() {
          _allTerms = terms;
          _isLoading = false;
          _applyFilters();
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
        ToastUtils.showError(
          context,
          title: 'Error',
          message: 'Failed to load dictionary data: $e',
        );
      }
    }
  }

  void _applyFilters() {
    var terms = _allTerms;

    // Filter by Alphabet Group
    if (_activeGroup != 'all') {
      terms = terms.where((term) {
        if (term.word.isEmpty) return false;
        final firstChar = term.word[0].toUpperCase();
        switch (_activeGroup) {
          case 'a-f':
            return firstChar.compareTo('A') >= 0 &&
                firstChar.compareTo('F') <= 0;
          case 'g-l':
            return firstChar.compareTo('G') >= 0 &&
                firstChar.compareTo('L') <= 0;
          case 'm-r':
            return firstChar.compareTo('M') >= 0 &&
                firstChar.compareTo('R') <= 0;
          case 's-z':
            return firstChar.compareTo('S') >= 0 &&
                firstChar.compareTo('Z') <= 0;
          default:
            return true;
        }
      }).toList();
    }

    // Filter by Search Query
    if (_searchQuery.isNotEmpty) {
      terms = terms.where((term) {
        return term.word.toLowerCase().contains(_searchQuery) ||
            term.translation.toLowerCase().contains(_searchQuery);
      }).toList();
    }

    _filteredTerms = terms;
  }

  void _copyToClipboard(ChemistryTerm term) {
    final l10n = Translations.of(context);
    final textToCopy = '${term.word}: ${term.translation}';
    Clipboard.setData(ClipboardData(text: textToCopy));
    ToastUtils.showSuccess(
      context,
      title: l10n.common.successTitle,
      message: l10n.chemistry_dictionary.dict.copyToClipboard,
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);
    final l10n = Translations.of(context);
    final crossAxisCount = MediaQuery.sizeOf(context).width > 600 ? 2 : 1;

    final alphabetGroups = [
      ('all', l10n.chemistry_dictionary.dict.all),
      ('a-f', l10n.chemistry_dictionary.dict.tabAF),
      ('g-l', l10n.chemistry_dictionary.dict.tabGL),
      ('m-r', l10n.chemistry_dictionary.dict.tabMR),
      ('s-z', l10n.chemistry_dictionary.dict.tabSZ),
    ];

    return Scaffold(
      bottomNavigationBar: AdsBanner.buildBottomBar(ref),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : CustomScrollView(
              slivers: [
                // Collapsible Hero Banner AppBar
                DictionaryHeroAppBar(
                  title: l10n.chemistry_dictionary.dict.title,
                  description: l10n.chemistry_dictionary.dict.desc,
                ),

                // Sticky Search & Filters Header
                SliverPersistentHeader(
                  pinned: true,
                  delegate: SliverStickyHeaderDelegate(
                    height: 120.0,
                    backgroundColor: theme.colorScheme.background,
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          // Search Input
                          ShadInput(
                            controller: _searchController,
                            placeholder: Text(
                              l10n.chemistry_dictionary.dict.searchPlaceholder,
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
                          const SizedBox(height: 12),

                          // Alphabet Group Tabs
                          SingleChildScrollView(
                            scrollDirection: Axis.horizontal,
                            child: Row(
                              children: alphabetGroups.map((group) {
                                final isSelected = _activeGroup == group.$1;
                                return Padding(
                                  padding: const EdgeInsets.only(right: 8),
                                  child: InkWell(
                                    onTap: () {
                                      setState(() {
                                        _activeGroup = group.$1;
                                        _applyFilters();
                                      });
                                    },
                                    borderRadius: BorderRadius.circular(6),
                                    child: Container(
                                      decoration: BoxDecoration(
                                        color: isSelected
                                            ? theme.colorScheme.primary
                                            : theme.colorScheme.muted,
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 16,
                                        vertical: 8,
                                      ),
                                      child: Text(
                                        group.$2,
                                        style: theme.textTheme.small.copyWith(
                                          fontWeight: FontWeight.w600,
                                          color: isSelected
                                              ? theme
                                                    .colorScheme
                                                    .primaryForeground
                                              : theme
                                                    .colorScheme
                                                    .mutedForeground,
                                        ),
                                      ),
                                    ),
                                  ),
                                );
                              }).toList(),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),

                // Search Results Metadata Header
                if (_filteredTerms.isNotEmpty)
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      child: Text(
                        l10n.chemistry_dictionary.dict.resultsInfo(start: 1, end: _filteredTerms.length, total: _filteredTerms.length,),
                        style: theme.textTheme.small.copyWith(
                          color: theme.colorScheme.mutedForeground,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ),

                // Results Grid / List
                SliverPadding(
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
                  sliver: _filteredTerms.isEmpty
                      ? SliverFillRemaining(
                          hasScrollBody: false,
                          child: DictionaryEmptyState(
                            title: l10n.chemistry_dictionary.dict.noEntriesFoundTitle,
                            description:
                                l10n.chemistry_dictionary.dict.noEntriesFoundDesc,
                          ),
                        )
                      : SliverGrid(
                          gridDelegate:
                              SliverGridDelegateWithFixedCrossAxisCount(
                                crossAxisCount: crossAxisCount,
                                crossAxisSpacing: 12,
                                mainAxisSpacing: 12,
                                mainAxisExtent: 110,
                              ),
                          delegate: SliverChildBuilderDelegate((
                            context,
                            index,
                          ) {
                            final term = _filteredTerms[index];
                            return ChemistryTermCard(
                              term: term,
                              onCopy: () => _copyToClipboard(term),
                              copyTooltip: l10n.chemistry_dictionary.dict.copyText,
                            );
                          }, childCount: _filteredTerms.length),
                        ),
                ),
              ],
            ),
    );
  }
}
