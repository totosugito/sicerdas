import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/core/database/database.dart';
import 'package:bse/core/providers/dio_provider.dart';
import 'package:bse/core/network/api_endpoints.dart';
import 'package:bse/i18n/strings.g.dart';
import 'package:bse/core/utils/toast_utils.dart';
import 'package:bse/widgets/download_progress_dialog.dart';
import '../libs/providers/periodic_provider.dart';
import '../libs/providers/periodic_sync_provider.dart';
import '../element_detail/element_detail.dart';
import '../periodic_dictionary/periodic_dictionary.dart';
import '../element-comparison/element_comparison.dart';
import 'widgets/periodic_setup_view.dart';
import 'widgets/periodic_table_layout.dart';
import 'widgets/element_overview_sheet.dart';

class PeriodicScreen extends ConsumerStatefulWidget {
  const PeriodicScreen({super.key});

  @override
  ConsumerState<PeriodicScreen> createState() => _PeriodicScreenState();
}

class _PeriodicScreenState extends ConsumerState<PeriodicScreen> {
  final TextEditingController _searchController = TextEditingController();

  String _searchQuery = "";
  bool _isSearching = false;

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

  void _showElementDetails(PeriodicElement element) {
    final periodicTheme = ref.read(periodicThemeProvider);
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

  Future<void> _startDownloadPeriodic() async {
    final l10n = Translations.of(context);
    final dio = ref.read(dioProvider);
    final tempDir = await getTemporaryDirectory();
    if (!mounted) return;
    final tempZipPath = p.join(tempDir.path, 'periodic-table.zip');

    final result = await DownloadProgressDialog.show<bool>(
      context,
      title: l10n.periodic_table.periodicTable,
      message: l10n.periodic_table.periodicDownloadingMessage,
      downloadTask: (cancelToken, onProgress) async {
        try {
          await dio.download(
            ApiEndpoints.periodicData,
            tempZipPath,
            cancelToken: cancelToken,
            onReceiveProgress: onProgress,
          );
          return true;
        } catch (_) {
          return false;
        }
      },
    );

    if (result != null && result.data == true && !result.isCancelled) {
      await ref
          .read(periodicSyncProvider.notifier)
          .processDownloadedZip(tempZipPath);
    } else if (result?.isCancelled == true) {
      ref.read(periodicSyncProvider.notifier).setSyncNotDownloaded();
    } else {
      ref.read(periodicSyncProvider.notifier).setSyncError();
    }
  }

  String _getLocalizedError(
    Translations l10n,
    String? errorKey,
    String? defaultMessage,
  ) {
    if (errorKey == 'syncFailedMessage') {
      return l10n.books.syncFailedMessage;
    }
    if (errorKey == 'periodicErrorEmptyZip') {
      return l10n.periodic_table.periodicErrorEmptyZip;
    }
    if (errorKey == 'periodicErrorJsonNotFound') {
      return l10n.periodic_table.periodicErrorJsonNotFound;
    }
    if (errorKey == 'periodicErrorStorageNotFound') {
      return l10n.periodic_table.periodicErrorStorageNotFound;
    }
    return defaultMessage ?? l10n.books.syncFailedMessage;
  }

  @override
  Widget build(BuildContext context) {
    final syncState = ref.watch(periodicSyncProvider);
    final l10n = Translations.of(context);

    // Listen for sync/download events to show toast notifications
    ref.listen<PeriodicSyncState>(periodicSyncProvider, (previous, next) {
      if (next.status == PeriodicSyncStatus.success &&
          previous?.status == PeriodicSyncStatus.downloading) {
        ToastUtils.showSuccess(
          context,
          title: l10n.common.successTitle,
          message: l10n.periodic_table.periodicSyncSuccessMessage,
        );
      } else if (next.status == PeriodicSyncStatus.error &&
          previous?.status == PeriodicSyncStatus.downloading) {
        ToastUtils.showError(
          context,
          title: l10n.common.errorTitle,
          message: _getLocalizedError(l10n, next.errorKey, next.errorMessage),
        );
      }
    });

    // Get periodic table theme from preferences
    final periodicTheme = ref.watch(periodicThemeProvider);

    return Scaffold(
      appBar: AppBar(
        title: _isSearching
            ? ShadInput(
                controller: _searchController,
                placeholder: Text(l10n.periodic_table.periodicSearchPlaceholder),
                autofocus: true,
                trailing: _searchController.text.isNotEmpty
                    ? GestureDetector(
                        onTap: () => _searchController.clear(),
                        child: const Icon(LucideIcons.x, size: 16),
                      )
                    : null,
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 6,
                ),
              )
            : Text(
                l10n.periodic_table.periodicTable,
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
        actions: [
          if (syncState.status == PeriodicSyncStatus.success) ...[
            IconButton(
              icon: Icon(
                _isSearching ? LucideIcons.searchX : LucideIcons.search,
              ),
              onPressed: () {
                setState(() {
                  _isSearching = !_isSearching;
                  if (!_isSearching) {
                    _searchController.clear();
                  }
                });
              },
            ),
            PopupMenuButton<String>(
              icon: const Icon(LucideIcons.moreVertical),
              onSelected: (value) {
                switch (value) {
                  case 'dictionary':
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const ChemistryDictionaryScreen(),
                      ),
                    );
                    break;
                  case 'comparison':
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const ElementComparisonScreen(),
                      ),
                    );
                    break;
                  default:
                    if (value.startsWith('theme')) {
                      ref.read(periodicThemeProvider.notifier).setTheme(value);
                    }
                }
              },
              itemBuilder: (context) => [
                PopupMenuItem(
                  value: 'dictionary',
                  child: Row(
                    children: [
                      const Icon(LucideIcons.book, size: 18),
                      const SizedBox(width: 12),
                      Text(l10n.chemistry_dictionary.chemistryDictionary),
                    ],
                  ),
                ),
                PopupMenuItem(
                  value: 'comparison',
                  child: Row(
                    children: [
                      const Icon(LucideIcons.gitCompare, size: 18),
                      const SizedBox(width: 12),
                      Text(l10n.common.elementComparisonTitle),
                    ],
                  ),
                ),
                const PopupMenuDivider(),
                PopupMenuItem(
                  enabled: false,
                  height: 32,
                  child: Text(
                    l10n.periodic_table.periodicThemeLabel,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: Theme.of(
                        context,
                      ).colorScheme.onSurface.withValues(alpha: 0.5),
                    ),
                  ),
                ),
                for (final themeOption in [
                  ('theme1', l10n.periodic_table.periodicThemeClassic),
                  ('theme2', l10n.periodic_table.periodicThemeBorder),
                  ('theme3', l10n.periodic_table.periodicThemeGradient),
                  ('theme4', l10n.periodic_table.periodicThemeGradientOutline),
                ])
                  PopupMenuItem(
                    value: themeOption.$1,
                    child: Row(
                      children: [
                        Icon(
                          LucideIcons.check,
                          size: 16,
                          color: periodicTheme == themeOption.$1
                              ? Theme.of(context).colorScheme.primary
                              : Colors.transparent,
                        ),
                        const SizedBox(width: 12),
                        Text(themeOption.$2),
                      ],
                    ),
                  ),
              ],
            ),
          ],
        ],
      ),
      body: syncState.status != PeriodicSyncStatus.success
          ? PeriodicSetupView(
              syncState: syncState,
              onDownloadTriggered: _startDownloadPeriodic,
            )
          : PeriodicTableLayout(
              elements: syncState.elements,
              searchQuery: _searchQuery,
              theme: periodicTheme,
              onElementTap: _showElementDetails,
            ),
    );
  }
}
