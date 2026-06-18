import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/i18n/strings.g.dart';
import 'package:bse/core/utils/toast_utils.dart';
import 'package:share_plus/share_plus.dart';

class SearchHighlightText extends StatelessWidget {
  final String text;
  final String query;
  final TextStyle style;
  final TextStyle highlightStyle;

  const SearchHighlightText({
    super.key,
    required this.text,
    required this.query,
    required this.style,
    required this.highlightStyle,
  });

  @override
  Widget build(BuildContext context) {
    if (query.isEmpty) {
      return Text(text, style: style);
    }
    final List<InlineSpan> spans = [];
    final lowercaseText = text.toLowerCase();
    final lowercaseQuery = query.toLowerCase();
    int start = 0;
    while (true) {
      final index = lowercaseText.indexOf(lowercaseQuery, start);
      if (index == -1) {
        spans.add(TextSpan(text: text.substring(start), style: style));
        break;
      }
      if (index > start) {
        spans.add(TextSpan(text: text.substring(start, index), style: style));
      }
      spans.add(
        TextSpan(
          text: text.substring(index, index + query.length),
          style: highlightStyle,
        ),
      );
      start = index + query.length;
    }
    return Text.rich(TextSpan(children: spans));
  }
}

class Uud1945Card extends StatefulWidget {
  final String title;
  final List<dynamic> data;
  final String? bab;
  final String? amandemen;
  final String searchTerm;
  final bool forceExpand;

  const Uud1945Card({
    super.key,
    required this.title,
    required this.data,
    this.bab,
    this.amandemen,
    required this.searchTerm,
    required this.forceExpand,
  });

  @override
  State<Uud1945Card> createState() => _Uud1945CardState();
}

class _Uud1945CardState extends State<Uud1945Card> {
  late bool _isExpanded;

  String _getCopyStringValue(Translations l10n, String languageCode) {
    final isIndonesian = languageCode == 'id';
    String str = "--- ${l10n.constitution.uud1945Title} ---\n";
    if (widget.bab != null && widget.bab!.isNotEmpty) {
      str = "$str${widget.bab}\n";
    }
    str = "$str${widget.title}\n";
    if (widget.amandemen != null &&
        widget.amandemen != '0' &&
        widget.amandemen!.isNotEmpty) {
      str = isIndonesian
          ? "${str}Amandemen ke-${widget.amandemen}\n"
          : "${str}Amendment no. ${widget.amandemen}\n";
    }
    str = "$str\n";

    final filteredAyat = widget.searchTerm.isEmpty
        ? widget.data
        : widget.data.where((a) {
            final isi = a['isi'] as String;
            return isi.toLowerCase().contains(widget.searchTerm.toLowerCase());
          }).toList();

    for (final item in filteredAyat) {
      final ayatId = item['id'];
      final isi = item['isi'];
      str = "$str${l10n.constitution.constitution.clause} $ayatId: $isi\n";
    }
    return str;
  }

  @override
  void initState() {
    super.initState();
    _isExpanded = widget.forceExpand;
  }

  @override
  void didUpdateWidget(covariant Uud1945Card oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.forceExpand != oldWidget.forceExpand) {
      _isExpanded = widget.forceExpand;
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);
    final l10n = Translations.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final languageCode = Localizations.localeOf(context).languageCode;
    final isIndonesian = languageCode == 'id';

    final filteredAyat = widget.searchTerm.isEmpty
        ? widget.data
        : widget.data.where((a) {
            final isi = a['isi'] as String;
            return isi.toLowerCase().contains(widget.searchTerm.toLowerCase());
          }).toList();

    final totalCount = widget.data.length;
    final matchingCount = filteredAyat.length;

    if (matchingCount == 0 && widget.searchTerm.isNotEmpty) {
      return const SizedBox.shrink();
    }

    final String articleClean = widget.title
        .replaceAll("Pasal ", "")
        .replaceAll(" (Aturan Peralihan)", "")
        .replaceAll(" (Aturan Tambahan)", "");

    final bool isTransitional = widget.title.contains("(Aturan Peralihan)");
    final bool isAdditional = widget.title.contains("(Aturan Tambahan)");

    final String badgeLabel = isTransitional
        ? (isIndonesian ? "Aturan Peralihan" : "Transitional")
        : isAdditional
            ? (isIndonesian ? "Aturan Tambahan" : "Additional")
            : l10n.constitution.constitution.article;

