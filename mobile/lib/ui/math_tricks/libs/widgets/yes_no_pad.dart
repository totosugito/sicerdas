import 'package:flutter/material.dart';

class YesNoPad extends StatelessWidget {
  final bool answered;
  final bool? userAnswerCorrect; // true if user chose yes when correct, or no when wrong
  final bool? selectedYes; // true if user chose Yes, false if No, null if unchosen
  final ValueChanged<bool> onAnswer;
  final bool isDark;

  const YesNoPad({
    super.key,
    required this.answered,
    required this.userAnswerCorrect,
    required this.selectedYes,
    required this.onAnswer,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    Color yesBtnColor = isDark
        ? Colors.white.withValues(alpha: 0.06)
        : Colors.grey.shade100;
    Color noBtnColor = isDark
        ? Colors.white.withValues(alpha: 0.06)
        : Colors.grey.shade100;

    Color yesTextColor = isDark ? Colors.white : Colors.black87;
    Color noTextColor = isDark ? Colors.white : Colors.black87;

    if (answered && selectedYes != null) {
      if (selectedYes == true) {
        // user clicked Yes
        if (userAnswerCorrect == true) {
          yesBtnColor = Colors.green.withValues(alpha: 0.8);
          yesTextColor = Colors.white;
        } else {
          yesBtnColor = Colors.red.withValues(alpha: 0.8);
          yesTextColor = Colors.white;
        }
      } else {
        // user clicked No
        if (userAnswerCorrect == true) {
          noBtnColor = Colors.green.withValues(alpha: 0.8);
          noTextColor = Colors.white;
        } else {
          noBtnColor = Colors.red.withValues(alpha: 0.8);
          noTextColor = Colors.white;
        }
      }
    }

    return Row(
      children: [
        Expanded(
          child: GestureDetector(
            onTap: () => onAnswer(false), // No / Salah
            child: Container(
              height: 56,
              decoration: BoxDecoration(
                color: noBtnColor,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: answered && selectedYes == false
                      ? Colors.transparent
                      : (isDark
                          ? Colors.white.withValues(alpha: 0.1)
                          : Colors.grey.shade300),
                ),
              ),
              alignment: Alignment.center,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.close_rounded, color: answered && selectedYes == false ? Colors.white : Colors.red, size: 24),
                  const SizedBox(width: 8),
                  Text(
                    'Salah',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: noTextColor,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: GestureDetector(
            onTap: () => onAnswer(true), // Yes / Benar
            child: Container(
              height: 56,
              decoration: BoxDecoration(
                color: yesBtnColor,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: answered && selectedYes == true
                      ? Colors.transparent
                      : (isDark
                          ? Colors.white.withValues(alpha: 0.1)
                          : Colors.grey.shade300),
                ),
              ),
              alignment: Alignment.center,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.check_rounded, color: answered && selectedYes == true ? Colors.white : Colors.green, size: 24),
                  const SizedBox(width: 8),
                  Text(
                    'Benar',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: yesTextColor,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}
