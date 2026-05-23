import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import '../../../../core/database/database.dart';
import '../../../../core/utils/book_utils.dart';
import '../../../../core/providers/settings_provider.dart';
import '../../../../l10n/gen_l10n/app_localizations.dart';

class BookDetailSheet extends ConsumerWidget {
  final BookWithMetadata item;

  const BookDetailSheet({super.key, required this.item});

  Book get book => item.book;
  Category get category => item.category;
  EducationGrade get grade => item.grade;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = ShadTheme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final l10n = AppLocalizations.of(context)!;
    final cloudUrl = ref.watch(cloudUrlProvider);

    final coverUrl = BookUtils.getBookCoverUrl(
      baseUrl: cloudUrl,
      bookId: book.bookId,
    );
    final placeholderGradient = [
      theme.colorScheme.muted,
      theme.colorScheme.secondary,
    ];

    return Container(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).padding.bottom + 16,
        top: 12,
        left: 20,
        right: 20,
      ),
      decoration: BoxDecoration(
        color: theme.colorScheme.background,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.15),
            blurRadius: 20,
            offset: const Offset(0, -5),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Drag handle at top
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: theme.colorScheme.border,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Scrollable content area to prevent overflow
          Flexible(
            child: SingleChildScrollView(
              physics: const BouncingScrollPhysics(),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Book details header (centered cover & titles)
                  Center(
                    child: Column(
                      children: [
                        // Large cover art with drop shadow
                        Container(
                          width: 110,
                          height: 165, // Enforces clean 2:3 aspect ratio
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(10),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(
                                  alpha: isDark ? 0.4 : 0.15,
                                ),
                                blurRadius: 12,
                                offset: const Offset(0, 6),
                              ),
                            ],
                          ),
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(10),
                            child: coverUrl.isEmpty
                                ? _buildLargePlaceholder(
                                    theme,
                                    isDark,
                                    placeholderGradient,
                                  )
                                : CachedNetworkImage(
                                    imageUrl: coverUrl,
                                    fit: BoxFit.cover,
                                    placeholder: (context, url) =>
                                        _buildLargePlaceholder(
                                          theme,
                                          isDark,
                                          placeholderGradient,
                                        ),
                                    errorWidget: (context, url, error) =>
                                        _buildLargePlaceholder(
                                          theme,
                                          isDark,
                                          placeholderGradient,
                                          icon: Icons.broken_image_rounded,
                                        ),
                                  ),
                          ),
                        ),
                        const SizedBox(height: 16),

                        // Book Title
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          child: Text(
                            book.title,
                            style: theme.textTheme.h4.copyWith(
                              fontWeight: FontWeight.bold,
                              fontSize: 18,
                              color: theme.colorScheme.foreground,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ),
                        const SizedBox(height: 4),

                        // Author
                        Text(
                          book.author ?? l10n.unknownAuthor,
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w400,
                            fontStyle: FontStyle.italic,
                            color: isDark
                                ? theme.colorScheme.foreground.withValues(
                                    alpha: 0.85,
                                  )
                                : const Color(0xFF475569),
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 8),

                        // Category & Grade Tags
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 6,
                          ),
                          decoration: BoxDecoration(
                            color: theme.colorScheme.primary.withValues(
                              alpha: isDark ? 0.15 : 0.06,
                            ),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(
                              color: theme.colorScheme.primary.withValues(
                                alpha: isDark ? 0.25 : 0.1,
                              ),
                              width: 0.8,
                            ),
                          ),
                          child: Text(
                            '${category.name} • ${grade.name}',
                            style: TextStyle(
                              fontSize: 11.5,
                              fontWeight: FontWeight.w600,
                              color: theme.colorScheme.primary,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Divider
                  Container(
                    height: 0.5,
                    color: theme.colorScheme.border.withValues(
                      alpha: isDark ? 0.4 : 0.2,
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Metadata section
                  Text(
                    l10n.detailInformation,
                    style: theme.textTheme.large.copyWith(
                      fontWeight: FontWeight.bold,
                      fontSize: 15,
                      color: theme.colorScheme.foreground,
                    ),
                  ),
                  const SizedBox(height: 10),

                  // Neat Info Grid
                  _buildInfoGrid(context, theme, l10n, isDark),
                  const SizedBox(height: 16),
                ],
              ),
            ),
          ),

          const SizedBox(height: 16),

          // Actions Row (sticky bottom)
          Row(
            children: [
              Expanded(
                child: ShadButton.outline(
                  onPressed: () {},
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.file_download_outlined,
                        size: 18,
                        color: theme.colorScheme.foreground,
                      ),
                      const SizedBox(width: 8),
                      Text(l10n.downloadBookAction),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ShadButton(
                  onPressed: () {},
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(
                        Icons.menu_book_outlined,
                        size: 18,
                        color: Colors.white,
                      ),
                      const SizedBox(width: 8),
                      Text(l10n.readNowAction),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildLargePlaceholder(
    ShadThemeData theme,
    bool isDark,
    List<Color> gradient, {
    IconData? icon,
  }) {
    final foregroundColor = isDark
        ? Colors.white.withValues(alpha: 0.8)
        : theme.colorScheme.mutedForeground;

    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: gradient,
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Stack(
        children: [
          Positioned.fill(
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    Colors.white.withValues(alpha: isDark ? 0.1 : 0.4),
                    Colors.transparent,
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
            ),
          ),
          Positioned(
            left: 0,
            top: 0,
            bottom: 0,
            width: 4,
            child: Container(color: Colors.black.withValues(alpha: 0.12)),
          ),
          Center(
            child: icon != null
                ? Icon(icon, color: foregroundColor, size: 36)
                : Text(
                    book.title.substring(0, 1).toUpperCase(),
                    style: TextStyle(
                      color: foregroundColor,
                      fontSize: 36,
                      fontWeight: FontWeight.bold,
                      shadows: isDark
                          ? [
                              const Shadow(
                                color: Colors.black26,
                                offset: Offset(0, 1),
                                blurRadius: 2,
                              ),
                            ]
                          : null,
                    ),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoGrid(
    BuildContext context,
    ShadThemeData theme,
    AppLocalizations l10n,
    bool isDark,
  ) {
    return Column(
      children: [
        Row(
          children: [
            Expanded(
              child: _buildInfoItem(
                l10n.totalPagesLabel,
                l10n.pagesCount(book.totalPages),
                Icons.auto_stories_outlined,
                isDark,
              ),
            ),
            Expanded(
              child: _buildInfoItem(
                l10n.fileSizeLabel,
                BookUtils.formatFileSize(book.size),
                Icons.storage_outlined,
                isDark,
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: _buildInfoItem(
                l10n.publishedYearLabel,
                book.publishedYear.isNotEmpty ? book.publishedYear : '-',
                Icons.calendar_today_outlined,
                isDark,
              ),
            ),
            Expanded(
              child: _buildInfoItem(
                l10n.bookIdLabel,
                '${book.bookId}',
                Icons.tag_outlined,
                isDark,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildInfoItem(
    String label,
    String value,
    IconData icon,
    bool isDark,
  ) {
    final titleColor = isDark
        ? Colors.white.withValues(alpha: 0.9)
        : const Color(0xFF334155);
    final subtitleColor = isDark
        ? Colors.white.withValues(alpha: 0.6)
        : const Color(0xFF64748B);

    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: isDark
                ? Colors.white.withValues(alpha: 0.05)
                : const Color(0xFFF1F5F9),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, size: 16, color: subtitleColor),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w400,
                  color: subtitleColor,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                value,
                style: TextStyle(
                  fontSize: 12.5,
                  fontWeight: FontWeight.w600,
                  color: titleColor,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ],
    );
  }
}