    final String countLabel = widget.searchTerm.isNotEmpty
        ? (isIndonesian
            ? "Cocok: $matchingCount dari $totalCount ayat"
            : "Matched: $matchingCount of $totalCount clauses")
        : (isIndonesian
            ? "$totalCount Ayat"
            : "$totalCount ${totalCount == 1 ? 'Clause' : 'Clauses'}");

    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: ShadCard(
        padding: const EdgeInsets.all(16.0),
        backgroundColor: theme.colorScheme.card,
        border: ShadBorder.all(
          color: theme.colorScheme.destructive.withValues(
            alpha: isDark ? 0.2 : 0.1,
          ),
          width: 1.5,
        ),
        radius: BorderRadius.circular(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Clickable Header
            GestureDetector(
              behavior: HitTestBehavior.opaque,
              onTap: () {
                setState(() {
                  _isExpanded = !_isExpanded;
                });
              },
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Icon/Number box
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: isDark
                          ? theme.colorScheme.destructive.withValues(alpha: 0.1)
                          : theme.colorScheme.destructive.withValues(
                              alpha: 0.05,
                            ),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: theme.colorScheme.destructive.withValues(
                          alpha: isDark ? 0.25 : 0.15,
                        ),
                        width: 1.5,
                      ),
                    ),
                    child: Text(
                      articleClean,
                      style: TextStyle(
                        color: theme.colorScheme.destructive,
                        fontWeight: FontWeight.bold,
                        fontSize: 18,
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  // Title and details
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Wrap(
                              spacing: 6,
                              runSpacing: 4,
                              children: [
                                ShadBadge(
                                  backgroundColor: theme.colorScheme.destructive,
                                  foregroundColor: Colors.white,
                                  child: Text(
                                    badgeLabel,
                                    style: const TextStyle(
                                      fontSize: 10,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                                if (widget.amandemen != null &&
                                    widget.amandemen != '0' &&
                                    widget.amandemen!.isNotEmpty)
                                  ShadBadge(
                                    backgroundColor: const Color(0xFF2563EB),
                                    foregroundColor: Colors.white,
                                    child: Text(
                                      isIndonesian
                                          ? "Amandemen ${widget.amandemen}"
                                          : "Amendment ${widget.amandemen}",
                                      style: const TextStyle(
                                        fontSize: 10,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                              ],
                            ),
                            Row(
                              mainAxisSize: MainAxisSize.min,
                              crossAxisAlignment: CrossAxisAlignment.center,
                              children: [
                                PopupMenuButton<int>(
                                  child: Icon(
                                    LucideIcons.moreVertical,
                                    color: theme.colorScheme.mutedForeground
                                        .withValues(alpha: 0.6),
                                    size: 20,
                                  ),
                                  onSelected: (value) {
                                    final copyText = _getCopyStringValue(
                                      l10n,
                                      languageCode,
                                    );
                                    if (value == 0) {
                                      Clipboard.setData(
                                        ClipboardData(text: copyText),
                                      );
                                      ToastUtils.showSuccess(
                                        context,
                                        title: l10n.common.successTitle,
                                        message: l10n.common.textCopied,
                                      );
                                    } else if (value == 1) {
                                      SharePlus.instance.share(
                                        ShareParams(text: copyText),
                                      );
                                    }
                                  },
                                  itemBuilder: (context) => [
                                    PopupMenuItem(
                                      value: 0,
                                      child: Row(
                                        children: [
                                          Icon(
                                            LucideIcons.copy,
                                            color: theme.colorScheme.foreground,
                                            size: 16,
                                          ),
                                          const SizedBox(width: 8),
                                          Text(
                                            l10n.common.copyText,
                                            style: theme.textTheme.small,
                                          ),
                                        ],
                                      ),
                                    ),
                                    PopupMenuItem(
                                      value: 1,
                                      child: Row(
                                        children: [
                                          Icon(
                                            LucideIcons.share,
                                            color: theme.colorScheme.foreground,
                                            size: 16,
                                          ),
                                          const SizedBox(width: 8),
                                          Text(
                                            l10n.common.shareText,
                                            style: theme.textTheme.small,
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(width: 12),
                                Icon(
                                  _isExpanded
                                      ? LucideIcons.chevronUp
                                      : LucideIcons.chevronDown,
                                  color: theme.colorScheme.mutedForeground,
                                  size: 20,
                                ),
                              ],
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        if (widget.bab != null && widget.bab!.isNotEmpty) ...[
                          Text(
                            widget.bab!,
                            style: theme.textTheme.muted.copyWith(
                              fontSize: 11,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          const SizedBox(height: 2),
                        ],
                        SearchHighlightText(
                          text: widget.title,
                          query: widget.searchTerm,
                          style: theme.textTheme.large.copyWith(
                            fontSize: 15,
                            fontWeight: FontWeight.bold,
                          ),
                          highlightStyle: TextStyle(
                            backgroundColor: Colors.yellow.withValues(
                              alpha: 0.3,
                            ),
                            color: isDark
                                ? Colors.yellowAccent
                                : Colors.black87,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          countLabel,
                          style: theme.textTheme.muted.copyWith(fontSize: 11),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            // Collapsible Content
            if (_isExpanded) ...[
              const SizedBox(height: 16),
              const Divider(height: 1),
              const SizedBox(height: 12),
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                padding: EdgeInsets.zero,
                itemCount: filteredAyat.length,
                itemBuilder: (context, index) {
                  final ayat = filteredAyat[index];
                  final ayatId = ayat['id'] as int;
                  final isi = ayat['isi'] as String;

                  return Padding(
                    padding: const EdgeInsets.only(bottom: 12.0),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Ayat circle
                        Container(
                          width: 24,
                          height: 24,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: theme.colorScheme.destructive,
                          ),
                          alignment: Alignment.center,
                          child: Text(
                            '$ayatId',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        // Text content
                        Expanded(
                          child: SearchHighlightText(
                            text: isi,
                            query: widget.searchTerm,
                            style: theme.textTheme.muted.copyWith(
                              fontSize: 13,
                              height: 1.5,
                              color: theme.colorScheme.foreground,
                            ),
                            highlightStyle: TextStyle(
                              backgroundColor: Colors.yellow.withValues(
                                alpha: 0.3,
                              ),
                              color: isDark
                                  ? Colors.yellowAccent
                                  : Colors.black87,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ],
          ],
        ),
      ),
    );
  }
}
