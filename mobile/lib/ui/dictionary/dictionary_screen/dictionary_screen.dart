import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/i18n/strings.g.dart';
import 'package:bse/core/providers/database_provider.dart';
import 'package:bse/widgets/sliver_sticky_header_delegate.dart';
import 'package:bse/widgets/empty_state.dart';
import 'package:bse/widgets/ads/ads_banner.dart';
import 'package:path/path.dart' as p;
import '../libs/providers/dictionary_providers.dart';
import '../libs/providers/dictionary_package_provider.dart';
import '../libs/model/dictionary_package.dart';
import '../dictionary_package/dictionary_package_list.dart';
import 'widgets/word_list_tile.dart';
import 'widgets/word_skeleton_item.dart';

class DictionaryScreen extends ConsumerStatefulWidget {
  const DictionaryScreen({super.key});

  @override
  ConsumerState<DictionaryScreen> createState() => _DictionaryScreenState();
}

class _DictionaryScreenState extends ConsumerState<DictionaryScreen> {
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _searchController.addListener(() {
      ref.read(dictionarySearchQueryProvider.notifier).state =
          _searchController.text;
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);
    final l10n = Translations.of(context);
    final activeDbVal = ref.watch(activeDictionaryDbProvider);
    final resultsAsync = ref.watch(dictionaryResultsProvider);
    final isSwap = ref.watch(dictionaryIsSwapProvider);
    final favoritesOnly = ref.watch(dictionaryFavoritesOnlyProvider);
    final packagesAsync = ref.watch(dictionaryPackagesProvider);
    final localDbsAsync = ref.watch(localDownloadedDbFilesProvider);

    return activeDbVal.when(
      data: (activePath) {
        if (activePath == null) {
          return Scaffold(
            appBar: AppBar(
              title: Text(
                l10n.dictionary.title,
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
              elevation: 0,
              backgroundColor: Colors.transparent,
              foregroundColor: theme.colorScheme.foreground,
            ),
            body: EmptyState(
              icon: LucideIcons.databaseBackup,
              title: l10n.dictionary.packageList.noDbWarning,
              actionLabel: l10n.dictionary.packageList.title,
              onActionPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const DictionaryPackageListScreen(),
                  ),
                );
              },
            ),
            bottomNavigationBar: AdsBanner.buildBottomBar(ref),
          );
        }

        final packages = packagesAsync.value ?? [];
        final activeFilename = p.basename(activePath);
        final activePackage = packages.firstWhere(
          (pkg) => '${pkg.packName}.db' == activeFilename,
          orElse: () => DictionaryPackage(
            packId: -1,
            packName: '',
            packReleaseDate: '',
            packFileSize: 0,
            packTitle: l10n.dictionary.title,
            packSource: '',
            packDesc: '',
            packUrl: '',
            packWordInfo: [],
            packSampleScreen: [],
          ),
        );
        const dictMap = {"id": "Indonesia", "en": "English", "kb": "KBBI"};

        return Scaffold(
          backgroundColor: theme.colorScheme.background,
          body: CustomScrollView(
            slivers: [
              // Collapsible Header
              SliverAppBar(
                expandedHeight: 140.0,
                pinned: true,
                backgroundColor: theme.brightness == Brightness.dark
                    ? theme.colorScheme.card
                    : theme.colorScheme.primary,
                iconTheme: const IconThemeData(color: Colors.white),
                titleSpacing: 0,
                actions: [
                  IconButton(
                    icon: Icon(
                      favoritesOnly
                          ? LucideIcons.bookmarkCheck
                          : LucideIcons.bookmark,
                    ),
                    tooltip: favoritesOnly
                        ? l10n.dictionary.all
                        : l10n.dictionary.favoritesOnly,
                    onPressed: () {
                      ref
                          .read(dictionaryFavoritesOnlyProvider.notifier)
                          .toggle();
                    },
                  ),
                  PopupMenuButton<String>(
                    icon: const Icon(LucideIcons.database),
                    tooltip: l10n.dictionary.packageList.title,
                    onSelected: (value) async {
                      if (value == '__manage__') {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) =>
                                const DictionaryPackageListScreen(),
                          ),
                        );
                      } else {
                        final parts = value.split('|');
                        final dbFile = parts[0];
                        final isSwap = parts.length > 1 && parts[1] == 'true';

                        await ref
                            .read(activeDictionaryDbProvider.notifier)
                            .setActiveDb(dbFile);

                        ref
                            .read(dictionaryIsSwapProvider.notifier)
                            .setSwap(isSwap);
                      }
                    },
                    itemBuilder: (context) {
                      final localDbs = localDbsAsync.value ?? [];
                      final List<PopupMenuEntry<String>> items = [];

                      if (localDbs.isEmpty) {
                        items.add(
                          const PopupMenuItem<String>(
                            enabled: false,
                            child: Text('No downloaded dictionaries'),
                          ),
                        );
                      } else {
                        for (final dbFile in localDbs) {
                          final dbNameWithoutExt = dbFile.split('.').first;
                          final pParts = dbNameWithoutExt.split('_');
                          final isActiveDb = dbFile == activeFilename;

                          final pkg = packages.firstWhere(
                            (p) => p.packName == dbNameWithoutExt,
                            orElse: () => DictionaryPackage(
                              packId: -1,
                              packName: dbNameWithoutExt,
                              packReleaseDate: '',
                              packFileSize: 0,
                              packTitle: '',
                              packSource: '',
                              packDesc: '',
                              packUrl: '',
                              packWordInfo: [],
                              packSampleScreen: [],
                            ),
                          );

                          final isKbbi =
                              dbNameWithoutExt.toLowerCase().contains('_kb_') ||
                              (pParts.length >= 3 &&
                                  (pParts[1].toLowerCase() == 'kb' ||
                                      pParts[2].toLowerCase() == 'kb'));

                          if (isKbbi) {
                            final isActive = isActiveDb;
                            items.add(
                              PopupMenuItem<String>(
                                value: '$dbFile|false',
                                child: Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    const Expanded(
                                      child: Text(
                                        'KBBI',
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                    if (isActive) ...[
                                      const SizedBox(width: 8),
                                      const Icon(LucideIcons.check, size: 16),
                                    ],
                                  ],
                                ),
                              ),
                            );
                          } else if (pParts.length >= 3) {
                            final code1 = pParts[1].toLowerCase();
                            final code2 = pParts[2].toLowerCase();
                            final lang1 = dictMap[code1] ?? code1.toUpperCase();
                            final lang2 = dictMap[code2] ?? code2.toUpperCase();

                            if (code1 != code2) {
                              // First direction: lang1 ➔ lang2 (isSwap = false)
                              final isActive1 = isActiveDb && !isSwap;
                              items.add(
                                PopupMenuItem<String>(
                                  value: '$dbFile|false',
                                  child: Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                    children: [
                                      Expanded(
                                        child: Text(
                                          pkg.packTitle.isNotEmpty
                                              ? '$lang1 ➔ $lang2'
                                              : '$lang1 ➔ $lang2',
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                      if (isActive1) ...[
                                        const SizedBox(width: 8),
                                        const Icon(LucideIcons.check, size: 16),
                                      ],
                                    ],
                                  ),
                                ),
                              );

                              // Second direction: lang2 ➔ lang1 (isSwap = true)
                              final isActive2 = isActiveDb && isSwap;
                              items.add(
                                PopupMenuItem<String>(
                                  value: '$dbFile|true',
                                  child: Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                    children: [
                                      Expanded(
                                        child: Text(
                                          pkg.packTitle.isNotEmpty
                                              ? '$lang2 ➔ $lang1'
                                              : '$lang2 ➔ $lang1',
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                      if (isActive2) ...[
                                        const SizedBox(width: 8),
                                        const Icon(LucideIcons.check, size: 16),
                                      ],
                                    ],
                                  ),
                                ),
                              );
                            } else {
                              final isActive = isActiveDb;
                              items.add(
                                PopupMenuItem<String>(
                                  value: '$dbFile|false',
                                  child: Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                    children: [
                                      Expanded(
                                        child: Text(
                                          pkg.packTitle.isNotEmpty
                                              ? pkg.packTitle
                                              : lang1,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                      if (isActive) ...[
                                        const SizedBox(width: 8),
                                        const Icon(LucideIcons.check, size: 16),
                                      ],
                                    ],
                                  ),
                                ),
                              );
                            }
                          } else {
                            final isActive = isActiveDb;
                            items.add(
                              PopupMenuItem<String>(
                                value: '$dbFile|false',
                                child: Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    Expanded(
                                      child: Text(
                                        pkg.packTitle.isNotEmpty
                                            ? pkg.packTitle
                                            : dbNameWithoutExt,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                    if (isActive) ...[
                                      const SizedBox(width: 8),
                                      const Icon(LucideIcons.check, size: 16),
                                    ],
                                  ],
                                ),
                              ),
                            );
                          }
                        }
                      }

                      items.add(const PopupMenuDivider());
                      items.add(
                        PopupMenuItem<String>(
                          value: '__manage__',
                          child: Row(
                            children: [
                              const Icon(LucideIcons.settings, size: 16),
                              const SizedBox(width: 8),
                              Text(l10n.dictionary.packageList.title),
                            ],
                          ),
                        ),
                      );

                      return items;
                    },
                  ),
                ],
                flexibleSpace: FlexibleSpaceBar(
                  title: Text(
                    l10n.dictionary.title,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                  titlePadding: const EdgeInsets.only(
                    left: 48,
                    bottom: 14,
                    right: 48,
                  ),
                  background: Container(
                    decoration: BoxDecoration(
                      color: theme.brightness == Brightness.dark
                          ? theme.colorScheme.card
                          : theme.colorScheme.primary,
                    ),
                    child: Stack(
                      children: [
                        Positioned(
                          right: -10,
                          bottom: -15,
                          child: Icon(
                            LucideIcons.bookOpen,
                            size: 90,
                            color: Colors.white.withValues(alpha: 0.15),
                          ),
                        ),
                        if (activePackage.packTitle.isNotEmpty)
                          Positioned(
                            left: 48,
                            bottom: 54,
                            child: Text(
                              activePackage.packTitle,
                              style: TextStyle(
                                color: Colors.white.withValues(alpha: 0.85),
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                ),
              ),

              // Sticky Search & Filter Header
              SliverPersistentHeader(
                pinned: true,
                delegate: SliverStickyHeaderDelegate(
                  height: 68.0,
                  backgroundColor: theme.colorScheme.background,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 12,
                    ),
                    decoration: BoxDecoration(
                      border: Border(
                        bottom: BorderSide(
                          color: theme.colorScheme.border.withValues(
                            alpha: 0.5,
                          ),
                          width: 1,
                        ),
                      ),
                    ),
                    child: Column(
                      children: [
                        // Search Input
                        ShadInput(
                          controller: _searchController,
                          placeholder: Text(l10n.dictionary.searchPlaceholder),
                          leading: const Padding(
                            padding: EdgeInsets.symmetric(horizontal: 8.0),
                            child: Icon(LucideIcons.search, size: 18),
                          ),
                          trailing: _searchController.text.isNotEmpty
                              ? GestureDetector(
                                  onTap: () {
                                    _searchController.clear();
                                  },
                                  child: const Icon(LucideIcons.x, size: 18),
                                )
                              : null,
                        ),
                      ],
                    ),
                  ),
                ),
              ),

              // Search results list
              resultsAsync.when(
                data: (words) {
                  if (words.isEmpty) {
                    return SliverFillRemaining(
                      hasScrollBody: false,
                      child: EmptyState(
                        icon: favoritesOnly
                            ? LucideIcons.bookmark
                            : LucideIcons.searchCode,
                        title: favoritesOnly
                            ? l10n.dictionary.noFavorites
                            : l10n.dictionary.notFound,
                      ),
                    );
                  }

                  return SliverPadding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8.0,
                      vertical: 8.0,
                    ),
                    sliver: SliverList(
                      delegate: SliverChildBuilderDelegate((context, index) {
                        // Infinite scroll check
                        if (index == words.length - 5) {
                          ref
                              .read(dictionaryResultsProvider.notifier)
                              .loadNextPage();
                        }
                        final word = words[index];
                        return Column(
                          children: [
                            WordListTile(word: word),
                            if (index < words.length - 1)
                              Divider(
                                color: theme.colorScheme.border.withValues(
                                  alpha: 0.5,
                                ),
                                height: 1,
                                indent: 12,
                                endIndent: 12,
                              ),
                          ],
                        );
                      }, childCount: words.length),
                    ),
                  );
                },
                loading: () => SliverPadding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8.0,
                    vertical: 8.0,
                  ),
                  sliver: SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (context, index) => const WordSkeletonItem(),
                      childCount: 8,
                    ),
                  ),
                ),
                error: (err, stack) => SliverFillRemaining(
                  hasScrollBody: false,
                  child: Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          LucideIcons.triangleAlert,
                          color: theme.colorScheme.destructive,
                          size: 44,
                        ),
                        const SizedBox(height: 12),
                        Text(
                          l10n.dictionary.errorOccurred(error: err.toString()),
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            color: theme.colorScheme.destructive,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        const SizedBox(height: 20),
                        ShadButton(
                          onPressed: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) =>
                                    const DictionaryPackageListScreen(),
                              ),
                            );
                          },
                          child: Text(l10n.dictionary.packageList.title),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
          bottomNavigationBar: AdsBanner.buildBottomBar(ref),
        );
      },
      loading: () =>
          const Scaffold(body: Center(child: CircularProgressIndicator())),
      error: (err, stack) => Scaffold(
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  LucideIcons.triangleAlert,
                  color: theme.colorScheme.destructive,
                  size: 44,
                ),
                const SizedBox(height: 12),
                Text(
                  l10n.dictionary.errorOccurred(error: err.toString()),
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: theme.colorScheme.destructive,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 20),
                ShadButton(
                  onPressed: () async {
                    await ref
                        .read(activeDictionaryDbProvider.notifier)
                        .clearActiveDb();
                  },
                  child: Text(l10n.dictionary.resetDatabase),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
