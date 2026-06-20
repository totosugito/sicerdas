import 'package:flutter/material.dart';

class TrainingQuestionCard extends StatelessWidget {
  final String questionText;
  final bool isYesNo;
  final num? proposedAnswer;
  final bool isDark;

  const TrainingQuestionCard({
    super.key,
    required this.questionText,
    required this.isYesNo,
    required this.proposedAnswer,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 24.0),
      padding: const EdgeInsets.symmetric(
        vertical: 40.0,
        horizontal: 24.0,
      ),
      decoration: BoxDecoration(
        color: isDark
            ? Colors.white.withValues(alpha: 0.04)
            : Colors.grey.shade50,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: isDark
              ? Colors.white.withValues(alpha: 0.08)
              : Colors.grey.shade200,
          width: 1.5,
        ),
      ),
      alignment: Alignment.center,
      child: Text(
        isYesNo
            ? '$questionText = $proposedAnswer'
            : questionText,
        style: TextStyle(
          fontSize: 48,
          fontWeight: FontWeight.w800,
          letterSpacing: -1,
          color: isDark ? Colors.white : Colors.black87,
        ),
      ),
    );
  }
}
