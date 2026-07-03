import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/i18n/strings.g.dart';
import '../../libs/models/enums.dart';
import '../../libs/models/model_chapter.dart';
import 'package:flutter_math_fork/flutter_math.dart';

class ChapterListItem extends StatelessWidget {
  final ModelChapter chapter;
  final VoidCallback onTap;

  const ChapterListItem({
    super.key,
    required this.chapter,
    required this.onTap,
  });

  String _getGradeLabel(BuildContext context, KeyGrade grade) {
    final locale = Translations.of(context).math_master;
    switch (grade) {
      case KeyGrade.gradeOne:
        return locale.grades_class_1;
      case KeyGrade.gradeTwo:
        return locale.grades_class_2;
      case KeyGrade.gradeThree:
        return locale.grades_class_3;
      case KeyGrade.gradeFour:
        return locale.grades_class_4;
      case KeyGrade.gradeFive:
        return locale.grades_class_5;
      case KeyGrade.gradeSix:
        return locale.grades_class_6;
      default:
        return locale.grades_class_n(number: grade.index.toString());
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);

    return ShadCard(
      padding: EdgeInsets.all(16.0),
      child: InkWell(
        onTap: onTap,
        splashColor: theme.colorScheme.primary.withValues(alpha: 0.1),
        highlightColor: theme.colorScheme.primary.withValues(alpha: 0.05),
        child: Padding(
          padding: const EdgeInsets.all(0.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.start,
            // crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                chapter.title,
                textAlign: TextAlign.center,
                style: theme.textTheme.small.copyWith(
                  fontWeight: FontWeight.w600,
                  fontSize: 13.0,
                  height: 1.2,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 6),
              Container(
                height: 38,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: theme.colorScheme.primary.withValues(alpha: 0.07),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: FittedBox(
                  fit: BoxFit.scaleDown,
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 10.0),
                    child: Math.tex(
                      chapter.cover,
                      textStyle: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: theme.colorScheme.primary,
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 6),
              // Footer Info
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  // Grade
                  Expanded(
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.school_rounded,
                          size: 14.0,
                          color: theme.colorScheme.mutedForeground,
                        ),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            _getGradeLabel(context, chapter.grade),
                            style: theme.textTheme.muted.copyWith(
                              fontSize: 10.5,
                              fontWeight: FontWeight.w500,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 4),
                  // Score Info
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.emoji_events_rounded,
                        size: 14.0,
                        color: theme.colorScheme.primary,
                      ),
                      const SizedBox(width: 3),
                      Text(
                        '${chapter.correctAnswer}',
                        style: theme.textTheme.muted.copyWith(
                          fontSize: 10.5,
                          fontWeight: FontWeight.bold,
                          color: theme.colorScheme.primary,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
