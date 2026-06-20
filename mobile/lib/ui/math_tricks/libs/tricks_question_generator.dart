import 'package:flutter/material.dart';
import 'widgets/keypad_mode.dart';
import '../tricks/addition/trick14_add_close_to_100.dart';

class GeneratedQuestion {
  final String questionText;
  final num answer;
  final List<num> choices;
  final String Function(BuildContext context) getSolutionHtml;
  final List<KeyPadMode> supportedKeyPads;

  GeneratedQuestion({
    required this.questionText,
    required this.answer,
    required this.choices,
    required this.getSolutionHtml,
    required this.supportedKeyPads,
  });

  String buildSolutionHtml(BuildContext context) => getSolutionHtml(context);
}

class TricksQuestionGenerator {
  static GeneratedQuestion generate(String chapterKey, int level) {
    switch (chapterKey) {
      case 'trick14AddCloseTo100':
        return Trick14AddCloseTo100(level).generate();
      default:
        throw UnimplementedError('Trick "$chapterKey" is under development and not yet registered.');
    }
  }
}
