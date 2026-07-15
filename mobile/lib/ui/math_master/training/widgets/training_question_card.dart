import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/i18n/strings.g.dart';
import 'package:flutter_math_fork/flutter_math.dart';

class TrainingQuestionCard extends StatelessWidget {
  final String question;
  final bool answered;
  final bool? isCorrect;
  final bool isLatex;

  const TrainingQuestionCard({
    super.key,
    required this.question,
    required this.answered,
    required this.isCorrect,
    this.isLatex = false,
  });

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);
    final l10n = Translations.of(context);
    final isLaTex = isLatex;

    return Expanded(
      child: Center(
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeInOut,
          padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 24),
          decoration: BoxDecoration(
            color: answered
                ? (isCorrect == true
                      ? (theme.brightness == Brightness.dark
                            ? Colors.green.withValues(alpha: 0.1)
                            : Colors.green.withValues(alpha: 0.05))
                      : (theme.brightness == Brightness.dark
                            ? Colors.red.withValues(alpha: 0.1)
                            : Colors.red.withValues(alpha: 0.05)))
                : theme.colorScheme.card,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(
              color: answered
                  ? (isCorrect == true
                        ? Colors.green.withValues(alpha: 0.5)
                        : Colors.red.withValues(alpha: 0.5))
                  : theme.colorScheme.border,
              width: answered ? 2.0 : 1.5,
            ),
            boxShadow: [
              BoxShadow(
                color: answered
                    ? (isCorrect == true
                          ? Colors.green.withValues(alpha: 0.15)
                          : Colors.red.withValues(alpha: 0.15))
                    : (theme.brightness == Brightness.dark
                          ? Colors.black.withValues(alpha: 0.3)
                          : Colors.black.withValues(alpha: 0.05)),
                blurRadius: 20,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                isLaTex
                    ? SizedBox(
                        width: MediaQuery.of(context).size.width - 96,
                        child: Center(
                          child: FittedBox(
                            fit: BoxFit.scaleDown,
                            child: Math.tex(
                              question,
                              textStyle: theme.textTheme.h1.copyWith(
                                fontSize: 44,
                                fontWeight: FontWeight.w800,
                              ),
                              onErrorFallback: (error) {
                                return Text(
                                  question,
                                  style: theme.textTheme.h1.copyWith(
                                    fontSize: 44,
                                    fontWeight: FontWeight.w800,
                                  ),
                                  textAlign: TextAlign.center,
                                );
                              },
                            ),
                          ),
                        ),
                      )
                    : Text(
                        question,
                        style: theme.textTheme.h1.copyWith(
                          fontSize: 44,
                          fontWeight: FontWeight.w800,
                        ),
                        textAlign: TextAlign.center,
                      ),
                if (answered) ...[
                  const SizedBox(height: 32),
                  AnimatedContainer(
                    duration: const Duration(milliseconds: 300),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 10,
                    ),
                    decoration: BoxDecoration(
                      color: isCorrect == true
                          ? Colors.green.withValues(alpha: 0.1)
                          : Colors.red.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: isCorrect == true
                            ? Colors.green.withValues(alpha: 0.2)
                            : Colors.red.withValues(alpha: 0.2),
                        width: 1,
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          isCorrect == true
                              ? Icons.check_circle_rounded
                              : Icons.cancel_rounded,
                          color: isCorrect == true ? Colors.green : Colors.red,
                          size: 20,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          isCorrect == true
                              ? '${l10n.math_tricks.achievement.correct}!'
                              : '${l10n.math_tricks.achievement.wrong}!',
                          style: theme.textTheme.large.copyWith(
                            fontWeight: FontWeight.bold,
                            color: isCorrect == true
                                ? Colors.green
                                : Colors.red,
                            fontSize: 14,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}
