import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/core/providers/navigation_provider.dart';
import 'package:bse/core/providers/sync_provider.dart';
import 'package:bse/core/services/version_service.dart';
import 'package:bse/i18n/strings.g.dart';

class SyncOverlay extends ConsumerWidget {
  const SyncOverlay({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final selectedIndex = ref.watch(navigationProvider);
    final syncState = ref.watch(syncProvider);
    final theme = ShadTheme.of(context);
    final l10n = Translations.of(context);

    if (!syncState.isInitialSync ||
        (selectedIndex != 0 && selectedIndex != 1)) {
      return const SizedBox.shrink();
    }

    return Container(
      color: theme.colorScheme.background.withValues(alpha: 0.8),
      child: Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 400),
            child: ShadCard(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (syncState.status == SyncStatus.idle) ...[
                    const Icon(LucideIcons.package2, size: 32),
                    const SizedBox(height: 16),
                    Text(
                      l10n.books.sync.initialDownloadTitle,
                      style: theme.textTheme.large.copyWith(
                        fontWeight: FontWeight.w700,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      l10n.books.sync.initialDownloadMessage,
                      style: theme.textTheme.muted.copyWith(fontSize: 14),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 24),
                    ShadButton(
                      width: double.infinity,
                      onPressed: () => ref
                          .read(versionServiceProvider)
                          .checkAndSync(force: true),
                      child: Text(l10n.books.sync.downloadNow),
                    ),
                  ] else if (syncState.status == SyncStatus.syncing) ...[
                    const Icon(LucideIcons.refreshCcw, size: 32),
                    const SizedBox(height: 16),
                    Text(
                      l10n.books.sync.preparingData,
                      style: theme.textTheme.large.copyWith(
                        fontWeight: FontWeight.w700,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      l10n.books.sync.waitMessage,
                      style: theme.textTheme.muted.copyWith(fontSize: 14),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 24),
                    const ShadProgress(),
                  ] else if (syncState.status == SyncStatus.success) ...[
                    const Icon(
                      LucideIcons.circleCheck,
                      size: 32,
                      color: Colors.green,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      l10n.books.sync.successMessage(count: syncState.booksAdded),
                      style: theme.textTheme.large.copyWith(
                        fontWeight: FontWeight.w700,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 24),
                    ShadButton(
                      width: double.infinity,
                      onPressed: () => ref.read(syncProvider.notifier).reset(),
                      child: Text(l10n.common.close),
                    ),
                  ] else if (syncState.status == SyncStatus.error) ...[
                    Icon(
                      LucideIcons.wifiOff,
                      size: 32,
                      color: theme.colorScheme.destructive,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      l10n.books.sync.connectionRequired,
                      style: theme.textTheme.large.copyWith(
                        fontWeight: FontWeight.w700,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      _getSyncErrorMessage(l10n, syncState.errorKey),
                      style: theme.textTheme.muted.copyWith(fontSize: 14),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 24),
                    ShadButton(
                      width: double.infinity,
                      onPressed: () => ref
                          .read(versionServiceProvider)
                          .checkAndSync(force: true),
                      child: Text(l10n.books.sync.tryAgain),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  String _getSyncErrorMessage(Translations l10n, String? key) {
    if (key == 'syncInternetRequiredMessage') {
      return l10n.books.sync.internetRequiredMessage;
    }
    if (key == 'syncFailedMessage') {
      return l10n.books.sync.failedMessage;
    }
    return l10n.books.sync.failedMessage;
  }
}
