import 'dart:math';
import 'package:flutter/material.dart';
import '../libs/tricks_question_generator.dart';
import '../libs/widgets/keypad_mode.dart';

abstract class BaseTrick {
  final int level;
  static final Random random = Random();

  late String questionText;
  late num answer;
  late List<num> choices;

  BaseTrick(this.level);

  void generateData();
  String createHtmlStepsSolution(BuildContext context);

  List<KeyPadMode> get supportedKeyPads => [
        KeyPadMode.multipleChoice,
        KeyPadMode.numPad,
        KeyPadMode.yesNo,
      ];

  void generateDemoData() {
    generateData();
  }

  GeneratedQuestion generate() {
    generateData();
    return GeneratedQuestion(
      questionText: questionText,
      answer: answer,
      choices: choices,
      getSolutionHtml: createHtmlStepsSolution,
      supportedKeyPads: supportedKeyPads,
    );
  }

  GeneratedQuestion generateDemo() {
    generateDemoData();
    return GeneratedQuestion(
      questionText: questionText,
      answer: answer,
      choices: choices,
      getSolutionHtml: createHtmlStepsSolution,
      supportedKeyPads: supportedKeyPads,
    );
  }

  // HTML Generation Helpers
  String plus() => " + ";
  String minus() => " − ";
  String times() => " × ";
  String divide() => " ÷ ";
  String equal() => " = ";

  String spanColor(dynamic value, String color) {
    String hexColor;
    switch (color) {
      case 'blue':
        hexColor = '#3b82f6';
        break;
      case 'green':
        hexColor = '#10b981';
        break;
      case 'red':
        hexColor = '#ef4444';
        break;
      case 'yellow':
        hexColor = '#f59e0b';
        break;
      case 'magenta':
      case 'purple':
        hexColor = '#8b5cf6';
        break;
      default:
        hexColor = '#1f2937';
    }
    return '<span style="color: $hexColor; font-weight: bold;">$value</span>';
  }

  String createStepLabel({required int stepNo, required String text}) {
    return '<div style="margin-top: 12px; margin-bottom: 4px; color: #4b5563; font-size: 14px;"><span style="font-weight: bold; color: #1f2937;">Langkah $stepNo:</span> $text</div>';
  }

  String createStepValue({required String text}) {
    return '<div style="font-family: monospace; font-size: 15px; margin-bottom: 12px; padding-left: 12px; border-left: 3px solid #e5e7eb; font-weight: bold;">$text</div>';
  }

  String buildHtmlContainer({
    required String problemLabel,
    required String problem,
    required String steps,
    required String finalAnswer,
  }) {
    return '''
<div style="font-family: sans-serif; padding: 0px 12px 12px 12px; line-height: 1.6;">
  <div style="margin-bottom: 16px; padding: 10px; background-color: #f3f4f6; border-radius: 8px; border-left: 4px solid #3b82f6;">
    <strong>$problemLabel</strong> <span style="font-size: 16px; font-weight: bold; color: #1f2937;">$problem</span>
  </div>
  $steps
  <div style="margin-top: 16px; font-size: 15px; font-weight: bold; color: #10b981; padding: 8px; background-color: #f0fdf4; border-radius: 6px; display: inline-block;">
    $finalAnswer.
  </div>
</div>
''';
  }

  List<num> generateChoices(num answer) {
    final Set<num> choiceSet = {answer};
    final bool isDouble = answer is double;

    while (choiceSet.length < 4) {
      num distractor;
      if (isDouble) {
        final double delta = ((random.nextInt(6) - 3) * 0.25);
        distractor = (answer + delta);
        if (distractor <= 0) distractor = answer + 1;
        distractor = double.parse(distractor.toStringAsFixed(2));
      } else {
        final int delta = (random.nextInt(20) - 10);
        distractor = (answer + delta).toInt();
        if (distractor <= 0) {
          distractor = (answer + random.nextInt(10) + 1).toInt();
        }
      }
      choiceSet.add(distractor);
    }

    final List<num> list = choiceSet.toList()..shuffle(random);
    return list;
  }
}
