import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/l10n/gen_l10n/app_localizations.dart';
import 'package:bse/widgets/error_view.dart';
import 'package:bse/widgets/loading_view.dart';
import '../libs/providers/books_provider.dart';
import '../latest_books/latest_books_screen.dart';
import 'widgets/category_card.dart';
import 'widgets/latest_books_card.dart';
import 'widgets/group_book_header.dart';
import 'package:bse/core/providers/settings_provider.dart';
import 'package:bse/widgets/ads/ads_banner.dart';

class GroupBookScreen extends ConsumerWidget {
  const GroupBookScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context)!;
    final categoriesAsync = ref.watch(categoriesWithGroupsProvider);
    final allGroupsAsync = ref.watch(allGroupsProvider);
    final latestBooksAsync = ref.watch(unfilteredLatestBooksStreamProvider);

    final theme = ShadTheme.of(context);
    final showAds = ref.watch(appSettingsProvider)?.showAds ?? false;

    return Scaffold(
      backgroundColor: theme.colorScheme.background,
      body: CustomScrollView(
        slivers: [
          const GroupBookHeader(),

          // Main Content Slivers
          categoriesAsync.when(
            data: (categories) => allGroupsAsync.when(
              data: (groups) {
                if (categories.isEmpty) {
                  return SliverFillRemaining(
                    hasScrollBody: false,
                    child: Center(child: Text(l10n.noCategoriesFound)),
                  );
                }

                final showLatest =
                    latestBooksAsync.value != null &&
                    latestBooksAsync.value!.isNotEmpty;

                return SliverPadding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 8,
                  ),
                  sliver: SliverList(
                    delegate: SliverChildBuilderDelegate((context, index) {
                      if (showLatest && index == 0) {
                        return const LatestBooksCard();
                      }

                      final categoryIndex = showLatest ? index - 1 : index;
                      final category = categories[categoryIndex];
                      final categoryGroups = groups
                          .where((g) => g.group.categoryId == category.id)
                          .toList();

                      return CategoryCard(
                        category: category,
                        groups: categoryGroups,
                        index: categoryIndex,
                      );
                    }, childCount: categories.length + (showLatest ? 1 : 0)),
                  ),
                );
              },
              loading: () => const SliverFillRemaining(
                hasScrollBody: false,
                child: LoadingView(),
              ),
              error: (err, _) => SliverFillRemaining(
                hasScrollBody: false,
                child: ErrorView(
                  message: l10n.errorLoadingGroups,
                  details: err.toString(),
                ),
              ),
            ),
            loading: () => const SliverFillRemaining(
              hasScrollBody: false,
              child: LoadingView(),
            ),
            error: (err, _) => SliverFillRemaining(
              hasScrollBody: false,
              child: ErrorView(
                message: l10n.errorLoadingCategories,
                details: err.toString(),
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: showAds ? const AdsBanner() : null,
    );
  }
}
