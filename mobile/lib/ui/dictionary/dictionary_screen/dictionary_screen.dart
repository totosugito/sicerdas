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

        final isKbbi = activePackage.packName.toLowerCase().contains('kbbi');
        final directionLabel = isKbbi
            ? 'Bahasa Indonesia (KBBI)'
            : (isSwap ? 'English ➔ Indonesia' : 'Indonesia ➔ English');
        final showSwap = !isKbbi;

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
                    icon: const Icon(LucideIcons.database),
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) =>
                              const DictionaryPackageListScreen(),
                        ),
                      );
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
                  height: 120.0,
                  backgroundColor: theme.colorScheme.background,
                  child: Container(
                    padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
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
                        const SizedBox(height: 10),

                        // Swappers and toggles row
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            if (showSwap)
                              ShadButton.outline(
                                height: 32,
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 10,
                                ),
                                onPressed: () {
                                  ref
                                      .read(dictionaryIsSwapProvider.notifier)
                                      .toggle();
                                },
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    const Icon(
                                      LucideIcons.arrowLeftRight,
                                      size: 14,
                                    ),
                                    const SizedBox(width: 6),
                                    Text(
                                      directionLabel,
                                      style: const TextStyle(fontSize: 12),
                                    ),
                                  ],
                                ),
                              )
                            else
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 10,
                                  vertical: 6,
                                ),
                                decoration: BoxDecoration(
                                  color: theme.colorScheme.muted,
                                  borderRadius: BorderRadius.circular(6),
                                  border: Border.all(
                                    color: theme.colorScheme.border,
                                  ),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(
                                      LucideIcons.bookOpen,
                                      size: 14,
                                      color: theme.colorScheme.mutedForeground,
                                    ),
                                    const SizedBox(width: 6),
                                    Text(
                                      directionLabel,
                                      style: TextStyle(
                                        fontSize: 12,
                                        color:
                                            theme.colorScheme.mutedForeground,
                                        fontWeight: FontWeight.w500,
                                      ),
                                    ),
                                  ],
                                ),
                              ),

                            // Favorites Filter Button
                            ShadButton.ghost(
                              height: 32,
                              padding: const EdgeInsets.symmetric(
                                horizontal: 10,
                              ),
                              onPressed: () {
                                ref
                                    .read(
                                      dictionaryFavoritesOnlyProvider.notifier,
                                    )
                                    .toggle();
                              },
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(
                                    favoritesOnly
                                        ? LucideIcons.bookmarkCheck
                                        : LucideIcons.bookmark,
                                    size: 16,
                                    color: favoritesOnly
                                        ? theme.colorScheme.primary
                                        : null,
                                  ),
                                  const SizedBox(width: 6),
                                  Text(
                                    favoritesOnly
                                        ? l10n.dictionary.favoritesOnly
                                        : l10n.dictionary.all,
                                    style: TextStyle(
                                      fontSize: 12,
                                      color: favoritesOnly
                                          ? theme.colorScheme.primary
                                          : null,
                                      fontWeight: favoritesOnly
                                          ? FontWeight.bold
                                          : null,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
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
