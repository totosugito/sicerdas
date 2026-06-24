import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/core/database/dictionary_database.dart';
import 'package:bse/ui/dictionary/libs/model/obj_dict10.dart';
import 'package:bse/i18n/strings.g.dart';

class ViewObjDict10 extends StatelessWidget {
  final Word word;
  final VoidCallback onFavoriteClicked;
  final VoidCallback onShareClicked;
  final VoidCallback onCopyClicked;
  final bool isFavorite;
  final bool isLoadingFavorite;

  const ViewObjDict10({
    super.key,
    required this.word,
    required this.onFavoriteClicked,
    required this.onShareClicked,
    required this.onCopyClicked,
    required this.isFavorite,
    this.isLoadingFavorite = false,
  });

  ObjDict10 _parseMeaning() {
    try {
      return ObjDict10.fromJson(jsonDecode(word.meaning));
    } catch (_) {
      return ObjDict10();
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);
    final l10n = Translations.of(context);
    final detail = _parseMeaning();

    final List<MapEntry<String, String>> groupedMeanings = [];
    for (int i = 0; i < detail.t.length; i += 2) {
      final type = detail.t[i];
      final meaning = (i + 1 < detail.t.length) ? detail.t[i + 1] : '';
      groupedMeanings.add(MapEntry(type, meaning));
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Word Title (Full width, wraps naturally)
        Text(
          word.word,
          style: const TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.bold,
            letterSpacing: -0.5,
          ),
        ),
        const SizedBox(height: 8),

        // Action buttons bar
        Row(
          mainAxisAlignment: MainAxisAlignment.end,
          children: [
            // Favorite Button
            isLoadingFavorite
                ? const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 12.0),
                    child: SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    ),
                  )
                : ShadButton.ghost(
                    width: 38,
                    height: 38,
                    padding: EdgeInsets.zero,
                    onPressed: onFavoriteClicked,
                    child: Icon(
                      isFavorite
                          ? LucideIcons.bookmarkCheck
                          : LucideIcons.bookmark,
                      color: isFavorite
                          ? theme.colorScheme.primary
                          : theme.colorScheme.mutedForeground,
                      size: 20,
                    ),
                  ),
            // Copy Button
            ShadButton.ghost(
              width: 38,
              height: 38,
              padding: EdgeInsets.zero,
              onPressed: onCopyClicked,
              child: Icon(
                LucideIcons.copy,
                color: theme.colorScheme.mutedForeground,
                size: 20,
              ),
            ),
            // Share Button
            ShadButton.ghost(
              width: 38,
              height: 38,
              padding: EdgeInsets.zero,
              onPressed: onShareClicked,
              child: Icon(
                LucideIcons.share,
                color: theme.colorScheme.mutedForeground,
                size: 20,
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),

        // Meanings Card Group
        ...groupedMeanings.map((entry) {
          final type = entry.key;
          final meaning = entry.value;
          return Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: theme.colorScheme.card,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: theme.colorScheme.border),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 3,
                  ),
                  decoration: BoxDecoration(
                    color: theme.colorScheme.primary.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(
                      color: theme.colorScheme.primary.withValues(alpha: 0.2),
                    ),
                  ),
                  child: Text(
                    type,
                    style: TextStyle(
                      color: theme.colorScheme.primary,
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.only(top: 2.0),
                    child: Text(
                      meaning,
                      style: TextStyle(
                        color: theme.colorScheme.foreground,
                        fontSize: 15,
                        height: 1.4,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          );
        }),

        // Examples Section
        if (detail.e.isNotEmpty) ...[
          Padding(
            padding: const EdgeInsets.only(top: 16.0, bottom: 8.0),
            child: Text(
              l10n.dictionary.examples,
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: theme.colorScheme.primary,
              ),
            ),
          ),
          ...detail.e.map((example) {
            return Container(
              margin: const EdgeInsets.only(bottom: 10),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: theme.colorScheme.card,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: theme.colorScheme.border),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Icon(
                        LucideIcons.quote,
                        size: 12,
                        color: theme.colorScheme.primary,
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          example.s,
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: theme.colorScheme.foreground,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Padding(
                    padding: const EdgeInsets.only(left: 20.0),
                    child: Text(
                      example.t,
                      style: TextStyle(
                        fontSize: 13,
                        color: theme.colorScheme.mutedForeground,
                      ),
                    ),
                  ),
                ],
              ),
            );
          }),
        ],
      ],
    );
  }
}
