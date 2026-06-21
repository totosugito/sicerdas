import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/i18n/strings.g.dart';
import 'package:flutter_widget_from_html_core/flutter_widget_from_html_core.dart';
import '../../level_selection/tricks_level_selection.dart';
import '../../libs/tricks_question_generator.dart';
import '../../../../core/database/database.dart';

class TrickInfoSheet extends StatelessWidget {
  final int id;
  final String trickKey;
  final String trickTitle;
  final String groupTitle;
  final Color themeColor;
  final MathTrickChapter? chapter;
  final ScrollController? scrollController;

  const TrickInfoSheet({
    super.key,
    required this.id,
    required this.trickKey,
    required this.trickTitle,
    required this.groupTitle,
    required this.themeColor,
    this.chapter,
    this.scrollController,
  });

  static void show(
    BuildContext context, {
    required int id,
    required String trickKey,
    required String trickTitle,
    required String groupTitle,
    required Color themeColor,
    MathTrickChapter? chapter,
  }) {
    final theme = ShadTheme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: isDark ? const Color(0xFF151515) : Colors.white,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (context) {
        return DraggableScrollableSheet(
          initialChildSize: 0.75,
          minChildSize: 0.5,
          maxChildSize: 0.95,
          expand: false,
          builder: (context, scrollController) {
            return TrickInfoSheet(
              id: id,
              trickKey: trickKey,
              trickTitle: trickTitle,
              groupTitle: groupTitle,
              themeColor: themeColor,
              chapter: chapter,
              scrollController: scrollController,
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);
    final l10n = Translations.of(context);
    final isDark = theme.brightness == Brightness.dark;

    GeneratedQuestion? question;
    try {
      question = TricksQuestionGenerator.generateDemo(trickKey);
    } catch (_) {
      // Unimplemented or construction error
    }

    final q = question;

    return Column(
      children: [
        // Drag Handle
        Center(
          child: Container(
            margin: const EdgeInsets.only(top: 12, bottom: 8),
            width: 36,
            height: 4,
            decoration: BoxDecoration(
              color: isDark ? Colors.white24 : Colors.black12,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
        ),
        // Header with Title and Close Button
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 8.0),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      groupTitle,
                      style: theme.textTheme.muted.copyWith(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: themeColor,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(trickTitle, style: theme.textTheme.large.copyWith(fontWeight: FontWeight.bold, fontSize: 18)),
                  ],
                ),
              ),
              IconButton(
                icon: const Icon(Icons.close_rounded),
                visualDensity: VisualDensity.compact,
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),
        ),
        const Divider(height: 1),
        // Scrollable Content / Solution
        Expanded(
          child: SingleChildScrollView(
            controller: scrollController,
            padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 20.0),
            child: q != null
                ? Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        l10n.math_tricks.training.solutionHeader,
                        style: theme.textTheme.muted.copyWith(fontSize: 12, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 12),
                      HtmlWidget(
                        q.buildSolutionHtml(context),
                        textStyle: TextStyle(color: isDark ? Colors.white70 : Colors.black87, fontSize: 14),
                      ),
                    ],
                  )
                : Container(
                    padding: const EdgeInsets.symmetric(vertical: 40),
                    alignment: Alignment.center,
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.construction_rounded, size: 48, color: theme.colorScheme.mutedForeground),
                        const SizedBox(height: 16),
                        Text(
                          'Trik Sedang Dalam Pengembangan',
                          style: theme.textTheme.large.copyWith(fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Penjelasan dan latihan untuk trik ini akan segera hadir!',
                          style: theme.textTheme.muted,
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  ),
          ),
        ),
        const Divider(height: 1),
        // Footer CTA Button
        Padding(
          padding: const EdgeInsets.all(20.0),
          child: SizedBox(
            width: double.infinity,
            child: ShadButton(
              backgroundColor: q != null ? themeColor : theme.colorScheme.muted,
              onPressed: q != null
                  ? () {
                      Navigator.pop(context); // Close bottom sheet
                      TricksLevelSelectionScreen.navigate(
                        context,
                        groupTitle: groupTitle,
                        chapterKey: trickKey,
                        trickTitle: trickTitle,
                        themeColor: themeColor,
                      );
                    }
                  : null,
              child: Text(
                q != null ? 'Pilih Level' : 'Segera Hadir',
                style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
