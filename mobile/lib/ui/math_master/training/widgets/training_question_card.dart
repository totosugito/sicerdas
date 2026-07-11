import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/i18n/strings.g.dart';
import 'package:flutter_math_fork/flutter_math.dart';

class TrainingQuestionCard extends StatelessWidget {
  final String question;
  final bool answered;
  final bool? isCorrect;

  const TrainingQuestionCard({
    super.key,
    required this.question,
    required this.answered,
    required this.isCorrect,
  });

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);
    final l10n = Translations.of(context);
    final isLaTex =
        question.contains('\\') ||
        question.contains('{') ||
        question.contains('}') ||
        question.contains('_') ||
        question.contains('^');

    return Expanded(
      child: Center(
        child: ShadCard(
          padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              isLaTex
                  ? FittedBox(
                      fit: BoxFit.scaleDown,
                      child: Math.tex(
                        question,
                        textStyle: theme.textTheme.h1.copyWith(
                          fontSize: 48,
                          fontWeight: FontWeight.w800,
                        ),
                        onErrorFallback: (error) => Text(
                          question,
                          style: theme.textTheme.h1.copyWith(
                            fontSize: 48,
                            fontWeight: FontWeight.w800,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    )
                  : Text(
                      question,
                      style: theme.textTheme.h1.copyWith(
                        fontSize: 48,
                        fontWeight: FontWeight.w800,
                      ),
                      textAlign: TextAlign.center,
                    ),
              if (answered) ...[
                const SizedBox(height: 24),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      isCorrect == true
                          ? Icons.check_circle_rounded
                          : Icons.cancel_rounded,
                      color: isCorrect == true ? Colors.green : Colors.red,
                      size: 32,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      isCorrect == true
                          ? '${l10n.math_tricks.achievement.correct}!'
                          : '${l10n.math_tricks.achievement.wrong}!',
                      style: theme.textTheme.large.copyWith(
                        fontWeight: FontWeight.bold,
                        color: isCorrect == true ? Colors.green : Colors.red,
                      ),
                    ),
                  ],
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
