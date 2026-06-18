import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/i18n/strings.g.dart';

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

class ButirPancasilaCard extends StatefulWidget {
  final int id;
  final String title;
  final String imagePath;
  final List<dynamic> butirData;
  final String searchTerm;
  final bool forceExpand;

  const ButirPancasilaCard({
    super.key,
    required this.id,
    required this.title,
    required this.imagePath,
    required this.butirData,
    required this.searchTerm,
    required this.forceExpand,
  });

  @override
  State<ButirPancasilaCard> createState() => _ButirPancasilaCardState();
}

class _ButirPancasilaCardState extends State<ButirPancasilaCard> {
  late bool _isExpanded;

  @override
  void initState() {
    super.initState();
    _isExpanded = widget.forceExpand;
  }

  @override
  void didUpdateWidget(covariant ButirPancasilaCard oldWidget) {
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

    final baseAssetPath = widget.imagePath.startsWith('/')
        ? 'assets${widget.imagePath}'
        : widget.imagePath;

    // Filter butirs locally for rendering highlights and count
    final filteredButir = widget.searchTerm.isEmpty
        ? widget.butirData
        : widget.butirData.where((b) {
            final isi = b['isi'] as String;
            return isi.toLowerCase().contains(widget.searchTerm.toLowerCase());
          }).toList();

    final totalCount = widget.butirData.length;
    final matchingCount = filteredButir.length;

    if (matchingCount == 0 && widget.searchTerm.isNotEmpty) {
      return const SizedBox.shrink();
    }

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
                  // Icon
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: isDark
                          ? Colors.white.withValues(alpha: 0.05)
                          : Colors.red.withValues(alpha: 0.05),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: isDark
                            ? Colors.white.withValues(alpha: 0.15)
                            : Colors.red.withValues(alpha: 0.1),
                        width: 1.5,
                      ),
                    ),
                    child: Image.asset(
                      baseAssetPath,
                      width: 36,
                      height: 36,
                      fit: BoxFit.contain,
                    ),
                  ),
                  const SizedBox(width: 12),
                  // Title and details
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        ShadBadge(
                          backgroundColor: theme.colorScheme.destructive,
                          foregroundColor: Colors.white,
                          child: Text(
                            '${l10n.constitution.constitution.sila} ${widget.id}',
                            style: const TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        const SizedBox(height: 6),
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
                          widget.searchTerm.isNotEmpty
                              ? l10n.constitution.constitution.matchingPoints(
                                  matching: matchingCount,
                                  total: totalCount,
                                )
                              : l10n.constitution.constitution.practicePoints(
                                  count: totalCount,
                                ),
                          style: theme.textTheme.muted.copyWith(fontSize: 11),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  Icon(
                    _isExpanded
                        ? LucideIcons.chevronUp
                        : LucideIcons.chevronDown,
                    color: theme.colorScheme.mutedForeground,
                    size: 20,
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
                itemCount: filteredButir.length,
                itemBuilder: (context, index) {
                  final butir = filteredButir[index];
                  final butirId = butir['id'] as int;
                  final isi = butir['isi'] as String;

                  return Padding(
                    padding: const EdgeInsets.only(bottom: 12.0),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Bullet point ID
                        Container(
                          width: 24,
                          height: 24,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: theme.colorScheme.destructive,
                          ),
                          alignment: Alignment.center,
                          child: Text(
                            '$butirId',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        // Butir text
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
