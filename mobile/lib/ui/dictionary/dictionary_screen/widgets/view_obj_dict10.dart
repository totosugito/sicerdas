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

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Header actions bar
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: Text(
                word.word,
                style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                overflow: TextOverflow.ellipsis,
              ),
            ),
            Row(
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
                    : IconButton(
                        icon: Icon(
                          isFavorite ? LucideIcons.bookmarkCheck : LucideIcons.bookmark,
                          color: isFavorite ? theme.colorScheme.primary : null,
                        ),
                        onPressed: onFavoriteClicked,
                      ),
                // Copy Button
                IconButton(
                  icon: const Icon(LucideIcons.copy),
                  onPressed: onCopyClicked,
                ),
                // Share Button
                IconButton(
                  icon: const Icon(LucideIcons.share),
                  onPressed: onShareClicked,
                ),
              ],
            ),
          ],
        ),
        const Divider(height: 24),

        // Meanings
        ...List.generate(detail.t.length, (index) {
          final text = detail.t[index];
          final isTitle = index % 2 == 0;
          return Padding(
            padding: const EdgeInsets.symmetric(vertical: 4.0),
            child: Text(
              text,
              style: TextStyle(
                fontSize: 16,
                fontWeight: isTitle ? FontWeight.bold : FontWeight.normal,
                color: isTitle ? theme.colorScheme.primary : theme.colorScheme.foreground,
              ),
            ),
          );
        }),

        // Examples
        if (detail.e.isNotEmpty) ...[
          Padding(
            padding: const EdgeInsets.only(top: 20.0, bottom: 8.0),
            child: Text(
              l10n.dictionary.examples,
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: theme.colorScheme.primary,
              ),
            ),
          ),
          ...List.generate(detail.e.length, (index) {
            final example = detail.e[index];
            return Padding(
              padding: const EdgeInsets.symmetric(vertical: 8.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '${index + 1}. ${example.s}',
                    style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w500),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    example.t,
                    style: TextStyle(
                      fontSize: 14,
                      fontStyle: FontStyle.italic,
                      color: theme.colorScheme.mutedForeground,
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
