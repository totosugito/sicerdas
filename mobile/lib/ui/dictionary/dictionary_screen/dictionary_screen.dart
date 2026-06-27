import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/i18n/strings.g.dart';
import 'package:bse/widgets/sliver_sticky_header_delegate.dart';
import 'package:bse/widgets/empty_state.dart';
import 'package:bse/widgets/ads/ads_banner.dart';
import '../libs/providers/dictionary_providers.dart';
import '../libs/providers/dictionary_package_provider.dart';
import '../dictionary_package/dictionary_package_list.dart';
import 'widgets/word_list_tile.dart';
import 'widgets/word_skeleton_item.dart';
import 'widgets/dictionary_app_bar.dart';

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

    if (activeDbVal.isLoading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    if (activeDbVal.hasError) {
      return Scaffold(
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
                  l10n.dictionary.errorOccurred(
                    error: activeDbVal.error.toString(),
                  ),
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
      );
    }

    final resultsAsync = ref.watch(dictionaryResultsProvider);
    final favoritesOnly = ref.watch(dictionaryFavoritesOnlyProvider);
    final localDbsAsync = ref.watch(localDownloadedDbFilesProvider);

    final activePath = activeDbVal.value;
    final localDbs = localDbsAsync.value ?? [];
    if (activePath == null) {
      if (localDbs.isNotEmpty) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          ref
              .read(activeDictionaryDbProvider.notifier)
              .setActiveDb(localDbs.first);
        });
        return Scaffold(
          backgroundColor: theme.colorScheme.background,
          body: const Center(child: CircularProgressIndicator()),
        );
      }

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

    return Scaffold(
      backgroundColor: theme.colorScheme.background,
      body: CustomScrollView(
        slivers: [
          // Collapsible Header
          const DictionaryAppBar(),

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
                      color: theme.colorScheme.border.withValues(alpha: 0.5),
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
  }
}
