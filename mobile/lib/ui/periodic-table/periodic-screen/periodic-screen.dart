import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import '../../../core/database/database.dart';
import '../../../core/providers/database_provider.dart';
import '../../../core/providers/dio_provider.dart';
import '../../../core/network/api_endpoints.dart';
import '../../../l10n/gen_l10n/app_localizations.dart';
import '../../../core/providers/settings_provider.dart';
import '../widgets/periodic_cell.dart';
import '../widgets/periodic_table_layout.dart';

enum PeriodicSyncStatus { checking, notDownloaded, downloading, success, error }

class PeriodicSyncState {
  final PeriodicSyncStatus status;
  final String? errorMessage;
  final List<PeriodicElement> elements;

  PeriodicSyncState({
    required this.status,
    this.errorMessage,
    this.elements = const [],
  });

  PeriodicSyncState copyWith({
    PeriodicSyncStatus? status,
    String? errorMessage,
    List<PeriodicElement>? elements,
  }) {
    return PeriodicSyncState(
      status: status ?? this.status,
      errorMessage: errorMessage ?? this.errorMessage,
      elements: elements ?? this.elements,
    );
  }
}

class PeriodicSyncNotifier extends Notifier<PeriodicSyncState> {
  @override
  PeriodicSyncState build() {
    Future.microtask(() => checkInitial());
    return PeriodicSyncState(status: PeriodicSyncStatus.checking);
  }

  Future<void> checkInitial() async {
    state = PeriodicSyncState(status: PeriodicSyncStatus.checking);
    try {
      final db = ref.read(databaseProvider);
      final hasData = await db.hasPeriodicTableData();
      if (hasData) {
        final elements = await db.getPeriodicElements();
        // Sort elements by idy and idx so they lay out correctly
        elements.sort((a, b) {
          final cmpY = a.idy.compareTo(b.idy);
          if (cmpY != 0) return cmpY;
          return a.idx.compareTo(b.idx);
        });
        state = PeriodicSyncState(
          status: PeriodicSyncStatus.success,
          elements: elements,
        );
      } else {
        state = PeriodicSyncState(status: PeriodicSyncStatus.notDownloaded);
      }
    } catch (e) {
      state = PeriodicSyncState(
        status: PeriodicSyncStatus.error,
        errorMessage: e.toString(),
      );
    }
  }

  Future<void> downloadData() async {
    state = state.copyWith(status: PeriodicSyncStatus.downloading);
    try {
      final db = ref.read(databaseProvider);
      final dio = ref.read(dioProvider);
      final response = await dio.get(ApiEndpoints.periodicTable);
      if (response.data['success'] == true) {
        final data = response.data['data'];
        final List<dynamic> elementsJson = data['elements'] ?? [];
        final List<dynamic> notesJson = data['notes'] ?? [];

        final List<PeriodicElement> elements = elementsJson.map((e) {
          return PeriodicElement(
            id: e['id'] as int,
            idx: e['idx'] as int,
            idy: e['idy'] as int,
            atomicNumber: e['atomicNumber'] as int,
            atomicGroup: e['atomicGroup'] as String,
            atomicName: e['atomicName'] as String,
            atomicSymbol: e['atomicSymbol'] as String,
            atomicImages: jsonEncode(e['atomicImages'] ?? {}),
            atomicProperties: jsonEncode(e['atomicProperties'] ?? {}),
            atomicIsotope: jsonEncode(e['atomicIsotope'] ?? {}),
            atomicExtra: jsonEncode(e['atomicExtra'] ?? {}),
          );
        }).toList();

        final List<PeriodicElementNote> notes = notesJson.map((n) {
          return PeriodicElementNote(
            id: n['id'] as int,
            atomicNumber: n['atomicNumber'] as int,
            localeCode: n['localeCode'] as String,
            atomicOverview: n['atomicOverview'] as String,
            atomicHistory: n['atomicHistory'] as String,
            atomicApps: n['atomicApps'] as String,
            atomicFacts: n['atomicFacts'] as String,
          );
        }).toList();

        await db.upsertPeriodicElements(elements);
        await db.upsertPeriodicElementNotes(notes);

        elements.sort((a, b) {
          final cmpY = a.idy.compareTo(b.idy);
          if (cmpY != 0) return cmpY;
          return a.idx.compareTo(b.idx);
        });

        state = PeriodicSyncState(
          status: PeriodicSyncStatus.success,
          elements: elements,
        );
      } else {
        state = state.copyWith(
          status: PeriodicSyncStatus.error,
          errorMessage: response.data['message'] ?? 'Failed to download data',
        );
      }
    } catch (e) {
      state = state.copyWith(
        status: PeriodicSyncStatus.error,
        errorMessage: e.toString(),
      );
    }
  }
}

