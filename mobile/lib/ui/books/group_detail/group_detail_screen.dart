import 'package:flutter/material.dart';
import 'package:bse/l10n/gen_l10n/app_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/core/database/database.dart';
import 'package:bse/core/providers/database_provider.dart';
import 'package:bse/widgets/error_view.dart';
import 'package:bse/widgets/loading_view.dart';
import '../libs/providers/books_provider.dart';
import '../book_screen/widgets/book_list_item.dart';
import 'widgets/filter_bar.dart';

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

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = ShadTheme.of(context);
    final booksAsync = ref.watch(groupBooksProvider(group.id));

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

    final booksCount = booksAsync.value?.length;
    final subtitleText = booksCount != null
        ? AppLocalizations.of(context)!.booksCount(
            booksCount,
            '$booksCount${group.bookTotal != null ? " / ${group.bookTotal}" : ""}',
          )
        : (group.bookTotal != null
              ? AppLocalizations.of(
                  context,
                )!.booksCount(group.bookTotal!, '${group.bookTotal}')
              : AppLocalizations.of(context)!.booksCount(0, '0'));

    return Scaffold(
      backgroundColor: theme.colorScheme.background,
      body: CustomScrollView(
        slivers: [
          // Collapsible Hero Header
          SliverAppBar(
            expandedHeight: 140.0,
            pinned: true,
            backgroundColor: theme.brightness == Brightness.dark
                ? theme.colorScheme.card
                : theme.colorScheme.primary,
            iconTheme: const IconThemeData(color: Colors.white),
            titleSpacing: 0,
            flexibleSpace: FlexibleSpaceBar(
              title: Builder(
                builder: (context) {
                  final settings = context
                      .dependOnInheritedWidgetOfExactType<
                        FlexibleSpaceBarSettings
                      >();
                  double collapseProgress = 0.0;
                  if (settings != null) {
                    final deltaExtent = settings.maxExtent - settings.minExtent;
                    if (deltaExtent > 0.0) {
                      collapseProgress =
                          (1.0 -
                                  (settings.currentExtent -
                                          settings.minExtent) /
                                      deltaExtent)
                              .clamp(0.0, 1.0);
                    }
                  }
                  final showBadge = collapseProgress > 0.85;
                  final opacity = showBadge
                      ? (collapseProgress - 0.85) / 0.15
                      : 0.0;

                  return Row(
                    mainAxisSize: MainAxisSize.max,
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      Flexible(
                        child: Text(
                          group.name,
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      if (showBadge)
                        Opacity(
                          opacity: opacity.clamp(0.0, 1.0),
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 6,
                              vertical: 2,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.2),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Text(
                              booksCount != null
                                  ? '$booksCount${group.bookTotal != null ? " / ${group.bookTotal}" : ""}'
                                  : '${group.bookTotal ?? 0}',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 9,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ),
                    ],
                  );
                },
              ),
              titlePadding: const EdgeInsets.only(
                left: 48,
                bottom: 14,
                right: 16,
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
                        Icons.library_books_rounded,
                        size: 90,
                        color: Colors.white.withValues(alpha: 0.15),
                      ),
                    ),
                    Positioned(
                      left: 48,
                      bottom: 54,
                      child: Text(
                        subtitleText,
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

          // Sticky Filter Bar
          SliverPersistentHeader(
            pinned: true,
            delegate: _StickyHeaderDelegate(
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
                          AppLocalizations.of(context)!.noBooksFound,
                          style: theme.textTheme.muted,
                        ),
                      ],
                    ),
                  ),
                );
              }
              return SliverPadding(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                sliver: SliverList(
                  delegate: SliverChildBuilderDelegate((context, index) {
                    final item = books[index];
                    return BookListItem(item: item, index: index);
                  }, childCount: books.length),
                ),
              );
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
                return SliverPadding(
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                  sliver: SliverList(
                    delegate: SliverChildBuilderDelegate((context, index) {
                      final item = books[index];
                      return BookListItem(item: item, index: index);
                    }, childCount: books.length),
                  ),
                );
              }
              return const SliverFillRemaining(
                hasScrollBody: false,
                child: LoadingView(),
              );
            },
            error: (err, _) {
              if (booksAsync.hasValue) {
                final books = booksAsync.value!;
                return SliverPadding(
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                  sliver: SliverList(
                    delegate: SliverChildBuilderDelegate((context, index) {
                      final item = books[index];
                      return BookListItem(item: item, index: index);
                    }, childCount: books.length),
                  ),
                );
              }
              return SliverFillRemaining(
                hasScrollBody: false,
                child: ErrorView(
                  message: AppLocalizations.of(context)!.errorGeneric,
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

class _StickyHeaderDelegate extends SliverPersistentHeaderDelegate {
  final Widget child;
  final double height;
  final Color backgroundColor;

  _StickyHeaderDelegate({
    required this.child,
    required this.height,
    required this.backgroundColor,
  });

  @override
  double get minExtent => height;

  @override
  double get maxExtent => height;

  @override
  Widget build(
    BuildContext context,
    double shrinkOffset,
    bool overlapsContent,
  ) {
    return Container(color: backgroundColor, child: child);
  }

  @override
  bool shouldRebuild(covariant _StickyHeaderDelegate oldDelegate) {
    return oldDelegate.child != child ||
        oldDelegate.height != height ||
        oldDelegate.backgroundColor != backgroundColor;
  }
}
