import 'package:flutter/material.dart';
import 'package:bse/i18n/strings.g.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/core/database/database.dart';
import 'package:bse/core/providers/database_provider.dart';
import 'package:bse/widgets/error_view.dart';
import 'package:bse/widgets/loading_view.dart';
import 'package:bse/widgets/ads/ads_native.dart';
import '../libs/providers/books_provider.dart';
import '../book_screen/widgets/book_list_item.dart';
import 'widgets/filter_bar.dart';
import 'widgets/group_detail_header.dart';
import 'package:bse/widgets/sliver_sticky_header_delegate.dart';

// Local state for GroupDetail filtering
class GroupDetailFilter {
  final String search;
  final String sortBy;
  final bool descending;
  final List<int> gradeIds;

  GroupDetailFilter({
    this.search = '',
    this.sortBy = 'version',
    this.descending = true,
    this.gradeIds = const [],
  });

  GroupDetailFilter copyWith({
    String? search,
    String? sortBy,
    bool? descending,
    List<int>? gradeIds,
  }) {
    return GroupDetailFilter(
      search: search ?? this.search,
      sortBy: sortBy ?? this.sortBy,
      descending: descending ?? this.descending,
      gradeIds: gradeIds ?? this.gradeIds,
    );
  }
}

class GroupDetailNotifier extends Notifier<GroupDetailFilter> {
  @override
  GroupDetailFilter build() => GroupDetailFilter();

  void updateSearch(String value) => state = state.copyWith(search: value);
  void updateAll(GroupDetailFilter newFilter) => state = newFilter;
}

final groupDetailFilterProvider =
    NotifierProvider<GroupDetailNotifier, GroupDetailFilter>(
      GroupDetailNotifier.new,
    );

final groupGradesProvider = StreamProvider.family<List<EducationGrade>, int>((
  ref,
  groupId,
) {
  return ref.watch(databaseProvider).watchGradesByGroup(groupId);
});

final groupBooksProvider = StreamProvider.family<List<BookWithMetadata>, int>((
  ref,
  groupId,
) {
  final db = ref.watch(databaseProvider);
  final filter = ref.watch(groupDetailFilterProvider);
  final latestVersionId = ref.watch(latestBookVersionIdProvider).value;

  return db
      .watchFilteredBooks(
        groupId: groupId,
        gradeIds: filter.gradeIds.isEmpty ? null : filter.gradeIds,
        search: filter.search,
        sortBy: filter.sortBy,
        descending: filter.descending,
      )
      .map((books) {
        return books.map((b) {
          return b.copyWith(
            isNew:
                latestVersionId != null && b.book.versionId == latestVersionId,
          );
        }).toList();
      });
});

class GroupDetailScreen extends ConsumerWidget {
  final BookGroup group;

  const GroupDetailScreen({super.key, required this.group});

  Widget _buildBookList(BuildContext context, List<BookWithMetadata> books, bool showAds) {
    final hasAd = showAds && books.length > 3;
    final childCount = hasAd ? books.length + 1 : books.length;

    return SliverPadding(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
      sliver: SliverList(
        delegate: SliverChildBuilderDelegate(
          (context, index) {
            if (hasAd && index == 3) {
              return const Padding(
                padding: EdgeInsets.symmetric(vertical: 8.0),
                child: AdsNative(templateType: AdsTemplateType.small),
              );
            }
            final bookIndex = (hasAd && index > 3) ? index - 1 : index;
            final item = books[bookIndex];
            return BookListItem(item: item, index: bookIndex);
          },
          childCount: childCount,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = ShadTheme.of(context);
    final booksAsync = ref.watch(groupBooksProvider(group.id));
    final showAds = ref.watch(showNativeAdsProvider);

    // Automatically clean global filter when group grades are loaded/changed
    ref.listen(groupGradesProvider(group.id), (previous, next) {
      if (next is AsyncData<List<EducationGrade>>) {
        final availableIds = next.value.map((e) => e.id).toSet();
        final currentFilter = ref.read(groupDetailFilterProvider);
        final validGradeIds = currentFilter.gradeIds
            .where((id) => availableIds.contains(id))
            .toList();

        if (validGradeIds.length != currentFilter.gradeIds.length) {
          ref
              .read(groupDetailFilterProvider.notifier)
              .updateAll(currentFilter.copyWith(gradeIds: validGradeIds));
        }
      }
    });

    return Scaffold(
      backgroundColor: theme.colorScheme.background,
      body: CustomScrollView(
        slivers: [
          // Collapsible Hero Header
          GroupDetailHeader(group: group),

          // Sticky Filter Bar
          SliverPersistentHeader(
            pinned: true,
            delegate: SliverStickyHeaderDelegate(
              height: 62.0,
              backgroundColor: theme.colorScheme.background,
              child: FilterBar(groupId: group.id),
            ),
          ),

          booksAsync.when(
            data: (books) {
              if (books.isEmpty) {
                return SliverFillRemaining(
                  hasScrollBody: false,
                  child: Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.library_books_rounded,
                          size: 48,
                          color: theme.colorScheme.mutedForeground.withValues(
                            alpha: 0.5,
                          ),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          context.t.books.noBooksFound,
                          style: theme.textTheme.muted,
                        ),
                      ],
                    ),
                  ),
                );
              }
              return _buildBookList(context, books, showAds);
            },
            loading: () {
              if (booksAsync.hasValue) {
                final books = booksAsync.value!;
                if (books.isEmpty) {
                  return const SliverFillRemaining(
                    hasScrollBody: false,
                    child: LoadingView(),
                  );
                }
                return _buildBookList(context, books, showAds);
              }
              return const SliverFillRemaining(
                hasScrollBody: false,
                child: LoadingView(),
              );
            },
            error: (err, _) {
              if (booksAsync.hasValue) {
                final books = booksAsync.value!;
                return _buildBookList(context, books, showAds);
              }
              return SliverFillRemaining(
                hasScrollBody: false,
                child: ErrorView(
                  message: context.t.auth.error.generic,
                  details: err.toString(),
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}
