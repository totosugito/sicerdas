import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/i18n/strings.g.dart';
import '../../libs/providers/periodic_sync_provider.dart';

class PeriodicSetupView extends StatelessWidget {
  final PeriodicSyncState syncState;
  final VoidCallback onDownloadTriggered;

  const PeriodicSetupView({
    super.key,
    required this.syncState,
    required this.onDownloadTriggered,
  });

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);
    final l10n = Translations.of(context);

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
                  Text(l10n.periodic_table.sections.checking),
                ] else if (syncState.status ==
                    PeriodicSyncStatus.notDownloaded) ...[
                  const Icon(LucideIcons.package2, size: 48),
                  const SizedBox(height: 16),
                  Text(
                    l10n.periodic_table.setup.title,
                    style: theme.textTheme.large.copyWith(
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    l10n.periodic_table.setup.message,
                    style: theme.textTheme.muted,
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 24),
                  ShadButton(
                    width: double.infinity,
                    onPressed: onDownloadTriggered,
                    child: Text(l10n.books.sync.downloadNow),
                  ),
                ] else if (syncState.status ==
                    PeriodicSyncStatus.downloading) ...[
                  const Icon(LucideIcons.refreshCcw, size: 48),
                  const SizedBox(height: 16),
                  Text(
                    l10n.periodic_table.download.title,
                    style: theme.textTheme.large.copyWith(
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(l10n.periodic_table.download.message),
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
                    l10n.periodic_table.sync.failedTitle,
                    style: theme.textTheme.large.copyWith(
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    _getLocalizedError(
                      l10n,
                      syncState.errorKey,
                      syncState.errorMessage,
                    ),
                    style: theme.textTheme.muted,
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 24),
                  ShadButton(
                    width: double.infinity,
                    onPressed: onDownloadTriggered,
                    child: Text(l10n.books.sync.tryAgain),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }

  String _getLocalizedError(
    Translations l10n,
    String? errorKey,
    String? defaultMessage,
  ) {
    if (errorKey == 'syncFailedMessage') {
      return l10n.books.sync.failedMessage;
    }
    if (errorKey == 'periodicErrorEmptyZip') {
      return l10n.periodic_table.error.emptyZip;
    }
    if (errorKey == 'periodicErrorJsonNotFound') {
      return l10n.periodic_table.error.jsonNotFound;
    }
    if (errorKey == 'periodicErrorStorageNotFound') {
      return l10n.periodic_table.error.storageNotFound;
    }
    return defaultMessage ?? l10n.books.sync.failedMessage;
  }
}
