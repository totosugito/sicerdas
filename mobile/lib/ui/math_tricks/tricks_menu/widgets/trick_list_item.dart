import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import '../../../../core/database/database.dart';
import '../../level_selection/tricks_level_selection.dart';

class TrickListItem extends StatelessWidget {
  final int id;
  final String trickKey;
  final String trickTitle;
  final String groupTitle;
  final Color themeColor;
  final MathTrickChapter? chapter;

  const TrickListItem({
    super.key,
    required this.id,
    required this.trickKey,
    required this.trickTitle,
    required this.groupTitle,
    required this.themeColor,
    this.chapter,
  });

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final solvedCount = (chapter?.opened ?? 1) - 1;

    return InkWell(
      onTap: () {
        TricksLevelSelectionScreen.navigate(
          context,
          groupTitle: groupTitle,
          chapterKey: trickKey,
          trickTitle: trickTitle,
          themeColor: themeColor,
        );
      },
      borderRadius: BorderRadius.circular(8),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 12.0, horizontal: 8.0),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              id.toString().padLeft(2, '0'),
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.bold,
                color: themeColor.withValues(alpha: 0.75),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    trickTitle,
                    style: TextStyle(
                      fontSize: 13.5,
                      fontWeight: FontWeight.w500,
                      color: isDark ? Colors.white70 : Colors.black87,
                    ),
                  ),
                  if (solvedCount > 0) ...[
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Expanded(
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(2),
                            child: LinearProgressIndicator(
                              value: solvedCount / 50,
                              backgroundColor: isDark
                                  ? Colors.white.withValues(alpha: 0.08)
                                  : Colors.grey.shade200,
                              valueColor: AlwaysStoppedAnimation<Color>(themeColor),
                              minHeight: 4,
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          '$solvedCount/50',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: isDark
                                ? Colors.white.withValues(alpha: 0.3)
                                : Colors.black.withValues(alpha: 0.3),
                          ),
                        ),
                      ],
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
