import 'package:flutter/material.dart';

class NumericKeyPad extends StatelessWidget {
  final String currentInput;
  final ValueChanged<String> onInputChanged;
  final VoidCallback onSubmit;
  final Color themeColor;
  final bool isDark;

  const NumericKeyPad({
    super.key,
    required this.currentInput,
    required this.onInputChanged,
    required this.onSubmit,
    required this.themeColor,
    required this.isDark,
  });

  void _handleKeyPress(String key) {
    if (key == 'C') {
      onInputChanged('');
    } else if (key == '⌫') {
      if (currentInput.isNotEmpty) {
        onInputChanged(currentInput.substring(0, currentInput.length - 1));
      }
    } else if (key == 'OK') {
      onSubmit();
    } else {
      if (currentInput.length < 8) {
        onInputChanged(currentInput + key);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Answer input display
        Container(
          height: 60,
          decoration: BoxDecoration(
            border: Border.all(
              color: themeColor.withValues(alpha: 0.4),
              width: 1.5,
            ),
            borderRadius: BorderRadius.circular(12),
            color: isDark ? Colors.black12 : Colors.white,
          ),
          alignment: Alignment.center,
          child: Text(
            currentInput.isEmpty ? 'Ketik jawaban...' : currentInput,
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: currentInput.isEmpty
                  ? (isDark ? Colors.white24 : Colors.grey.shade400)
                  : (isDark ? Colors.white : Colors.black87),
            ),
          ),
        ),
        const SizedBox(height: 16),
        // Num pad buttons
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 3,
            crossAxisSpacing: 10,
            mainAxisSpacing: 10,
            childAspectRatio: 1.8,
          ),
          itemCount: 12,
          itemBuilder: (context, index) {
            String label = '';
            if (index < 9) {
              label = '${index + 1}';
            } else if (index == 9) {
              label = 'C';
            } else if (index == 10) {
              label = '0';
            } else if (index == 11) {
              label = 'OK';
            }

            final isAction = label == 'C' || label == 'OK';

            return GestureDetector(
              onTap: () => _handleKeyPress(label),
              child: Container(
                decoration: BoxDecoration(
                  color: isAction
                      ? (label == 'OK'
                          ? themeColor.withValues(alpha: 0.8)
                          : (isDark ? Colors.white10 : Colors.grey.shade200))
                      : (isDark ? Colors.white.withValues(alpha: 0.05) : Colors.grey.shade50),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: isDark
                        ? Colors.white.withValues(alpha: 0.05)
                        : Colors.grey.shade200,
                  ),
                ),
                alignment: Alignment.center,
                child: Text(
                  label,
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: label == 'OK'
                        ? Colors.white
                        : (isDark ? Colors.white70 : Colors.black87),
                  ),
                ),
              ),
            );
          },
        ),
      ],
    );
  }
}
