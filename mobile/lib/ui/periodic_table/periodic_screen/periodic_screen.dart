import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import '../../../core/database/database.dart';
import '../../../core/providers/dio_provider.dart';
import '../../../core/network/api_endpoints.dart';
import '../../../l10n/gen_l10n/app_localizations.dart';
import '../../../core/providers/settings_provider.dart';
import '../../../core/utils/toast_utils.dart';
import '../../widgets/download_progress_dialog.dart';
import '../libs/providers/periodic_sync_provider.dart';
import 'widgets/periodic_setup_view.dart';
import 'widgets/periodic_table_layout.dart';
import 'widgets/element_overview_sheet.dart';
import '../element_detail/element_detail.dart';
import '../periodic_dictionary/periodic_dictionary.dart';
import '../element-comparison/element_comparison.dart';

class PeriodicScreen extends ConsumerStatefulWidget {
  const PeriodicScreen({super.key});

  @override
  ConsumerState<PeriodicScreen> createState() => _PeriodicScreenState();
}

class _PeriodicScreenState extends ConsumerState<PeriodicScreen> {
  final TextEditingController _searchController = TextEditingController();
  final _popoverController = ShadPopoverController();
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
    _popoverController.dispose();
    super.dispose();
  }

  void _showElementDetails(PeriodicElement element) {
    final settings = ref.read(settingsProvider);
    final periodicTheme = settings.periodicTheme;
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
    final l10n = AppLocalizations.of(context)!;
    final dio = ref.read(dioProvider);
    final tempDir = await getTemporaryDirectory();
    if (!mounted) return;
    final tempZipPath = p.join(tempDir.path, 'periodic-table.zip');

    final result = await DownloadProgressDialog.show<bool>(
      context,
      title: l10n.periodicTable,
      message: l10n.periodicDownloadingMessage,
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
    AppLocalizations l10n,
    String? errorKey,
    String? defaultMessage,
  ) {
    if (errorKey == 'syncFailedMessage') {
      return l10n.syncFailedMessage;
    }
    if (errorKey == 'periodicErrorEmptyZip') {
      return l10n.periodicErrorEmptyZip;
    }
    if (errorKey == 'periodicErrorJsonNotFound') {
      return l10n.periodicErrorJsonNotFound;
    }
    if (errorKey == 'periodicErrorStorageNotFound') {
      return l10n.periodicErrorStorageNotFound;
    }
    return defaultMessage ?? l10n.syncFailedMessage;
  }

  @override
  Widget build(BuildContext context) {
    final syncState = ref.watch(periodicSyncProvider);
    final l10n = AppLocalizations.of(context)!;

    // Listen for sync/download events to show toast notifications
    ref.listen<PeriodicSyncState>(periodicSyncProvider, (previous, next) {
      if (next.status == PeriodicSyncStatus.success &&
          previous?.status == PeriodicSyncStatus.downloading) {
        ToastUtils.showSuccess(
          context,
          title: l10n.successTitle,
          message: l10n.periodicSyncSuccessMessage,
        );
      } else if (next.status == PeriodicSyncStatus.error &&
          previous?.status == PeriodicSyncStatus.downloading) {
        ToastUtils.showError(
          context,
          title: l10n.errorTitle,
          message: _getLocalizedError(l10n, next.errorKey, next.errorMessage),
        );
      }
    });

    // Get periodic table theme from preferences
    final settings = ref.watch(settingsProvider);
    final periodicTheme = settings.periodicTheme;

    return Scaffold(
      appBar: AppBar(
        title: _isSearching
            ? ShadInput(
                controller: _searchController,
                placeholder: Text(l10n.periodicSearchPlaceholder),
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
                l10n.periodicTable,
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
            IconButton(
              icon: const Icon(LucideIcons.book),
              tooltip: l10n.chemistryDictionary,
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const ChemistryDictionaryScreen(),
                  ),
                );
              },
            ),
            IconButton(
              icon: const Icon(LucideIcons.gitCompare),
              tooltip: l10n.elementComparisonTitle,
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const ElementComparisonScreen(),
                  ),
                );
              },
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
