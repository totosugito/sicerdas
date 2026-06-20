import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:bse/i18n/strings.g.dart';

class DailyHistoryCard extends StatelessWidget {
  final String dateTimeStr;
  final int correctAnswer;
  final int wrongAnswer;
  final bool isDark;

  const DailyHistoryCard({
    super.key,
    required this.dateTimeStr,
    required this.correctAnswer,
    required this.wrongAnswer,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    final theme = ShadTheme.of(context);
    final l10n = Translations.of(context);
    final dailyTotal = correctAnswer + wrongAnswer;
    final double dailyAccuracy =
        dailyTotal > 0 ? (correctAnswer / dailyTotal) * 100 : 0.0;

    final progressColor = dailyAccuracy >= 80
        ? Colors.green
        : (dailyAccuracy >= 50 ? Colors.orange : Colors.red);

    return ShadCard(
      backgroundColor: isDark ? Colors.white.withValues(alpha: 0.02) : Colors.white,
      border: ShadBorder.all(
        color: isDark ? Colors.white.withValues(alpha: 0.05) : Colors.grey.shade200,
        width: 1,
      ),
      radius: BorderRadius.circular(16),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                dateTimeStr,
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                  color: isDark ? Colors.white : Colors.black87,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: progressColor.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  '${l10n.math_tricks.accuracy}: ${dailyAccuracy.toStringAsFixed(0)}%',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 11,
                    color: progressColor,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: SizedBox(
              height: 6,
              child: LinearProgressIndicator(
                value: dailyTotal > 0 ? correctAnswer / dailyTotal : 0,
                backgroundColor: Colors.red.withValues(alpha: 0.15),
                valueColor: const AlwaysStoppedAnimation<Color>(Colors.green),
              ),
            ),
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Row(
                children: [
                  Container(
                    width: 8,
                    height: 8,
                    decoration: const BoxDecoration(
                      color: Colors.green,
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 6),
                  Text(
                    '$correctAnswer ${l10n.math_tricks.achievement.correct}',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                      color: isDark ? Colors.grey.shade300 : Colors.grey.shade700,
                    ),
                  ),
                ],
              ),
              const SizedBox(width: 16),
              Row(
                children: [
                  Container(
                    width: 8,
                    height: 8,
                    decoration: const BoxDecoration(
                      color: Colors.red,
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 6),
                  Text(
                    '$wrongAnswer ${l10n.math_tricks.achievement.wrong}',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                      color: isDark ? Colors.grey.shade300 : Colors.grey.shade700,
                    ),
                  ),
                ],
              ),
              const Spacer(),
              Text(
                'Total: $dailyTotal',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: theme.colorScheme.mutedForeground,
                ),
              ),
            ],
          )
        ],
      ),
    );
  }
}
