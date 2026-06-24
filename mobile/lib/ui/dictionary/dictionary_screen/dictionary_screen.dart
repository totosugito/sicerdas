import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/i18n/strings.g.dart';
import '../libs/providers/dictionary_providers.dart';
import 'widgets/word_list_tile.dart';

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
    final resultsAsync = ref.watch(dictionaryResultsProvider);
    final isSwap = ref.watch(dictionaryIsSwapProvider);
    final favoritesOnly = ref.watch(dictionaryFavoritesOnlyProvider);

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
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Search input
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
              const SizedBox(height: 12),

              // Filter & Direction toggles
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  // Direction toggle (ID -> EN / EN -> ID)
                  ShadButton.outline(
                    onPressed: () {
                      ref.read(dictionaryIsSwapProvider.notifier).toggle();
                    },
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(LucideIcons.arrowUpDown, size: 16),
                        const SizedBox(width: 8),
                        Text(
                          isSwap
                              ? 'English ➔ Indonesia'
                              : 'Indonesia ➔ English',
                          style: const TextStyle(fontSize: 13),
                        ),
                      ],
                    ),
                  ),

                  // Favorites toggle
                  ShadButton.ghost(
                    onPressed: () {
                      ref
                          .read(dictionaryFavoritesOnlyProvider.notifier)
                          .toggle();
                    },
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          favoritesOnly
                              ? LucideIcons.bookmarkCheck
                              : LucideIcons.bookmark,
                          size: 18,
                          color: favoritesOnly
                              ? theme.colorScheme.primary
                              : null,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          favoritesOnly
                              ? l10n.dictionary.favoritesOnly
                              : l10n.dictionary.all,
                          style: TextStyle(
                            fontSize: 13,
                            color: favoritesOnly
                                ? theme.colorScheme.primary
                                : null,
                            fontWeight: favoritesOnly ? FontWeight.bold : null,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Search results list
              Expanded(
                child: resultsAsync.when(
                  data: (words) {
                    if (words.isEmpty) {
                      return Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              LucideIcons.searchCode,
                              size: 48,
                              color: theme.colorScheme.mutedForeground,
                            ),
                            const SizedBox(height: 8),
                            Text(
                              favoritesOnly
                                  ? l10n.dictionary.noFavorites
                                  : l10n.dictionary.notFound,
                              style: theme.textTheme.muted,
                            ),
                          ],
                        ),
                      );
                    }

                    return NotificationListener<ScrollNotification>(
                      onNotification: (ScrollNotification scrollInfo) {
                        if (scrollInfo.metrics.pixels >=
                            scrollInfo.metrics.maxScrollExtent - 200) {
                          ref
                              .read(dictionaryResultsProvider.notifier)
                              .loadNextPage();
                        }
                        return true;
                      },
                      child: ListView.separated(
                        itemCount: words.length,
                        separatorBuilder: (context, index) =>
                            Divider(color: theme.colorScheme.border, height: 1),
                        itemBuilder: (context, index) {
                          final word = words[index];
                          return WordListTile(word: word);
                        },
                      ),
                    );
                  },
                  loading: () =>
                      const Center(child: CircularProgressIndicator()),
                  error: (err, stack) => Center(
                    child: Text(
                      l10n.dictionary.errorOccurred(error: err.toString()),
                      style: TextStyle(color: theme.colorScheme.destructive),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
