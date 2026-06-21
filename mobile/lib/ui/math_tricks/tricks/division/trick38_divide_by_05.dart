import 'package:flutter/material.dart';
import 'package:bse/i18n/strings.g.dart';
import '../base_trick.dart';

class Trick38DivideBy05 extends BaseTrick {
  final String chapterKey;
  late int op1;
  late double op2;

  String get op2Str => op2 % 1 == 0 ? op2.toInt().toString() : op2.toString();

  Trick38DivideBy05(super.level, {required this.chapterKey});

  @override
  void generateData() {
    final int i = level;
    int ans = 0;

    switch (chapterKey) {
      case 'trick38DivideBy05':
        op1 = ((BaseTrick.random.nextDouble() * 20.0).toInt() + ((i - 1) * 20)) + 2;
        op2 = 0.5;
        ans = op1 * 2;
        break;
      case 'trick43DivideBy025':
        op1 = ((BaseTrick.random.nextDouble() * 10.0).toInt() + ((i - 1) * 10)) + 2;
        op2 = 0.25;
        ans = op1 * 4;
        break;
      default:
        op1 = ((BaseTrick.random.nextDouble() * 20.0).toInt() + ((i - 1) * 20)) + 2;
        op2 = 0.5;
        ans = op1 * 2;
    }

    answer = ans;
    questionText = '$op1${divide()}$op2Str';
    choices = generateChoices(answer);
  }

  @override
  void generateDemoData() {
    switch (chapterKey) {
      case 'trick38DivideBy05':
        op1 = 15;
        op2 = 0.5;
        break;
      case 'trick43DivideBy025':
        op1 = 8;
        op2 = 0.25;
        break;
      default:
        op1 = 15;
        op2 = 0.5;
    }
    answer = op1 / op2;
    questionText = '$op1${divide()}$op2Str';
    choices = generateChoices(answer);
  }

  @override
  String createHtmlStepsSolution(BuildContext context) {
    final l10n = Translations.of(context);

    int var1 = 0;
    switch (chapterKey) {
      case 'trick38DivideBy05':
        var1 = 2;
        break;
      case 'trick43DivideBy025':
        var1 = 4;
        break;
      default:
        var1 = 2;
    }

    final String answerStr = (answer % 1 == 0) ? answer.toInt().toString() : answer.toString();

    String steps = "";

    // Step 1: Multiply by var1
    steps += createStepLabel(
      stepNo: 1,
      text: l10n.math_tricks.trick38.step1(multiplier: var1.toString()),
    );
    steps += createStepValue(
      text:
          "${spanColor(op1, 'red')}${times()}${spanColor(var1, 'yellow')}${equal()}${spanColor(answerStr, 'default')}",
    );

    return buildHtmlContainer(
      problemLabel: l10n.math_tricks.soal,
      problem: '$op1${divide()}$op2Str',
      steps: steps,
      finalAnswer: l10n.math_tricks.jadi(result: '$op1${divide()}$op2Str = $answerStr'),
    );
  }
}
