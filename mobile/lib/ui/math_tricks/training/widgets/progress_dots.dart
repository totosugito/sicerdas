import 'package:flutter/material.dart';

class ProgressDots extends StatelessWidget {
  final int totalQuestions;
  final int currentQuestionIndex;
  final List<bool?> questionResults;
  final Color themeColor;
  final bool isDark;

  const ProgressDots({
    super.key,
    required this.totalQuestions,
    required this.currentQuestionIndex,
    required this.questionResults,
    required this.themeColor,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: List.generate(totalQuestions, (index) {
          final status = questionResults[index];
          Color dotColor = isDark ? Colors.white10 : Colors.grey.shade300;
          IconData? icon;

          if (status == true) {
            dotColor = Colors.green;
            icon = Icons.check;
          } else if (status == false) {
            dotColor = Colors.red;
            icon = Icons.close;
          } else if (index == currentQuestionIndex) {
            dotColor = themeColor;
          }

          return Flexible(
            child: Container(
              margin: const EdgeInsets.symmetric(horizontal: 3),
              height: 24,
              decoration: BoxDecoration(
                color: index == currentQuestionIndex && status == null
                    ? Colors.transparent
                    : dotColor,
                shape: BoxShape.circle,
                border: index == currentQuestionIndex && status == null
                    ? Border.all(color: themeColor, width: 2)
                    : null,
              ),
              alignment: Alignment.center,
              child: icon != null
                  ? Icon(icon, size: 12, color: Colors.white)
                  : Text(
                      '${index + 1}',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: index == currentQuestionIndex
                            ? themeColor
                            : (isDark
                                  ? Colors.white.withValues(alpha: 0.3)
                                  : Colors.black.withValues(alpha: 0.3)),
                      ),
                    ),
            ),
          );
        }),
      ),
    );
  }
}
