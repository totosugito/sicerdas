import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../../core/providers/books_provider.dart';
import '../../../../core/providers/settings_provider.dart';
import '../../../../core/database/database.dart';
import '../../../../core/utils/book_utils.dart';
import '../../../../core/utils/toast_utils.dart';
import '../../../../l10n/gen_l10n/app_localizations.dart';
import '../../../widgets/confirmation_dialog.dart';
import '../../../pdf_viewer/pdf_viewer_screen.dart';
import 'book_detail_sheet.dart';

class BookItem extends ConsumerWidget {
  final BookWithMetadata item;

  const BookItem({super.key, required this.item});

  Book get book => item.book;
  Category get category => item.category;
  EducationGrade get grade => item.grade;

  void _showBookDetail(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => BookDetailSheet(item: item),
    );
  }

  Future<void> _readBook(BuildContext context) async {
    final filePath = await book.getLocalFileName();
    if (context.mounted) {
      Navigator.of(context).push(
        MaterialPageRoute(
          builder: (context) =>
              PdfViewerScreen(filePath: filePath, title: book.title),
        ),
      );
    }
  }

  Future<void> _deleteBook(BuildContext context, WidgetRef ref) async {
    final l10n = AppLocalizations.of(context)!;
    final theme = ShadTheme.of(context);

    ConfirmationDialog.show(
      context,
      icon: Icons.delete_outline,
      title: l10n.deleteBookConfirmTitle,
      descriptionWidget: Text.rich(
        TextSpan(
          style: theme.textTheme.muted.copyWith(fontSize: 14),
          children: [
            TextSpan(text: l10n.deleteBookConfirmPrefix),
            TextSpan(
              text: book.title,
              style: TextStyle(
                fontWeight: FontWeight.bold,
                color: theme.colorScheme.foreground,
              ),
            ),
            TextSpan(text: l10n.deleteBookConfirmSuffix),
          ],
        ),
        textAlign: TextAlign.center,
      ),
      confirmLabel: l10n.deleteAction,
      cancelLabel: l10n.cancel,
      onConfirm: () async {
        Navigator.of(context).pop();
        final success = await book.deleteLocalFile();
        if (success && context.mounted) {
          ref.read(downloadedBookIdsProvider.notifier).removeId(book.bookId);
          ToastUtils.showSuccess(
            context,
            title: book.title,
            message: l10n.deleteBookSuccess,
          );
        }
      },
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = ShadTheme.of(context);
    final l10n = AppLocalizations.of(context)!;
    final cloudUrl = ref.watch(cloudUrlProvider);
    final coverUrl = BookUtils.getBookCoverUrl(
      baseUrl: cloudUrl,
      bookId: book.bookId,
    );

    return GestureDetector(
      onTap: () => _readBook(context),
      child: ShadCard(
        padding: EdgeInsets.zero,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Stack(
                children: [
                  Positioned.fill(
                    child: ClipRRect(
                      borderRadius: const BorderRadius.vertical(
                        top: Radius.circular(8),
                      ),
                      child: coverUrl.isEmpty
                          ? Container(
                              color: theme.colorScheme.muted,
                              child: Center(
                                child: Icon(
                                  Icons.book,
                                  size: 48,
                                  color: theme.colorScheme.mutedForeground,
                                ),
                              ),
                            )
                          : CachedNetworkImage(
                              imageUrl: coverUrl,
                              fit: BoxFit.cover,
                              placeholder: (context, url) => Container(
                                color: theme.colorScheme.muted,
                                child: const Center(
                                  child: CircularProgressIndicator(),
                                ),
                              ),
                              errorWidget: (context, url, error) => Container(
                                color: theme.colorScheme.muted,
                                child: Center(
                                  child: Icon(
                                    Icons.broken_image_rounded,
                                    size: 48,
                                    color: theme.colorScheme.mutedForeground,
                                  ),
                                ),
                              ),
                            ),
                    ),
                  ),
                  Positioned(
                    top: 8,
                    right: 8,
                    child: Container(
                      width: 32,
                      height: 32,
                      decoration: BoxDecoration(
                        color: theme.colorScheme.popover.withValues(alpha: 0.9),
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: theme.colorScheme.border,
                          width: 1,
                        ),
                      ),
                      child: ClipOval(
                        child: Material(
                          color: Colors.transparent,
                          child: PopupMenuButton<String>(
                            padding: EdgeInsets.zero,
                            icon: Icon(
                              Icons.more_vert_rounded,
                              color: theme.colorScheme.foreground,
                              size: 18,
                            ),
                            onSelected: (value) {
                              if (value == 'info') {
                                _showBookDetail(context);
                              } else if (value == 'delete') {
                                _deleteBook(context, ref);
                              }
                            },
                            itemBuilder: (context) => [
                              PopupMenuItem(
                                value: 'info',
                                child: Row(
                                  children: [
                                    Icon(
                                      Icons.info_outline_rounded,
                                      size: 18,
                                      color: theme.colorScheme.foreground,
                                    ),
                                    const SizedBox(width: 8),
                                    Text(l10n.detailInformation),
                                  ],
                                ),
                              ),
                              PopupMenuItem(
                                value: 'delete',
                                child: Row(
                                  children: [
                                    Icon(
                                      Icons.delete_outline_rounded,
                                      size: 18,
                                      color: theme.colorScheme.destructive,
                                    ),
                                    const SizedBox(width: 8),
                                    Text(
                                      l10n.deleteAction,
                                      style: TextStyle(
                                        color: theme.colorScheme.destructive,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(8.0, 12.0, 8.0, 12.0),
              child: Text(
                book.title,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: theme.textTheme.small.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
