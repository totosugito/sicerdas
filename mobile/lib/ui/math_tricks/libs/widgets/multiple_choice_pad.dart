import 'package:flutter/material.dart';
import 'package:flutter_math_fork/flutter_math.dart';

class MultipleChoicePad extends StatelessWidget {
  final List<String> choices;
  final int correctIndex;
  final int? selectedIndex;
  final bool answered;
  final ValueChanged<int> onChoiceSelected;
  final bool isDark;

  const MultipleChoicePad({
    super.key,
    required this.choices,
    required this.correctIndex,
    required this.selectedIndex,
    required this.answered,
    required this.onChoiceSelected,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 16,
        mainAxisSpacing: 16,
        childAspectRatio: 2.2,
      ),
      itemCount: choices.length,
      itemBuilder: (context, index) {
        final choiceText = choices[index];
        final isSelected = selectedIndex == index;
        final isCorrectChoice = index == correctIndex;

        Color btnColor = isDark
            ? Colors.white.withValues(alpha: 0.06)
            : Colors.grey.shade100;
        Color textColor = isDark ? Colors.white : Colors.black87;

        if (answered) {
          if (isCorrectChoice) {
            btnColor = Colors.green.withValues(alpha: 0.8);
            textColor = Colors.white;
          } else if (isSelected) {
            btnColor = Colors.red.withValues(alpha: 0.8);
            textColor = Colors.white;
          }
        }

        return GestureDetector(
          onTap: () => onChoiceSelected(index),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 150),
            decoration: BoxDecoration(
              color: btnColor,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: answered && (isCorrectChoice || isSelected)
                    ? Colors.transparent
                    : (isDark
                          ? Colors.white.withValues(alpha: 0.1)
                          : Colors.grey.shade300),
              ),
            ),
            alignment: Alignment.center,
            padding: const EdgeInsets.symmetric(horizontal: 8),
            child: FittedBox(
              fit: BoxFit.scaleDown,
              child: Math.tex(
                choiceText,
                textStyle: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  color: textColor,
                ),
                onErrorFallback: (error) => Text(
                  choiceText,
                  style: TextStyle(
                     fontSize: 22,
                     fontWeight: FontWeight.bold,
                     color: textColor,
                  ),
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}
