import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:share_plus/share_plus.dart';
import 'package:bse/core/database/dictionary_database.dart';
import 'package:bse/ui/dictionary/libs/providers/dictionary_providers.dart';
import 'package:bse/ui/dictionary/libs/model/obj_dict10.dart';
import 'package:bse/ui/dictionary/libs/model/obj_dict00.dart';
import 'package:bse/core/providers/database_provider.dart';
import 'package:bse/i18n/strings.g.dart';
import 'view_obj_dict10.dart';
import 'view_obj_dict00.dart';

class WordDetailSheet extends ConsumerStatefulWidget {
  final Word word;

  const WordDetailSheet({super.key, required this.word});

  @override
  ConsumerState<WordDetailSheet> createState() => _WordDetailSheetState();
}

class _WordDetailSheetState extends ConsumerState<WordDetailSheet> {
  late Word _currentWord;

  @override
  void initState() {
    super.initState();
    _currentWord = widget.word;
  }

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);
    final l10n = Translations.of(context);
    final favAsync = ref.watch(wordFavoriteStateProvider(_currentWord.dictId));

    String buildCopyText() {
      final buffer = StringBuffer();
      buffer.writeln(_currentWord.word);
      buffer.writeln('---');

      if (_currentWord.mode == 0) {
        try {
          final detail = ObjDict00.fromJson(jsonDecode(_currentWord.meaning));
          for (int i = 0; i < detail.c.length; i++) {
            final c = detail.c[i];
            var s = detail.s[i];
            switch (c) {
              case 10:
                buffer.write('Varian: ');
                break;
              case 11:
                buffer.write('Dasar: ');
                break;
              case 12:
                buffer.write('Gabungan kata: ');
                break;
              case 13:
                buffer.write('Kata turunan: ');
                break;
              case 14:
                buffer.write('Peribahasa: ');
                break;
              case 15:
                buffer.write('Kiasan: ');
                break;
              case 30:
                buffer.write('ki');
                break;
              case 31:
                buffer.write('kp');
                break;
              case 32:
                buffer.write('akr');
                break;
              case 33:
                buffer.write('ukp');
                break;
              case 2:
                s = '/$s/';
                break;
              case 4:
                s = '($s)';
                break;
              default:
                break;
            }
            buffer.write(s);
          }
        } catch (_) {
          buffer.writeln(_currentWord.meaning);
        }
      } else {
        try {
          final detail = ObjDict10.fromJson(jsonDecode(_currentWord.meaning));
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
        } catch (_) {
          buffer.writeln(_currentWord.meaning);
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
        return Stack(
          children: [
            Column(
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
                        data: (isFav) {
                          Future<void> handleFavorite() async {
                            final db = ref.read(dictionaryDatabaseProvider);
                            if (db == null) return;
                            if (isFav) {
                              await db.removeFavorite(_currentWord.dictId);
                            } else {
                              await db.addFavorite(
                                _currentWord.dictId,
                                _currentWord.mode,
                              );
                            }
                            ref.invalidate(
                              wordFavoriteStateProvider(_currentWord.dictId),
                            );
                            ref.invalidate(dictionaryResultsProvider);
                          }

                          void handleCopy() {
                            Clipboard.setData(
                              ClipboardData(text: buildCopyText()),
                            );
                            ShadToaster.of(context).show(
                              ShadToast(
                                title: Text(l10n.dictionary.copiedSuccess),
                                description: Text(
                                  l10n.dictionary.copiedDetail(
                                    word: _currentWord.word,
                                  ),
                                ),
                              ),
                            );
                          }

                          void handleShare() {
                            SharePlus.instance.share(
                              ShareParams(
                                text: buildCopyText(),
                                title: l10n.dictionary.shareSubject(
                                  word: _currentWord.word,
                                ),
                              ),
                            );
                          }

                          Future<void> handleTextClicked(
                            String targetWordText,
                          ) async {
                            final db = ref.read(dictionaryDatabaseProvider);
                            if (db == null) return;
                            final targetWord = await db.getWordByExactText(
                              targetWordText,
                              _currentWord.dictSwap,
                            );
                            if (targetWord != null) {
                              setState(() {
                                _currentWord = targetWord;
                              });
                            }
                          }

                          if (_currentWord.mode == 0) {
                            return ViewObjDict00(
                              word: _currentWord,
                              isFavorite: isFav,
                              isLoadingFavorite: false,
                              onFavoriteClicked: handleFavorite,
                              onCopyClicked: handleCopy,
                              onShareClicked: handleShare,
                              onTextClicked: handleTextClicked,
                            );
                          } else {
                            return ViewObjDict10(
                              word: _currentWord,
                              isFavorite: isFav,
                              isLoadingFavorite: false,
                              onFavoriteClicked: handleFavorite,
                              onCopyClicked: handleCopy,
                              onShareClicked: handleShare,
                            );
                          }
                        },
                        loading: () {
                          void dummyCallback() {}
                          if (_currentWord.mode == 0) {
                            return ViewObjDict00(
                              word: _currentWord,
                              isFavorite: false,
                              isLoadingFavorite: true,
                              onFavoriteClicked: dummyCallback,
                              onCopyClicked: dummyCallback,
                              onShareClicked: dummyCallback,
                              onTextClicked: (_) {},
                            );
                          } else {
                            return ViewObjDict10(
                              word: _currentWord,
                              isFavorite: false,
                              isLoadingFavorite: true,
                              onFavoriteClicked: dummyCallback,
                              onCopyClicked: dummyCallback,
                              onShareClicked: dummyCallback,
                            );
                          }
                        },
                        error: (err, _) {
                          void dummyCallback() {}
                          if (_currentWord.mode == 0) {
                            return ViewObjDict00(
                              word: _currentWord,
                              isFavorite: false,
                              isLoadingFavorite: false,
                              onFavoriteClicked: dummyCallback,
                              onCopyClicked: dummyCallback,
                              onShareClicked: dummyCallback,
                              onTextClicked: (_) {},
                            );
                          } else {
                            return ViewObjDict10(
                              word: _currentWord,
                              isFavorite: false,
                              isLoadingFavorite: false,
                              onFavoriteClicked: dummyCallback,
                              onCopyClicked: dummyCallback,
                              onShareClicked: dummyCallback,
                            );
                          }
                        },
                      ),
                    ],
                  ),
                ),
              ],
            ),
            Positioned(
              right: 12,
              top: 12,
              child: ShadButton.ghost(
                width: 32,
                height: 32,
                padding: EdgeInsets.zero,
                onPressed: () => Navigator.pop(context),
                child: Icon(
                  Icons.close_rounded,
                  size: 20,
                  color: theme.colorScheme.mutedForeground,
                ),
              ),
            ),
          ],
        );
      },
    );
  }
}
