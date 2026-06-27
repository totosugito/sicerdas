import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/core/database/dictionary_database.dart';
import 'package:bse/ui/dictionary/libs/providers/dictionary_providers.dart';
import 'package:bse/ui/dictionary/libs/model/obj_dict10.dart';
import 'word_detail_sheet.dart';

class WordListTile extends ConsumerWidget {
  final Word word;

  const WordListTile({super.key, required this.word});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = ShadTheme.of(context);
    final favAsync = ref.watch(wordFavoriteStateProvider(word.dictId));

    // Simple preview of meaning
    String previewText = "";
    try {
      final parsed = ObjDict10.fromJson(jsonDecode(word.meaning));
      if (parsed.t.isNotEmpty) {
        previewText = parsed.t.join(', ');
        // Sanitize leading commas and whitespace
        previewText = previewText.replaceFirst(RegExp(r'^[\s,]+'), '');
      }
    } catch (_) {}

    return ListTile(
      dense: true,
      contentPadding: const EdgeInsets.symmetric(vertical: 0, horizontal: 12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      title: Text(
        word.word,
        style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16),
      ),
      subtitle: previewText.isNotEmpty
          ? Padding(
              padding: const EdgeInsets.only(top: 4.0),
              child: Text(
                previewText,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  color: theme.colorScheme.mutedForeground,
                  fontSize: 14,
                ),
              ),
            )
          : null,
      trailing: favAsync.when(
        data: (isFav) => IconButton(
          icon: Icon(
            isFav ? LucideIcons.bookmarkCheck : LucideIcons.bookmark,
            color: isFav
                ? theme.colorScheme.primary
                : theme.colorScheme.mutedForeground,
            size: 20,
          ),
          onPressed: () async {
            final db = ref.read(dictionaryDatabaseProvider);
            if (db == null) return;
            if (isFav) {
              await db.removeFavorite(word.dictId);
            } else {
              await db.addFavorite(word.dictId, word.mode);
            }
            ref.invalidate(wordFavoriteStateProvider(word.dictId));
            ref.invalidate(dictionaryResultsProvider);
          },
        ),
        loading: () => const SizedBox(
          width: 20,
          height: 20,
          child: CircularProgressIndicator(strokeWidth: 2),
        ),
        error: (_, __) => const SizedBox.shrink(),
      ),
      onTap: () {
        showModalBottomSheet(
          context: context,
          isScrollControlled: true,
          backgroundColor: theme.colorScheme.background,
          shape: const RoundedRectangleBorder(
            borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
          ),
          builder: (context) => WordDetailSheet(word: word),
        );
      },
    );
  }
}
