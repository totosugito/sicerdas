import 'dart:math';
import 'package:flutter/material.dart';
import 'package:bse/widgets/funvas/funvas.dart';

class ViewElectronShell extends Funvas {
  final Color labelColor;
  final String atomSymbol;
  final Color atomColor;
  final double orbitStroke;
  final Color orbitColor;
  final List<Color>? orbitColors;
  final double speedDivider;
  final Color electronColor;
  final List<int> electrons;

  ViewElectronShell({
    this.labelColor = Colors.white,
    this.atomSymbol = "",
    this.atomColor = const Color(0xFF8B5CF6),
    this.orbitStroke = 1.5,
    this.orbitColor = const Color(0x668B5CF6),
    this.orbitColors,
    this.speedDivider = 1.0,
    this.electronColor = const Color(0xFFFBBF24),
    required this.electrons,
  });

  static const List<Color> defaultOrbitColors = [
    Color(0x668B5CF6), // purple
    Color(0x669333EA), // purple-600
    Color(0x66DB2777), // pink
    Color(0x66F97316), // orange
    Color(0x663B82F6), // blue
    Color(0x660EA5E9), // cyan
    Color(0x6610B981), // emerald
    Color(0x66F59E0B), // amber
  ];

  @override
  void u(double t) {
    final sz = min(s.width, s.height);

    const orbitSpacing = 15.0;
    const centerRadius = 18.0;
    const electronRadius = 4.0;

    // Translate to center
    c.translate(sz / 2.0, sz / 2.0);

    // Draw center circle
    c.drawCircle(Offset.zero, centerRadius, Paint()..color = atomColor);

    // Draw atom symbol text
    final textStyle = TextStyle(
      color: labelColor,
      fontSize: centerRadius * 0.8,
      fontWeight: FontWeight.bold,
      fontFamily: "IBM Plex Sans",
    );
    final span = TextSpan(style: textStyle, text: atomSymbol);
    final tp = TextPainter(
      text: span,
      textAlign: TextAlign.center,
      textDirection: TextDirection.ltr,
    )..layout();

    tp.paint(c, Offset(-tp.width / 2.0, -tp.height / 2.0 + 1));

    // Loop over orbits
    final orbits = electrons.length;
    for (int i = 0; i < orbits; i++) {
      final radius = centerRadius + orbitSpacing * (i + 1);

      // Orbit color
      final currentOrbitColor = (orbitColors != null && i < orbitColors!.length)
          ? orbitColors![i]
          : (i < defaultOrbitColors.length
                ? defaultOrbitColors[i]
                : orbitColor);

      // Draw orbit ring
      c.drawCircle(
        Offset.zero,
        radius,
        Paint()
          ..color = currentOrbitColor
          ..style = PaintingStyle.stroke
          ..strokeWidth = orbitStroke,
      );

      // Draw electrons
      final rotation = t / (speedDivider * (i + 1));
      final electronSpacing = (2.0 * pi) / electrons[i];

      for (int j = 0; j < electrons[i]; j++) {
        final angle = electronSpacing * j + rotation;
        final x = cos(angle) * radius;
        final y = sin(angle) * radius;
        final electronOffset = Offset(x, y);

        // Electron glow effect (Radial Gradient)
        final gradientPaint = Paint()
          ..shader =
              RadialGradient(
                colors: [
                  electronColor,
                  electronColor.withValues(alpha: 0.6),
                  Colors.transparent,
                ],
                stops: const [0.0, 0.4, 1.0],
              ).createShader(
                Rect.fromCircle(
                  center: electronOffset,
                  radius: electronRadius * 2.0,
                ),
              );

        c.drawCircle(electronOffset, electronRadius * 2.0, gradientPaint);

        // Solid electron center
        c.drawCircle(
          electronOffset,
          electronRadius,
          Paint()..color = electronColor,
        );
      }
    }
  }
}
