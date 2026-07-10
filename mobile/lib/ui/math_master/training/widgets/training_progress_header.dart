import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';

class TrainingProgressHeader extends StatelessWidget {
  final int currentQuestionIndex;
  final int totalQuestions;
  final int correctAnswers;
  final int wrongAnswers;
  final String formattedTime;
  final bool timeWarning;

  const TrainingProgressHeader({
    super.key,
    required this.currentQuestionIndex,
    required this.totalQuestions,
    required this.correctAnswers,
    required this.wrongAnswers,
    required this.formattedTime,
    required this.timeWarning,
  });

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final progress = totalQuestions > 0
        ? (currentQuestionIndex) / totalQuestions
        : 0.0;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Top row: Progress text & Score/Timer pills
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            // Left: Current question / Total questions
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'PROGRESS',
                  style: theme.textTheme.muted.copyWith(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.2,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  'Soal ${currentQuestionIndex + 1} dari $totalQuestions',
                  style: theme.textTheme.large.copyWith(
                    fontWeight: FontWeight.w800,
                    fontSize: 16,
                  ),
                ),
              ],
            ),
            // Right: Timer and Correct/Wrong indicators
            Row(
              children: [
                // Timer Pill
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 5,
                  ),
                  decoration: BoxDecoration(
                    color: timeWarning
                        ? Colors.red.withValues(alpha: isDark ? 0.15 : 0.08)
                        : theme.colorScheme.muted,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: timeWarning
                          ? Colors.red.withValues(alpha: 0.3)
                          : theme.colorScheme.border,
                      width: 1,
                    ),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        Icons.timer_outlined,
                        size: 14,
                        color: timeWarning
                            ? Colors.red
                            : theme.colorScheme.foreground,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        formattedTime,
                        style: theme.textTheme.small.copyWith(
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                          color: timeWarning
                              ? Colors.red
                              : theme.colorScheme.foreground,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                // Score Badge (Unified Correct/Wrong)
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 5,
                  ),
                  decoration: BoxDecoration(
                    color: theme.colorScheme.muted,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: theme.colorScheme.border,
                      width: 1,
                    ),
                  ),
                  child: Row(
                    children: [
                      // Correct counter
                      const Icon(
                        Icons.check_circle_rounded,
                        color: Colors.green,
                        size: 14,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        '$correctAnswers',
                        style: TextStyle(
                          fontWeight: FontWeight.w800,
                          fontSize: 12,
                          color: isDark
                              ? Colors.greenAccent
                              : Colors.green.shade700,
                        ),
                      ),
                      const SizedBox(width: 8),
                      // Divider line
                      Container(
                        height: 12,
                        width: 1,
                        color: isDark ? Colors.white24 : Colors.black12,
                      ),
                      const SizedBox(width: 8),
                      // Wrong counter
                      const Icon(
                        Icons.cancel_rounded,
                        color: Colors.red,
                        size: 14,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        '$wrongAnswers',
                        style: TextStyle(
                          fontWeight: FontWeight.w800,
                          fontSize: 12,
                          color: isDark
                              ? Colors.redAccent
                              : Colors.red.shade700,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
        const SizedBox(height: 12),
        // Bottom: Smooth animated linear progress bar
        ClipRRect(
          borderRadius: BorderRadius.circular(8),
          child: SizedBox(
            height: 6,
            child: LinearProgressIndicator(
              value: progress,
              backgroundColor: theme.colorScheme.muted,
              valueColor: AlwaysStoppedAnimation<Color>(
                theme.colorScheme.primary,
              ),
            ),
          ),
        ),
      ],
    );
  }
}
