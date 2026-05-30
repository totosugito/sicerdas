import 'package:flutter/material.dart';

class ViewOxidationStates extends StatelessWidget {
  final List<int> oxs;
  final double radius;
  final Color textColor;

  const ViewOxidationStates({
    super.key,
    required this.oxs,
    this.radius = 20.0,
    this.textColor = Colors.white,
  });

  @override
  Widget build(BuildContext context) {
    const idxOs = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

    return Wrap(
      spacing: 2.0,
      runSpacing: 4.0,
      children: idxOs.map((os) {
        final isIncluded = oxs.contains(os);
        final Color bgColor;
        final String label;

        if (isIncluded) {
          bgColor = os == 0
              ? const Color(0xFF4ADE80)
              : (os > 0 ? const Color(0xFF3B82F6) : const Color(0xFFEF4444));
          label = os == 0 ? "0" : (os > 0 ? "+$os" : "$os");
        } else {
          bgColor = const Color(0xFF9CA3AF);
          label = "-";
        }

        return Container(
          width: radius,
          height: radius,
          decoration: BoxDecoration(
            color: bgColor,
            shape: BoxShape.circle,
          ),
          alignment: Alignment.center,
          child: Text(
            label,
            style: TextStyle(
              color: textColor,
              fontSize: radius * 0.55,
              fontWeight: FontWeight.bold,
            ),
          ),
        );
      }).toList(),
    );
  }
}
