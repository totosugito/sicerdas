import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import '../core/providers/navigation_provider.dart';
import '../l10n/gen_l10n/app_localizations.dart';
import 'home/home_screen.dart';
import 'placeholder_screens.dart';
import 'profile/profile_screen.dart';
import '../core/services/version_service.dart';
import '../core/providers/sync_provider.dart';

class MainLayout extends ConsumerStatefulWidget {
  const MainLayout({super.key});

  @override
  ConsumerState<MainLayout> createState() => _MainLayoutState();
}

class _MainLayoutState extends ConsumerState<MainLayout> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref.read(syncProvider.notifier).checkInitial();
    });
  }

  @override
  Widget build(BuildContext context) {
    final selectedIndex = ref.watch(navigationProvider);
    final l10n = AppLocalizations.of(context)!;
    final syncState = ref.watch(syncProvider);
    final theme = ShadTheme.of(context);

    // 🚀 Background Sync Feedback
    ref.listen(syncProvider, (previous, next) {
      if (next.status == SyncStatus.success && !next.isInitialSync && next.booksAdded > 0) {
        ShadToaster.of(context).show(
          ShadToast(
            title: Text(l10n.badgeNew),
            description: Text(l10n.syncSuccessMessage(next.booksAdded)),
          ),
        );
      }
    });

    return Stack(
      children: [
        Scaffold(
          body: IndexedStack(
            index: selectedIndex,
            children: [
              const HomeScreen(),
              const BooksScreen(),
              const DictionaryScreen(),
              const ProfileScreen(),
            ],
          ),
          bottomNavigationBar: NavigationBar(
            selectedIndex: selectedIndex,
            onDestinationSelected: (index) {
              ref.read(navigationProvider.notifier).setIndex(index);
            },
            destinations: [
              NavigationDestination(
                icon: const Icon(Icons.home_outlined),
                selectedIcon: const Icon(Icons.home),
                label: l10n.navHome,
              ),
              NavigationDestination(
                icon: const Icon(Icons.menu_book_outlined),
                selectedIcon: const Icon(Icons.menu_book),
                label: l10n.navBooks,
              ),
              NavigationDestination(
                icon: const Icon(Icons.translate_outlined),
                selectedIcon: const Icon(Icons.translate),
                label: l10n.navDictionary,
              ),
              NavigationDestination(
                icon: const Icon(Icons.person_outline),
                selectedIcon: const Icon(Icons.person),
                label: l10n.navProfile,
              ),
            ],
          ),
        ),
        
        // ✨ Shadcn UI Sync Overlay ✨
        if (syncState.isInitialSync)
          Container(
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
                            l10n.syncInitialDownloadTitle,
                            style: theme.textTheme.large.copyWith(fontWeight: FontWeight.w700),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 8),
                          Text(
                            l10n.syncInitialDownloadMessage,
                            style: theme.textTheme.muted.copyWith(fontSize: 14),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 24),
                          ShadButton(
                            width: double.infinity,
                            onPressed: () => ref.read(versionServiceProvider).checkAndSync(force: true),
                            child: Text(l10n.syncDownloadNow),
                          ),
                        ] else if (syncState.status == SyncStatus.syncing) ...[
                          const Icon(LucideIcons.refreshCcw, size: 32),
                          const SizedBox(height: 16),
                          Text(
                            l10n.syncPreparingData,
                            style: theme.textTheme.large.copyWith(fontWeight: FontWeight.w700),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 8),
                          Text(
                            l10n.syncWaitMessage,
                            style: theme.textTheme.muted.copyWith(fontSize: 14),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 24),
                          const ShadProgress(),
                        ] else if (syncState.status == SyncStatus.success) ...[
                          const Icon(LucideIcons.circleCheck, size: 32, color: Colors.green),
                          const SizedBox(height: 16),
                          Text(
                            l10n.syncSuccessMessage(syncState.booksAdded),
                            style: theme.textTheme.large.copyWith(fontWeight: FontWeight.w700),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 24),
                          ShadButton(
                            width: double.infinity,
                            onPressed: () => ref.read(syncProvider.notifier).reset(),
                            child: Text(l10n.close),
                          ),
                        ] else if (syncState.status == SyncStatus.error) ...[
                          Icon(
                            LucideIcons.wifiOff, 
                            size: 32, 
                            color: theme.colorScheme.destructive
                          ),
                          const SizedBox(height: 16),
                          Text(
                            l10n.syncConnectionRequired,
                            style: theme.textTheme.large.copyWith(fontWeight: FontWeight.w700),
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
                            onPressed: () => ref.read(versionServiceProvider).checkAndSync(force: true),
                            child: Text(l10n.syncTryAgain),
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
      ],
    );
  }

  String _getSyncErrorMessage(AppLocalizations l10n, String? key) {
    if (key == 'syncInternetRequiredMessage') return l10n.syncInternetRequiredMessage;
    if (key == 'syncFailedMessage') return l10n.syncFailedMessage;
    return l10n.syncFailedMessage;
  }
}
