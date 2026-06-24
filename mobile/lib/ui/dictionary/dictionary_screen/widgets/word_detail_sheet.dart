import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:share_plus/share_plus.dart';
import 'package:bse/core/database/dictionary_database.dart';
import 'package:bse/ui/dictionary/libs/providers/dictionary_providers.dart';
import 'package:bse/ui/dictionary/libs/model/obj_dict10.dart';
import 'package:bse/core/providers/database_provider.dart';
import 'package:bse/i18n/strings.g.dart';
import 'view_obj_dict10.dart';

class WordDetailSheet extends ConsumerWidget {
  final Word word;

  const WordDetailSheet({super.key, required this.word});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = ShadTheme.of(context);
    final l10n = Translations.of(context);
    final favAsync = ref.watch(wordFavoriteStateProvider(word.dictId));

    ObjDict10 detail = ObjDict10();
    try {
      detail = ObjDict10.fromJson(jsonDecode(word.meaning));
    } catch (_) {}

    String buildCopyText() {
      final buffer = StringBuffer();
      buffer.writeln(word.word);
      buffer.writeln('---');
      for (int i = 0; i < detail.t.length; i++) {
        buffer.writeln(detail.t[i]);
      }
      if (detail.e.isNotEmpty) {
        buffer.writeln('\n${l10n.dictionary.examples}');
        for (int i = 0; i < detail.e.length; i++) {
          buffer.writeln('${i + 1}. ${detail.e[i].s}');
          buffer.writeln('   ${detail.e[i].t}');
        }
      }
      return buffer.toString();
    }

    return DraggableScrollableSheet(
      expand: false,
      initialChildSize: 0.6,
      maxChildSize: 0.9,
      minChildSize: 0.4,
      builder: (context, scrollController) {
        return Column(
          children: [
            // Control handle
            Center(
              child: Container(
                margin: const EdgeInsets.only(top: 12),
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: theme.colorScheme.border,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 12),

            // Meaning & Examples Content
            Expanded(
              child: ListView(
                controller: scrollController,
                padding: const EdgeInsets.all(16.0),
                children: [
                  favAsync.when(
                    data: (isFav) => ViewObjDict10(
                      word: word,
                      isFavorite: isFav,
                      isLoadingFavorite: false,
                      onFavoriteClicked: () async {
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
                      onCopyClicked: () {
                        Clipboard.setData(ClipboardData(text: buildCopyText()));
                        ShadToaster.of(context).show(
                          ShadToast(
                            title: Text(l10n.dictionary.copiedSuccess),
                            description: Text(l10n.dictionary.copiedDetail(word: word.word)),
                          ),
                        );
                      },
                      onShareClicked: () {
                        SharePlus.instance.share(
                          ShareParams(
                            text: buildCopyText(),
                            title: l10n.dictionary.shareSubject(word: word.word),
                          ),
                        );
                      },
                    ),
                    loading: () => ViewObjDict10(
                      word: word,
                      isFavorite: false,
                      isLoadingFavorite: true,
                      onFavoriteClicked: () {},
                      onCopyClicked: () {},
                      onShareClicked: () {},
                    ),
                    error: (err, _) => ViewObjDict10(
                      word: word,
                      isFavorite: false,
                      isLoadingFavorite: false,
                      onFavoriteClicked: () {},
                      onCopyClicked: () {},
                      onShareClicked: () {},
                    ),
                  ),
                ],
              ),
            ),
          ],
        );
      },
    );
  }
}
