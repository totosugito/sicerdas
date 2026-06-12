import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/core/providers/navigation_provider.dart';
import 'package:bse/i18n/strings.g.dart';
import 'package:bse/core/providers/sync_provider.dart';
import 'package:bse/core/config/app_constants.dart';
import 'home_screen.dart';
import '../books/book_screen/books_screen.dart';
import '../profile/profile_screen.dart';
import '../periodic_table/periodic_dictionary/periodic_dictionary.dart';
import 'widgets/sync_overlay.dart';
import 'widgets/custom_bottom_nav_bar.dart';
import 'package:flutter/services.dart';
import 'package:bse/core/utils/toast_utils.dart';

class MainLayout extends ConsumerStatefulWidget {
  const MainLayout({super.key});

  @override
  ConsumerState<MainLayout> createState() => _MainLayoutState();
}

class _MainLayoutState extends ConsumerState<MainLayout> {
  DateTime? _lastPressedAt;

  @override
  void initState() {
    super.initState();
    Future.microtask(() async {
      final success = await _initAppDirectory();
      if (success && mounted) {
        ref.read(syncProvider.notifier).checkInitial();
      }
    });
  }

  Future<bool> _initAppDirectory() async {
    final status = await _createAppDirectory(
      parentDir: AppConstants.appDirParent,
      childDir: const [
        AppConstants.appDirBooks,
        AppConstants.appDirKamus,
        AppConstants.appDirPeriodic,
      ],
    );

    if (!status && mounted) {
      final theme = ShadTheme.of(context);
      final l10n = Translations.of(context);

      showShadDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => ShadDialog(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 320),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  LucideIcons.triangleAlert,
                  size: 32,
                  color: theme.colorScheme.destructive,
                ),
                const SizedBox(height: 16),
                Text(
                  l10n.common.error.title,
                  style: theme.textTheme.large.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 8),
                Text(
                  l10n.common.error.createAppDir,
                  style: theme.textTheme.muted.copyWith(fontSize: 14),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 24),
                ShadButton.destructive(
                  width: double.infinity,
                  onPressed: () => Navigator.of(context).pop(),
                  child: Text(l10n.common.close),
                ),
              ],
            ),
          ),
        ),
      );
    }

    return status;
  }

  Future<bool> _createAppDirectory({
    required String parentDir,
    required List<String> childDir,
  }) async {
    try {
      final dataDir = await getExternalStorageDirectory();
      if (dataDir == null) return false;

      // create parent directory
      final parentPath = p.join(dataDir.path, parentDir);
      final parentDirectory = Directory(parentPath);
      if (!await parentDirectory.exists()) {
        await parentDirectory.create(recursive: true);
      }

      // create child directories
      for (final child in childDir) {
        final childPath = p.join(parentPath, child);
        final childDirectory = Directory(childPath);
        if (!await childDirectory.exists()) {
          await childDirectory.create(recursive: true);
        }
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  @override
  Widget build(BuildContext context) {
    final selectedIndex = ref.watch(navigationProvider);
    final l10n = Translations.of(context);

    if (selectedIndex == 0 || selectedIndex == 1) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        ref.read(syncProvider.notifier).checkInitial();
      });
    }

    // 🚀 Background Sync Feedback
    ref.listen(syncProvider, (previous, next) {
      if (next.status == SyncStatus.success &&
          !next.isInitialSync &&
          next.booksAdded > 0) {
        ShadToaster.of(context).show(
          ShadToast(
            title: Text(l10n.books.badgeNew),
            description: Text(l10n.books.sync.successMessage(count: next.booksAdded)),
          ),
        );
      }
    });

    // Reset exit timer when tab changes
    ref.listen(navigationProvider, (previous, next) {
      if (previous != next) {
        _lastPressedAt = null;
      }
    });

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) {
        if (didPop) return;

        final now = DateTime.now();
        if (_lastPressedAt == null ||
            now.difference(_lastPressedAt!) > const Duration(seconds: 2)) {
          _lastPressedAt = now;
          ToastUtils.showInfo(
            context,
            title: l10n.common.infoTitle,
            message: l10n.common.pressBackAgainToExit,
          );
        } else {
          SystemNavigator.pop();
        }
      },
      child: Stack(
        children: [
          Scaffold(
            body: MediaQuery(
              data: MediaQuery.of(context).removePadding(removeBottom: true),
              child: IndexedStack(
                index: selectedIndex,
                children: [
                  const HomeScreen(),
                  const BooksScreen(),
                  const ChemistryDictionaryScreen(),
                  const ProfileScreen(),
                ],
              ),
            ),
            bottomNavigationBar: SafeArea(
              top: false,
              child: CustomBottomNavBar(
                currentIndex: selectedIndex,
                onTap: (index) {
                  _lastPressedAt = null;
                  ref.read(navigationProvider.notifier).setIndex(index);
                },
                items: [
                  CustomBottomNavBarItem(
                    icon: Icons.home_outlined,
                    activeIcon: Icons.home,
                    label: l10n.common.nav.home,
                  ),
                  CustomBottomNavBarItem(
                    icon: Icons.menu_book_outlined,
                    activeIcon: Icons.menu_book,
                    label: l10n.books.navBooks,
                  ),
                  CustomBottomNavBarItem(
                    icon: Icons.translate_outlined,
                    activeIcon: Icons.translate,
                    label: l10n.common.nav.dictionary,
                  ),
                  CustomBottomNavBarItem(
                    icon: Icons.person_outline,
                    activeIcon: Icons.person,
                    label: l10n.common.nav.profile,
                  ),
                ],
              ),
            ),
          ),
          const SyncOverlay(),
        ],
      ),
    );
  }
}
