import 'dart:convert';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/core/database/dictionary_database.dart';
import 'package:bse/core/providers/database_provider.dart';
import 'package:bse/ui/dictionary/libs/model/obj_dict00.dart';

class ViewObjDict00 extends ConsumerWidget {
  final Word word;
  final VoidCallback onFavoriteClicked;
  final VoidCallback onShareClicked;
  final VoidCallback onCopyClicked;
  final bool isFavorite;
  final bool isLoadingFavorite;
  final ValueChanged<String> onTextClicked;

  const ViewObjDict00({
    super.key,
    required this.word,
    required this.onFavoriteClicked,
    required this.onShareClicked,
    required this.onCopyClicked,
    required this.isFavorite,
    required this.onTextClicked,
    this.isLoadingFavorite = false,
  });

  ObjDict00 _parseMeaning() {
    try {
      return ObjDict00.fromJson(jsonDecode(word.meaning));
    } catch (_) {
      return ObjDict00();
    }
  }

  Future<List<InlineSpan>> _createItemTranslate(
    BuildContext context,
    WidgetRef ref,
    ObjDict00 data,
  ) async {
    final theme = ShadTheme.of(context);
    final textStyleDefault = TextStyle(
      color: theme.colorScheme.foreground,
      fontSize: 15,
      height: 1.4,
    );

    if (!data.isValid()) {
      return [];
    }

    final db = ref.read(dictionaryDatabaseProvider);
    if (db == null) return [];

    // 1. Gather all IDs that need querying
    final List<int> idsToQuery = [];
    for (int i = 0; i < data.c.length; i++) {
      if ((data.c[i] == 40 || data.c[i] == 41) && data.s[i].isNotEmpty) {
        final id = int.tryParse(data.s[i]);
        if (id != null) {
          idsToQuery.add(id);
        }
      }
    }

    // 2. Fetch all at once
    final fetchedWords = await db.getWordsByIds(idsToQuery);

    // 3. Map for O(1) synchronous lookup
    final Map<int, String> wordLookup = {
      for (var w in fetchedWords) w.dictId: w.word
    };

    List<InlineSpan> view = [];
    List<Color> color20 = [
      const Color(0xfff44336),
      const Color(0xfff57f17),
      const Color(0xffafb42b),
      const Color(0xff689f38),
      const Color(0xff2e7d32),
      const Color(0xff3949ab)
    ];
    List<Color> color30 = [
      const Color(0xff9c27b0),
      const Color(0xff9c27b0),
      const Color(0xff9c27b0),
      theme.colorScheme.secondary,
    ];
    Color colorLink = theme.colorScheme.primary;
    Color colorDefault = theme.colorScheme.foreground;
    Color renderer50 = theme.colorScheme.secondary;

    double textSize;
    FontStyle textStyle, infoTextStyle;
    FontWeight textWeight, infoTextWeight;
    Color textColor, infoTextColor;
    bool textClickable, infoTextClickable;
    bool textSubscript, textSuperscript;
    double relativeTextSize = 1.2;

    int dataLength = data.c.length;
    for (int i = 0; i < dataLength; i++) {
      int c = data.c[i];
      String s = data.s[i];

      // init variable
      String infoStr = "";
      textColor = colorDefault;
      infoTextColor = textColor;

      textSize = 15;
      textWeight = FontWeight.normal;
      infoTextWeight = FontWeight.bold;
      textStyle = FontStyle.normal;
      infoTextStyle = FontStyle.normal;

      textClickable = false;
      infoTextClickable = false;

      textSubscript = false;
      textSuperscript = false;

      // check data
      switch (c) {
        case 0:
          break;
        case 1:
        case 3:
          textWeight = FontWeight.bold;
          textSize *= relativeTextSize;
          break;
        case 2:
          s = "/$s/";
          break;
        case 4:
          s = "($s)";
          break;
        case 5:
          textStyle = FontStyle.italic;
          textWeight = FontWeight.bold;
          textSize *= relativeTextSize;
          break;
        case 10:
          textWeight = FontWeight.bold;
          infoStr = "Varian: ";
          break;
        case 11:
          textWeight = FontWeight.bold;
          infoStr = "Dasar: ";
          break;
        case 12:
          textWeight = FontWeight.bold;
          infoStr = "Gabungan kata: ";
          break;
        case 13:
          textWeight = FontWeight.bold;
          infoStr = "Kata turunan: ";
          break;
        case 14:
          textWeight = FontWeight.bold;
          infoStr = "Peribahasa: ";
          break;
        case 15:
          textWeight = FontWeight.bold;
          infoStr = "Kiasan: ";
          break;
        case 20:
        case 21:
        case 22:
        case 23:
        case 24:
        case 25:
          if (c - 20 < color20.length) {
            textColor = color20[c - 20];
          }
          break;
        case 30:
          infoStr = "ki";
          infoTextWeight = FontWeight.normal;
          infoTextColor = color30[0];
          break;
        case 31:
          infoStr = "kp";
          infoTextWeight = FontWeight.normal;
          infoTextColor = color30[1];
          break;
        case 32:
          infoStr = "akr";
          infoTextWeight = FontWeight.normal;
          infoTextColor = color30[2];
          break;
        case 33:
          infoStr = "ukp";
          infoTextWeight = FontWeight.normal;
          infoTextColor = color30[3];
          break;
        case 40:
          final id = int.tryParse(s);
          final wordText = id != null ? wordLookup[id] : null;
          if (wordText != null) {
            textClickable = true;
            s = wordText;
          } else {
            s = "";
          }
          textColor = colorLink;
          break;
        case 41:
          final id = int.tryParse(s);
          final wordText = id != null ? wordLookup[id] : null;
          if (wordText != null) {
            infoTextClickable = true;
            infoStr = wordText;
            infoTextColor = colorLink;
            infoTextWeight = FontWeight.normal;
          }
          s = " » ";
          break;
        case 42:
          textWeight = FontWeight.bold;
          break;
        case 50:
          textColor = renderer50;
          break;
        case 60:
          textWeight = FontWeight.bold;
          break;
        case 61:
          textStyle = FontStyle.italic;
          textWeight = FontWeight.normal;
          break;
        case 62:
          textWeight = FontWeight.normal;
          textSubscript = true;
          break;
        case 63:
          textSuperscript = true;
          break;
        case 74:
          textSubscript = true;
          if (c - 70 < color20.length) {
            textColor = color20[c - 70];
          }
          break;
        default:
          break;
      }

      if (infoStr.isNotEmpty) {
        final recognizer = infoTextClickable
            ? (TapGestureRecognizer()..onTap = () => onTextClicked(infoStr))
            : null;
        view.add(TextSpan(
          text: infoStr,
          recognizer: recognizer,
          style: textStyleDefault.copyWith(
            fontSize: textSize,
            fontWeight: infoTextWeight,
            color: infoTextColor,
            fontStyle: infoTextStyle,
          ),
        ));
      }

      if (s.isNotEmpty) {
        InlineSpan w;
        if (textSubscript) {
          w = WidgetSpan(
            child: Transform.translate(
              offset: const Offset(0.0, 4.0),
              child: Text(
                s,
                style: textStyleDefault.copyWith(
                  fontSize: textSize - 3,
                  fontWeight: textWeight,
                  fontStyle: textStyle,
                  color: textColor,
                ),
              ),
            ),
          );
        } else if (textSuperscript) {
          w = WidgetSpan(
            child: Transform.translate(
              offset: const Offset(0.0, -7.0),
              child: Text(
                s,
                style: textStyleDefault.copyWith(
                  fontSize: textSize - 3,
                  fontWeight: textWeight,
                  fontStyle: textStyle,
                  color: textColor,
                ),
              ),
            ),
          );
        } else {
          final recognizer = textClickable
              ? (TapGestureRecognizer()..onTap = () => onTextClicked(s))
              : null;
          w = TextSpan(
            text: s,
            recognizer: recognizer,
            style: textStyleDefault.copyWith(
              fontSize: textSize,
              fontWeight: textWeight,
              fontStyle: textStyle,
              color: textColor,
            ),
          );
        }
        view.add(w);
      }
    }
    return view;
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = ShadTheme.of(context);
    final detail = _parseMeaning();

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

        // Meanings Card / Text
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: theme.colorScheme.card,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: theme.colorScheme.border),
          ),
          child: FutureBuilder<List<InlineSpan>>(
            future: _createItemTranslate(context, ref, detail),
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const Center(
                  child: Padding(
                    padding: EdgeInsets.symmetric(vertical: 24.0),
                    child: CircularProgressIndicator(),
                  ),
                );
              }
              if (snapshot.hasError) {
                return Text(
                  'Error loading translation details.',
                  style: TextStyle(color: theme.colorScheme.destructive),
                );
              }
              final spans = snapshot.data;
              if (spans == null || spans.isEmpty) {
                return const Text('No meaning description available.');
              }
              return RichText(
                text: TextSpan(
                  children: spans,
                  style: TextStyle(
                    color: theme.colorScheme.foreground,
                    fontSize: 15,
                    height: 1.4,
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}
