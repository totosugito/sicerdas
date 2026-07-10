import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/i18n/strings.g.dart';

class TrainingFinishedView extends StatelessWidget {
  final int correctAnswers;
  final int wrongAnswers;
  final int questionCount;
  final String chapterTitle;
  final VoidCallback onBackPressed;

  const TrainingFinishedView({
    super.key,
    required this.correctAnswers,
    required this.wrongAnswers,
    required this.questionCount,
    required this.chapterTitle,
    required this.onBackPressed,
  });

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);
    final locale = Translations.of(context).math_master;
    final correctPercent = questionCount > 0 ? (correctAnswers / questionCount) * 100 : 0.0;

    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(32.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Spacer(),
              Icon(Icons.emoji_events_rounded, color: theme.colorScheme.primary, size: 96),
              const SizedBox(height: 24),
              Text(
                'Latihan Selesai!',
                style: theme.textTheme.h1.copyWith(fontWeight: FontWeight.w800),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 12),
              Text(
                chapterTitle,
                style: theme.textTheme.muted,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 40),
              
              // Scoring Summary Card
              ShadCard(
                padding: const EdgeInsets.all(24),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(locale.total_correct, style: theme.textTheme.large),
                        Text('$correctAnswers', style: theme.textTheme.large.copyWith(fontWeight: FontWeight.bold, color: Colors.green)),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(locale.total_wrong, style: theme.textTheme.large),
                        Text('$wrongAnswers', style: theme.textTheme.large.copyWith(fontWeight: FontWeight.bold, color: Colors.red)),
                      ],
                    ),
                    const SizedBox(height: 12),
                    const Divider(),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(locale.accuracy, style: theme.textTheme.large),
                        Text('${correctPercent.toStringAsFixed(0)}%', style: theme.textTheme.large.copyWith(fontWeight: FontWeight.bold, color: theme.colorScheme.primary)),
                      ],
                    ),
                  ],
                ),
              ),
              
              const Spacer(),
              
              ShadButton(
                size: ShadButtonSize.lg,
                onPressed: onBackPressed,
                child: const Text('Kembali ke Dashboard'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
