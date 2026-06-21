import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/i18n/strings.g.dart';
import 'package:bse/widgets/ads/ads_banner.dart';

class TrainingFinishedView extends ConsumerWidget {
  final int correctAnswers;
  final int wrongAnswers;
  final int secondsElapsed;
  final int totalQuestions;
  final Color themeColor;
  final VoidCallback onMainMenu;
  final VoidCallback onAction;
  final String actionLabel;

  const TrainingFinishedView({
    super.key,
    required this.correctAnswers,
    required this.wrongAnswers,
    required this.secondsElapsed,
    required this.totalQuestions,
    required this.themeColor,
    required this.onMainMenu,
    required this.onAction,
    required this.actionLabel,
  });

  String _formatTime(int totalSeconds) {
    final int minutes = totalSeconds ~/ 60;
    final int seconds = totalSeconds % 60;
    return '${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = ShadTheme.of(context);
    final l10n = Translations.of(context);
    final isDark = theme.brightness == Brightness.dark;

    int stars = 0;
    if (correctAnswers == totalQuestions) {
      stars = 3;
    } else if (correctAnswers >= 4) {
      stars = 2;
    } else if (correctAnswers >= 3) {
      stars = 1;
    }

    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 24.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(shape: BoxShape.circle, color: themeColor.withValues(alpha: 0.1)),
                    child: Icon(
                      stars > 0 ? Icons.emoji_events_rounded : Icons.sentiment_dissatisfied_rounded,
                      size: 80,
                      color: stars > 0 ? Colors.amber : Colors.grey,
                    ),
                  ),
                  const SizedBox(height: 24),
                  Text(
                    stars > 0 ? l10n.math_tricks.training.finishedSuccess : l10n.math_tricks.training.finishedFail,
                    style: theme.textTheme.h3.copyWith(fontWeight: FontWeight.w800),
                  ),
                  const SizedBox(height: 12),
                  // Stars
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(3, (index) {
                      final isFilled = index < stars;
                      return Icon(
                        Icons.star_rounded,
                        size: 40,
                        color: isFilled ? Colors.amber : (isDark ? Colors.white10 : Colors.grey.shade300),
                      );
                    }),
                  ),
                  const SizedBox(height: 24),
                  // Score breakdown
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: isDark ? Colors.white.withValues(alpha: 0.03) : Colors.grey.shade50,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: isDark ? Colors.white10 : Colors.grey.shade200),
                    ),
                    child: Column(
                      children: [
                        _buildStatsRow(
                          l10n.math_tricks.training.correctAnswers,
                          '$correctAnswers / $totalQuestions',
                          Colors.green,
                        ),
                        const Divider(height: 20),
                        _buildStatsRow(
                          l10n.math_tricks.training.wrongAnswers,
                          '$wrongAnswers / $totalQuestions',
                          Colors.red,
                        ),
                        const Divider(height: 20),
                        _buildStatsRow(
                          l10n.math_tricks.training.time,
                          _formatTime(secondsElapsed),
                          theme.colorScheme.foreground,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 40),
                  Row(
                    children: [
                      Expanded(
                        child: ShadButton.outline(
                          onPressed: onMainMenu,
                          child: Text(l10n.math_tricks.training.mainMenu),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: ShadButton(
                          backgroundColor: themeColor,
                          hoverBackgroundColor: themeColor.withValues(alpha: 0.9),
                          onPressed: onAction,
                          child: Text(actionLabel),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
      bottomNavigationBar: AdsBanner.buildBottomBar(ref),
    );
  }

  Widget _buildStatsRow(String label, String value, Color valueColor) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(fontWeight: FontWeight.w500)),
        Text(
          value,
          style: TextStyle(fontWeight: FontWeight.bold, color: valueColor, fontSize: 16),
        ),
      ],
    );
  }
}
