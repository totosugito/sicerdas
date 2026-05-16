import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../../l10n/gen_l10n/app_localizations.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import '../../../../core/database/database.dart';
import '../../../../core/utils/book_utils.dart';
import '../../../../core/providers/settings_provider.dart';

class BookListItem extends ConsumerWidget {
  final BookWithMetadata item;
  final int index;

  const BookListItem({super.key, required this.item, required this.index});

  Book get book => item.book;
  Category get category => item.category;
  EducationGrade get grade => item.grade;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = ShadTheme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final l10n = AppLocalizations.of(context)!;
    final cloudUrl = ref.watch(cloudUrlProvider);

    final coverUrl = BookUtils.getBookCoverUrl(baseUrl: cloudUrl, bookId: book.bookId);

    // Premium Shadcn-style Gradient
    final List<Color> thumbnailGradient = [theme.colorScheme.muted, theme.colorScheme.secondary];

    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Container(
        decoration: BoxDecoration(
          color: theme.colorScheme.card,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: theme.colorScheme.border.withValues(alpha: 0.5), width: 0.8),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.05),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(12),
          child: Material(
            color: Colors.transparent,
            child: InkWell(
              onTap: () {
                // TODO: Preview book
              },
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Modern 2:3 Thumbnail with Real Image
                    _buildThumbnail(theme, isDark, thumbnailGradient, coverUrl),
                    const SizedBox(width: 16),
                    // Content Column
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            book.title,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: theme.textTheme.p.copyWith(fontSize: 14, fontWeight: FontWeight.bold, height: 1.25, color: theme.colorScheme.foreground),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            book.author ?? l10n.unknownAuthor,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: theme.textTheme.muted.copyWith(fontSize: 12, fontWeight: FontWeight.w500),
                          ),
                          const SizedBox(height: 1),
                          Text(
                            '${category.name} • ${grade.name}',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: theme.textTheme.muted.copyWith(fontSize: 11, color: theme.colorScheme.mutedForeground.withValues(alpha: 0.8)),
                          ),
                          const SizedBox(height: 6),
                          // Ultra-Thin Minimalist Divider
                          Container(height: 0.5, color: theme.colorScheme.border.withValues(alpha: 0.5)),
                          const SizedBox(height: 6),
                          // Modernized Metadata & Actions
                          _buildFooter(theme, l10n),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildThumbnail(ShadThemeData theme, bool isDark, List<Color> gradient, String imageUrl) {
    return Container(
      width: 60,
      height: 90, // 2:3 Aspect Ratio
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(4),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.1), blurRadius: 4, offset: const Offset(2, 2))],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(4),
        child: imageUrl.isEmpty
            ? _buildPlaceholder(theme, isDark, gradient)
            : CachedNetworkImage(
                imageUrl: imageUrl,
                fit: BoxFit.cover,
                placeholder: (context, url) => _buildPlaceholder(theme, isDark, gradient),
                errorWidget: (context, url, error) => _buildPlaceholder(theme, isDark, gradient, icon: Icons.broken_image_rounded),
              ),
      ),
    );
  }

  Widget _buildPlaceholder(ShadThemeData theme, bool isDark, List<Color> gradient, {IconData? icon}) {
    final foregroundColor = isDark ? Colors.white.withValues(alpha: 0.8) : theme.colorScheme.mutedForeground;

    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(colors: gradient, begin: Alignment.topLeft, end: Alignment.bottomRight),
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
          Positioned(left: 0, top: 0, bottom: 0, width: 3, child: Container(color: Colors.black.withValues(alpha: 0.1))),
          Center(
            child: icon != null
                ? Icon(icon, color: foregroundColor, size: 32)
                : Text(
                    book.title.substring(0, 1).toUpperCase(),
                    style: TextStyle(
                      color: foregroundColor,
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      shadows: isDark ? [const Shadow(color: Colors.black26, offset: Offset(0, 1), blurRadius: 2)] : null,
                    ),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildFooter(ShadThemeData theme, AppLocalizations l10n) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            _buildMetaItem(Icons.auto_stories_outlined, l10n.pagesCount(book.totalPages), theme),
            const SizedBox(width: 8),
            _buildMetaItem(Icons.data_usage_rounded, '${(book.size / 1024 / 1024).toStringAsFixed(1)} MB', theme),
            if (book.publishedYear.isNotEmpty) ...[const SizedBox(width: 8), _buildMetaItem(Icons.calendar_today_rounded, book.publishedYear, theme)],
          ],
        ),
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            _buildActionButton(icon: Icons.chrome_reader_mode_rounded, color: theme.colorScheme.mutedForeground, onPressed: () {}),
            const SizedBox(width: 6),
            _buildActionButton(icon: Icons.file_download_outlined, color: theme.colorScheme.mutedForeground, onPressed: () {}),
          ],
        ),
      ],
    );
  }

  Widget _buildMetaItem(IconData icon, String text, ShadThemeData theme) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 12, color: theme.colorScheme.mutedForeground.withValues(alpha: 0.6)),
        const SizedBox(width: 4),
        Text(text, style: theme.textTheme.muted.copyWith(fontSize: 10, fontWeight: FontWeight.w600, letterSpacing: 0.2)),
      ],
    );
  }

  Widget _buildActionButton({required IconData icon, required Color color, required VoidCallback onPressed, bool isPrimary = false}) {
    return Container(
      width: 32,
      height: 24,
      decoration: BoxDecoration(color: isPrimary ? color.withValues(alpha: 0.1) : Colors.transparent, borderRadius: BorderRadius.circular(8)),
      child: ShadButton.ghost(
        width: 32,
        height: 24,
        padding: EdgeInsets.zero,
        onPressed: onPressed,
        child: Icon(icon, size: 18, color: isPrimary ? color : color.withValues(alpha: 1.0)),
      ),
    );
  }
}
