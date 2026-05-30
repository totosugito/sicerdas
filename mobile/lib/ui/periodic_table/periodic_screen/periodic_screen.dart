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
import 'widgets/periodic_cell.dart';
import 'widgets/periodic_table_layout.dart';
import '../element_detail/element_detail.dart';

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

        final sortedElements = await db.getPeriodicElements();

        state = PeriodicSyncState(
          status: PeriodicSyncStatus.success,
          elements: sortedElements,
        );
      } else {
        state = state.copyWith(
          status: PeriodicSyncStatus.error,
          errorMessage: response.data['message'],
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
  final _popoverController = ShadPopoverController();
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
    _popoverController.dispose();
    super.dispose();
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

  void _showElementDetails(PeriodicElement element) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => ElementDetailScreen(element: element),
      ),
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
                    syncState.errorMessage ?? l10n.syncFailedMessage,
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

  Widget _buildListView(
    List<PeriodicElement> elements,
    bool isDark,
    String periodicTheme,
  ) {
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

        return Padding(
          padding: const EdgeInsets.only(bottom: 8),
          child: ShadCard(
            padding: EdgeInsets.zero,
            child: InkWell(
              onTap: () => _showElementDetails(element),
              borderRadius: BorderRadius.circular(12),
              child: Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 12,
                ),
                child: Row(
                  children: [
                    SizedBox(
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
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            element.atomicName,
                            style: theme.textTheme.list.copyWith(
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            '${_formatGroupName(element.atomicGroup)} • Atomic No. ${element.atomicNumber}',
                            style: theme.textTheme.muted,
                          ),
                        ],
                      ),
                    ),
                    const Icon(LucideIcons.chevronRight, size: 16),
                  ],
                ),
              ),
            ),
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
            ShadPopover(
              controller: _popoverController,
              popover: (context) => IntrinsicWidth(
                child: Container(
                  padding: const EdgeInsets.all(6),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      for (final themeOption in [
                        ('theme1', l10n.periodicThemeClassic),
                        ('theme2', l10n.periodicThemeBorder),
                        ('theme3', l10n.periodicThemeGradient),
                        ('theme4', l10n.periodicThemeGradientOutline),
                      ])
                        Builder(
                          builder: (context) {
                            final isSelected = periodicTheme == themeOption.$1;
                            final theme = ShadTheme.of(context);
                            return InkWell(
                              onTap: () {
                                ref
                                    .read(settingsProvider.notifier)
                                    .setPeriodicTheme(themeOption.$1);
                                _popoverController.hide();
                              },
                              borderRadius: BorderRadius.circular(6),
                              child: Container(
                                decoration: BoxDecoration(
                                  color: isSelected
                                      ? theme.colorScheme.accent
                                      : Colors.transparent,
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 12,
                                  vertical: 8,
                                ),
                                child: Row(
                                  children: [
                                    Icon(
                                      LucideIcons.check,
                                      size: 16,
                                      color: isSelected
                                          ? theme.colorScheme.primary
                                          : Colors.transparent,
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Text(
                                        themeOption.$2,
                                        textAlign: TextAlign.start,
                                        style: theme.textTheme.small.copyWith(
                                          fontWeight: isSelected
                                              ? FontWeight.w600
                                              : FontWeight.normal,
                                          color: theme.colorScheme.foreground,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            );
                          },
                        ),
                    ],
                  ),
                ),
              ),
              child: IconButton(
                icon: const Icon(LucideIcons.palette),
                onPressed: () => _popoverController.show(),
              ),
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
                      : _buildListView(
                          syncState.elements,
                          isDark,
                          periodicTheme,
                        ),
                ),
              ],
            ),
    );
  }
}
