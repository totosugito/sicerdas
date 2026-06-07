import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import '../../../../l10n/gen_l10n/app_localizations.dart';
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
                    onPressed: onDownloadTriggered,
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
}
