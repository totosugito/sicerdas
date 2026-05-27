import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../l10n/gen_l10n/app_localizations.dart';
import '../../../core/database/database.dart';
import '../../../core/providers/database_provider.dart';
import '../../../core/providers/books_provider.dart';
import '../../../core/providers/settings_provider.dart';
import '../../../core/utils/book_utils.dart';
import '../../books/latest_books/latest_books_screen.dart';
import '../../books/book_screen/widgets/book_detail_sheet.dart';
import '../../widgets/error_view.dart';
import '../../widgets/loading_view.dart';

final homeLatestBooksProvider = StreamProvider<List<BookWithMetadata>>((ref) {
  final db = ref.watch(databaseProvider);
  final latestVersion = ref.watch(latestBookVersionIdProvider).value;
  if (latestVersion == null) return Stream.value([]);

  return db.watchFilteredBooks(versionId: latestVersion).map((books) {
    return books.take(10).map((b) => b.copyWith(isNew: true)).toList();
  });
});

class LatestBooksSection extends ConsumerWidget {
  const LatestBooksSection({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context)!;
    final theme = ShadTheme.of(context);
    final booksAsync = ref.watch(homeLatestBooksProvider);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              l10n.latestBooks,
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            TextButton(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const LatestBooksScreen(),
                  ),
                );
              },
              child: Row(
                children: [
                  Text(
                    l10n.seeAll,
                    style: TextStyle(color: theme.colorScheme.primary),
                  ),
                  const SizedBox(width: 4),
                  Icon(
                    Icons.arrow_forward,
                    size: 16,
                    color: theme.colorScheme.primary,
                  ),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 256,
          child: booksAsync.when(
            data: (books) {
              if (books.isEmpty) {
                return Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.library_books_rounded,
                        size: 40,
                        color: theme.colorScheme.mutedForeground.withValues(
                          alpha: 0.5,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Text(l10n.noBooksFound, style: theme.textTheme.muted),
                    ],
                  ),
                );
              }
              return ListView.builder(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.only(bottom: 12, top: 4),
                itemCount: books.length,
                itemBuilder: (context, index) {
                  final item = books[index];
                  return _BookCard(item: item, l10n: l10n);
                },
              );
            },
            loading: () => const LoadingView(),
            error: (err, _) => ErrorView(
              message: l10n.errorGeneric,
              details: err.toString(),
            ),
          ),
        ),
      ],
    );
  }
}

class _BookCard extends ConsumerWidget {
  final BookWithMetadata item;
  final AppLocalizations l10n;

  const _BookCard({required this.item, required this.l10n});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = ShadTheme.of(context);
    final cloudUrl = ref.watch(cloudUrlProvider);
    final isDark = theme.brightness == Brightness.dark;

    final coverUrl = BookUtils.getBookCoverUrl(
      baseUrl: cloudUrl,
      bookId: item.book.bookId,
    );

    return GestureDetector(
      onTap: () {
        showModalBottomSheet(
          context: context,
          isScrollControlled: true,
          backgroundColor: Colors.transparent,
          builder: (context) => BookDetailSheet(item: item),
        );
      },
      child: Container(
        width: 160,
        margin: const EdgeInsets.only(right: 16),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: isDark ? 0.3 : 0.08),
              blurRadius: 8,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(16),
          child: coverUrl.isEmpty
              ? Container(
                  color: isDark ? Colors.grey[850] : Colors.grey[200],
                  child: const Center(
                    child: Icon(Icons.book, color: Colors.grey),
                  ),
                )
              : CachedNetworkImage(
                  imageUrl: coverUrl,
                  fit: BoxFit.cover,
                  width: double.infinity,
                  height: double.infinity,
                  placeholder: (context, url) => Container(
                    color: isDark ? Colors.grey[850] : Colors.grey[100],
                    child: const LoadingView(size: 24),
                  ),
                  errorWidget: (context, url, error) => Container(
                    color: isDark ? Colors.grey[850] : Colors.grey[100],
                    child: const Icon(Icons.book, color: Colors.grey),
                  ),
                ),
        ),
      ),
    );
  }
}
