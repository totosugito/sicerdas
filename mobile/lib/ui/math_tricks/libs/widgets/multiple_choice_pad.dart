import 'package:flutter/material.dart';

class MultipleChoicePad extends StatelessWidget {
  final List<num> choices;
  final num correctAnswer;
  final num? selectedAnswer;
  final bool answered;
  final ValueChanged<num> onChoiceSelected;
  final bool isDark;

  const MultipleChoicePad({
    super.key,
    required this.choices,
    required this.correctAnswer,
    required this.selectedAnswer,
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
        final choice = choices[index];
        final isSelected = selectedAnswer == choice;
        final isCorrectChoice = choice == correctAnswer;

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
          onTap: () => onChoiceSelected(choice),
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
            child: Text(
              choice is double ? choice.toStringAsFixed(2) : '$choice',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                color: textColor,
              ),
            ),
          ),
        );
      },
    );
  }
}
