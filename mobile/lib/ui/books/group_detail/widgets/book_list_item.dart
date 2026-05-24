import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../../l10n/gen_l10n/app_localizations.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import '../../../../core/database/database.dart';
import '../../../../core/utils/book_utils.dart';
import '../../../../core/providers/settings_provider.dart';
import '../../../widgets/new_badge.dart';
import 'book_detail_sheet.dart';

class BookListItem extends ConsumerWidget {
  final BookWithMetadata item;
  final int index;

  const BookListItem({super.key, required this.item, required this.index});

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

    // Placeholder gradient
    final List<Color> thumbnailGradient = [
      theme.colorScheme.muted,
      theme.colorScheme.secondary,
    ];

    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Container(
        decoration: BoxDecoration(
          color: theme.colorScheme.card,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: theme.colorScheme.border.withValues(
              alpha: isDark ? 0.4 : 0.15,
            ),
            width: 0.8,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: isDark ? 0.25 : 0.04),
              blurRadius: 16,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(16),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Modern 2:3 Thumbnail directly (no backing plate)
                GestureDetector(
                  onTap: () => _showBookDetail(context),
                  behavior: HitTestBehavior.opaque,
                  child: _buildThumbnail(
                    theme,
                    isDark,
                    thumbnailGradient,
                    coverUrl,
                  ),
                ),
                const SizedBox(width: 14),
                // Content Column
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      GestureDetector(
                        onTap: () => _showBookDetail(context),
                        behavior: HitTestBehavior.opaque,
                        child: Text.rich(
                          TextSpan(
                            children: [
                              if (item.isNew) ...[
                                const WidgetSpan(
                                  alignment: PlaceholderAlignment.middle,
                                  child: NewBadge(),
                                ),
                              ],
                              TextSpan(
                                text: book.title,
                                style: theme.textTheme.p.copyWith(
                                  fontSize: 15,
                                  fontWeight: FontWeight.bold,
                                  height: 1.2,
                                  letterSpacing: -0.3,
                                  color: theme.colorScheme.foreground,
                                ),
                              ),
                            ],
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        book.author ?? l10n.unknownAuthor,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          fontSize: 12.5,
                          fontWeight: FontWeight.w400,
                          fontStyle: FontStyle.italic,
                          color: isDark
                              ? theme.colorScheme.foreground.withValues(
                                  alpha: 0.85,
                                )
                              : const Color(0xFF475569),
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '${category.name} • ${grade.name}',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          fontSize: 11.5,
                          fontWeight: FontWeight.w400,
                          color: isDark
                              ? theme.colorScheme.foreground.withValues(
                                  alpha: 0.65,
                                )
                              : const Color(0xFF64748B),
                        ),
                      ),
                      const SizedBox(height: 8),
                      // Modernized Metadata & Actions
                      _buildFooter(theme, l10n, isDark),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildThumbnail(
    ShadThemeData theme,
    bool isDark,
    List<Color> gradient,
    String imageUrl,
  ) {
    return Container(
      width: 60,
      height: 90, // Clean 2:3 Aspect Ratio for direct book cover artwork
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(6),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.3 : 0.08),
            blurRadius: 8,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(6),
        child: imageUrl.isEmpty
            ? _buildPlaceholder(theme, isDark, gradient)
            : CachedNetworkImage(
                imageUrl: imageUrl,
                fit: BoxFit.cover,
                placeholder: (context, url) =>
                    _buildPlaceholder(theme, isDark, gradient),
                errorWidget: (context, url, error) => _buildPlaceholder(
                  theme,
                  isDark,
                  gradient,
                  icon: Icons.broken_image_rounded,
                ),
              ),
      ),
    );
  }

  Widget _buildPlaceholder(
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
          // Glossy Shine Overlay
          Positioned.fill(
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    Colors.white.withValues(alpha: isDark ? 0.1 : 0.5),
                    Colors.transparent,
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
            ),
          ),
          // Simple Spine Line
          Positioned(
            left: 0,
            top: 0,
            bottom: 0,
            width: 3,
            child: Container(color: Colors.black.withValues(alpha: 0.1)),
          ),
          Center(
            child: icon != null
                ? Icon(icon, color: foregroundColor, size: 28)
                : Text(
                    book.title.substring(0, 1).toUpperCase(),
                    style: TextStyle(
                      color: foregroundColor,
                      fontSize: 22,
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

  Widget _buildFooter(ShadThemeData theme, AppLocalizations l10n, bool isDark) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            _buildMetaItem(
              Icons.auto_stories_outlined,
              l10n.pagesCount(book.totalPages),
              theme,
              isDark,
            ),
            const SizedBox(width: 12),
            _buildMetaItem(
              Icons.storage_outlined,
              BookUtils.formatFileSize(book.size),
              theme,
              isDark,
            ),
            if (book.publishedYear.isNotEmpty) ...[
              const SizedBox(width: 12),
              _buildMetaItem(
                Icons.calendar_today_outlined,
                book.publishedYear,
                theme,
                isDark,
              ),
            ],
          ],
        ),
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            _buildActionButton(
              icon: Icons.menu_book_outlined,
              color: isDark
                  ? theme.colorScheme.foreground.withValues(alpha: 0.85)
                  : const Color(0xFF64748B),
              onPressed: () {},
            ),
            const SizedBox(width: 14),
            _buildActionButton(
              icon: Icons.file_download_outlined,
              color: isDark
                  ? theme.colorScheme.foreground.withValues(alpha: 0.85)
                  : const Color(0xFF64748B),
              onPressed: () {},
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildMetaItem(
    IconData icon,
    String text,
    ShadThemeData theme,
    bool isDark,
  ) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(
          icon,
          size: 14,
          color: isDark
              ? theme.colorScheme.foreground.withValues(alpha: 0.6)
              : const Color(0xFF64748B),
        ),
        const SizedBox(width: 5),
        Text(
          text,
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w500,
            color: isDark
                ? theme.colorScheme.foreground.withValues(alpha: 0.65)
                : const Color(0xFF64748B),
          ),
        ),
      ],
    );
  }

  Widget _buildActionButton({
    required IconData icon,
    required Color color,
    required VoidCallback onPressed,
  }) {
    return SizedBox(
      width: 24,
      height: 24,
      child: ShadButton.ghost(
        width: 24,
        height: 24,
        padding: EdgeInsets.zero,
        onPressed: onPressed,
        child: Icon(icon, size: 20, color: color),
      ),
    );
  }
}