final periodicSyncProvider =
    NotifierProvider<PeriodicSyncNotifier, PeriodicSyncState>(
      PeriodicSyncNotifier.new,
    );

class PeriodicScreen extends ConsumerStatefulWidget {
  const PeriodicScreen({super.key});

  @override
  ConsumerState<PeriodicScreen> createState() => _PeriodicScreenState();
}

class _PeriodicScreenState extends ConsumerState<PeriodicScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = "";
  bool _isGridView = true;

  @override
  void initState() {
    super.initState();
    _searchController.addListener(() {
      setState(() {
        _searchQuery = _searchController.text.toLowerCase();
      });
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Color _getGroupColor(String group, bool isDark) {
    switch (group) {
      case 'alkali_metals':
        return isDark ? const Color(0xFF991B1B) : const Color(0xFFFEE2E2);
      case 'alkaline_earth_metals':
        return isDark ? const Color(0xFF9A3412) : const Color(0xFFFFEDD5);
      case 'transition_metals':
        return isDark ? const Color(0xFF854D0E) : const Color(0xFFFEF9C3);
      case 'post_transition_metals':
        return isDark ? const Color(0xFF1E3A8A) : const Color(0xFFDBEAFE);
      case 'metalloids':
        return isDark ? const Color(0xFF115E59) : const Color(0xFFCCFBF1);
      case 'othernonmetals':
      case 'other_nonmetals':
        return isDark ? const Color(0xFF065F46) : const Color(0xFFD1FAE5);
      case 'halogens':
        return isDark ? const Color(0xFF5B21B6) : const Color(0xFFEDE9FE);
      case 'noble_gases':
        return isDark ? const Color(0xFF86198F) : const Color(0xFFFDF4FF);
      case 'lanthanoids':
        return isDark ? const Color(0xFF9D174D) : const Color(0xFFFCE7F3);
      case 'actinoids':
        return isDark ? const Color(0xFF9F1239) : const Color(0xFFFFE4E6);
      default:
        return isDark ? const Color(0xFF27272A) : const Color(0xFFF4F4F5);
    }
  }

  Color _getGroupTextColor(String group, bool isDark) {
    if (isDark) return Colors.white;
    switch (group) {
      case 'alkali_metals':
        return const Color(0xFF991B1B);
      case 'alkaline_earth_metals':
        return const Color(0xFF9A3412);
      case 'transition_metals':
        return const Color(0xFF854D0E);
      case 'post_transition_metals':
        return const Color(0xFF1E3A8A);
      case 'metalloids':
        return const Color(0xFF115E59);
      case 'othernonmetals':
      case 'other_nonmetals':
        return const Color(0xFF065F46);
      case 'halogens':
        return const Color(0xFF5B21B6);
      case 'noble_gases':
        return const Color(0xFF86198F);
      case 'lanthanoids':
        return const Color(0xFF9D174D);
      case 'actinoids':
        return const Color(0xFF9F1239);
      default:
        return const Color(0xFF3F3F46);
    }
  }

  String _formatGroupName(String group) {
    return group
        .replaceAll('_', ' ')
        .split(' ')
        .map(
          (str) => str.isNotEmpty
              ? '${str[0].toUpperCase()}${str.substring(1)}'
              : '',
        )
        .join(' ');
  }

  void _showElementDetails(PeriodicElement element) async {
    final db = ref.read(databaseProvider);
    final locale = Localizations.localeOf(context).languageCode;

    // Fetch localized note
    final note =
        await db.getPeriodicElementNote(element.atomicNumber, locale) ??
        await db.getPeriodicElementNote(element.atomicNumber, 'en');

    if (!mounted) return;

    final theme = ShadTheme.of(context);
    final l10n = AppLocalizations.of(context)!;
    final properties =
        jsonDecode(element.atomicProperties) as Map<String, dynamic>? ?? {};
    final isotope =
        jsonDecode(element.atomicIsotope) as Map<String, dynamic>? ?? {};

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return Container(
          height: MediaQuery.of(context).size.height * 0.85,
          decoration: BoxDecoration(
            color: theme.colorScheme.background,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
          ),
          child: Column(
            children: [
              // Pull handler
              Container(
                width: 40,
                height: 5,
                margin: const EdgeInsets.symmetric(vertical: 12),
                decoration: BoxDecoration(
                  color: theme.colorScheme.muted,
                  borderRadius: BorderRadius.circular(10),
                ),
              ),

              // Header
              Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: 24,
                  vertical: 8,
                ),
                child: Row(
                  children: [
                    // Symbol Badge
                    Container(
                      width: 64,
                      height: 64,
                      decoration: BoxDecoration(
                        color: _getGroupColor(
                          element.atomicGroup,
                          theme.brightness == Brightness.dark,
                        ),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: _getGroupTextColor(
                            element.atomicGroup,
                            theme.brightness == Brightness.dark,
                          ).withValues(alpha: 0.3),
                        ),
                      ),
                      child: Center(
                        child: Text(
                          element.atomicSymbol,
                          style: theme.textTheme.h3.copyWith(
                            color: _getGroupTextColor(
                              element.atomicGroup,
                              theme.brightness == Brightness.dark,
                            ),
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            element.atomicName,
                            style: theme.textTheme.h4.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          Text(
                            '${_formatGroupName(element.atomicGroup)} • Atomic No. ${element.atomicNumber}',
                            style: theme.textTheme.muted,
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(LucideIcons.x),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ],
                ),
              ),
              const Divider(),

              // Content Scroll
              Expanded(
                child: ListView(
                  padding: const EdgeInsets.all(24),
                  children: [
                    // Localized notes if available
                    if (note != null) ...[
                      Text(
                        l10n.periodicOverview,
                        style: theme.textTheme.large.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(note.atomicOverview, style: theme.textTheme.muted),
                      const SizedBox(height: 20),

                      Text(
                        l10n.periodicHistory,
                        style: theme.textTheme.large.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(note.atomicHistory, style: theme.textTheme.muted),
                      const SizedBox(height: 20),

                      Text(
                        l10n.periodicApplications,
                        style: theme.textTheme.large.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(note.atomicApps, style: theme.textTheme.muted),
                      const SizedBox(height: 20),

                      Text(
                        l10n.periodicInterestingFacts,
                        style: theme.textTheme.large.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(note.atomicFacts, style: theme.textTheme.muted),
                      const SizedBox(height: 24),
                    ],

                    // Technical Properties
                    Text(
                      l10n.periodicProperties,
                      style: theme.textTheme.large.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 12,
                      runSpacing: 12,
                      children: [
                        for (var key in properties.keys)
                          if (properties[key] != null &&
                              properties[key].toString().isNotEmpty)
                            Container(
                              width:
                                  MediaQuery.of(context).size.width / 2.3 - 24,
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: theme.colorScheme.muted.withValues(
                                  alpha: 0.3,
                                ),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    key.replaceAll('_', ' ').toUpperCase(),
                                    style: TextStyle(
                                      fontSize: 10,
                                      fontWeight: FontWeight.bold,
                                      color: theme.colorScheme.mutedForeground,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    properties[key].toString(),
                                    style: theme.textTheme.small.copyWith(
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                      ],
                    ),
                    const SizedBox(height: 20),

                    // Isotopes if available
                    if (isotope.isNotEmpty) ...[
                      Text(
                        l10n.periodicIsotopes,
                        style: theme.textTheme.large.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(isotope.toString(), style: theme.textTheme.muted),
                    ],
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildSetupView(BuildContext context, PeriodicSyncState syncState) {
    final theme = ShadTheme.of(context);
    final l10n = AppLocalizations.of(context)!;

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 400),
          child: ShadCard(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (syncState.status == PeriodicSyncStatus.checking) ...[
                  const CircularProgressIndicator(),
                  const SizedBox(height: 16),
                  Text(l10n.periodicChecking),
                ] else if (syncState.status ==
                    PeriodicSyncStatus.notDownloaded) ...[
                  const Icon(LucideIcons.package2, size: 48),
                  const SizedBox(height: 16),
                  Text(
                    l10n.periodicSetupTitle,
                    style: theme.textTheme.large.copyWith(
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    l10n.periodicSetupMessage,
                    style: theme.textTheme.muted,
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 24),
                  ShadButton(
                    width: double.infinity,
                    onPressed: () =>
                        ref.read(periodicSyncProvider.notifier).downloadData(),
                    child: Text(l10n.syncDownloadNow),
                  ),
                ] else if (syncState.status ==
                    PeriodicSyncStatus.downloading) ...[
                  const Icon(LucideIcons.refreshCcw, size: 48),
                  const SizedBox(height: 16),
                  Text(
                    l10n.periodicDownloadingTitle,
                    style: theme.textTheme.large.copyWith(
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(l10n.periodicDownloadingMessage),
                  const SizedBox(height: 24),
                  const ShadProgress(),
                ] else if (syncState.status == PeriodicSyncStatus.error) ...[
                  Icon(
                    LucideIcons.wifiOff,
                    size: 48,
                    color: theme.colorScheme.destructive,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    l10n.periodicSyncFailedTitle,
                    style: theme.textTheme.large.copyWith(
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    syncState.errorMessage ??
                        'An error occurred while downloading data.',
                    style: theme.textTheme.muted,
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 24),
                  ShadButton(
                    width: double.infinity,
                    onPressed: () =>
                        ref.read(periodicSyncProvider.notifier).downloadData(),
                    child: Text(l10n.syncTryAgain),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildListView(List<PeriodicElement> elements, bool isDark, String periodicTheme) {
    final filtered = elements.where((element) {
      if (_searchQuery.isEmpty) return true;
      return element.atomicName.toLowerCase().contains(_searchQuery) ||
          element.atomicSymbol.toLowerCase().contains(_searchQuery) ||
          element.atomicNumber.toString().contains(_searchQuery);
    }).toList();

    final l10n = AppLocalizations.of(context)!;
    if (filtered.isEmpty) {
      return Center(child: Text(l10n.periodicNoElementsFound));
    }

    final theme = ShadTheme.of(context);

    return ListView.builder(
      itemCount: filtered.length,
      padding: const EdgeInsets.all(16),
      itemBuilder: (context, index) {
        final element = filtered[index];

        return Card(
          margin: const EdgeInsets.only(bottom: 8),
          elevation: 0,
          color: theme.colorScheme.muted.withValues(alpha: 0.2),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          child: ListTile(
            leading: SizedBox(
              width: 44,
              height: 44,
              child: PeriodicCell(
                element: element,
                cellSize: 40,
                isSearchActive: false,
                isSearchMatch: true,
                theme: periodicTheme,
              ),
            ),
            title: Text(
              element.atomicName,
              style: const TextStyle(fontWeight: FontWeight.w600),
            ),
            subtitle: Text(
              '${_formatGroupName(element.atomicGroup)} • Atomic No. ${element.atomicNumber}',
            ),
            trailing: const Icon(LucideIcons.chevronRight),
            onTap: () => _showElementDetails(element),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final syncState = ref.watch(periodicSyncProvider);
    final theme = ShadTheme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final l10n = AppLocalizations.of(context)!;

    // Get periodic table theme from preferences
    final settings = ref.watch(settingsProvider);
    final periodicTheme = settings.periodicTheme;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          l10n.periodicTable,
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        actions: [
          if (syncState.status == PeriodicSyncStatus.success) ...[
            IconButton(
              icon: Icon(_isGridView ? LucideIcons.list : LucideIcons.grid),
              onPressed: () {
                setState(() {
                  _isGridView = !_isGridView;
                });
              },
            ),
            IconButton(
              icon: const Icon(LucideIcons.refreshCw),
              onPressed: () =>
                  ref.read(periodicSyncProvider.notifier).downloadData(),
            ),
            PopupMenuButton<String>(
              icon: const Icon(LucideIcons.palette),
              initialValue: periodicTheme,
              onSelected: (value) {
                ref
                    .read(settingsProvider.notifier)
                    .setPeriodicTheme(value);
              },
              itemBuilder: (context) => [
                PopupMenuItem(
                  value: 'theme1',
                  child: Text(l10n.periodicThemeClassic),
                ),
                PopupMenuItem(
                  value: 'theme2',
                  child: Text(l10n.periodicThemeBorder),
                ),
                PopupMenuItem(
                  value: 'theme3',
                  child: Text(l10n.periodicThemeGradient),
                ),
                PopupMenuItem(
                  value: 'theme4',
                  child: Text(l10n.periodicThemeGradientOutline),
                ),
              ],
            ),
          ],
        ],
      ),
      body: syncState.status != PeriodicSyncStatus.success
          ? _buildSetupView(context, syncState)
          : Column(
              children: [
                // Search Bar
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: ShadInput(
                    controller: _searchController,
                    placeholder: Text(l10n.periodicSearchPlaceholder),
                    leading: const Padding(
                      padding: EdgeInsets.only(right: 8.0),
                      child: Icon(LucideIcons.search, size: 16),
                    ),
                  ),
                ),

                // Main Content
                Expanded(
                  child: _isGridView
                      ? PeriodicTableLayout(
                          elements: syncState.elements,
                          searchQuery: _searchQuery,
                          theme: periodicTheme,
                          onElementTap: _showElementDetails,
                        )
                      : _buildListView(syncState.elements, isDark, periodicTheme),
                ),
              ],
            ),
    );
  }
}
