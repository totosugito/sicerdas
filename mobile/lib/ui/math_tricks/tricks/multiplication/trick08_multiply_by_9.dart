import 'package:flutter/material.dart';
import 'package:bse/i18n/strings.g.dart';
import '../base_trick.dart';

class Trick08MultiplyBy9 extends BaseTrick {
  final String chapterKey;
  late int op1;
  late int op2;

  Trick08MultiplyBy9(super.level, {required this.chapterKey});

  @override
  void generateData() {
    final int i = level;
    int ans = 0;

    switch (chapterKey) {
      case 'trick08MultiplyBy9':
        op1 = ((BaseTrick.random.nextDouble() * 10.0).toInt()) + (i * 5);
        op2 = 9;
        break;
      case 'trick33MultiplyBy99':
        op1 =
            ((BaseTrick.random.nextDouble() * 10.0).toInt()) +
            ((i - 1) * 5) +
            1;
        op2 = 99;
        break;
      case 'trick96MultiplyBy999':
        op1 =
            ((BaseTrick.random.nextDouble() * 20.0).toInt()) +
            ((i - 1) * 10) +
            1;
        op2 = 999;
        break;
      default:
        op1 = ((BaseTrick.random.nextDouble() * 10.0).toInt()) + (i * 5);
        op2 = 9;
    }

    ans = op1 * op2;
    answer = ans;
    questionText = '$op1 × $op2';
    choices = generateChoices(answer);
  }

  @override
  void generateDemoData() {
    switch (chapterKey) {
      case 'trick08MultiplyBy9':
        op1 = 16;
        op2 = 9;
        break;
      case 'trick33MultiplyBy99':
        op1 = 45;
        op2 = 99;
        break;
      case 'trick96MultiplyBy999':
        op1 = 45;
        op2 = 999;
        break;
      default:
        op1 = 16;
        op2 = 9;
    }
    answer = op1 * op2;
    questionText = '$op1 × $op2';
    choices = generateChoices(answer);
  }

  @override
  String createHtmlStepsSolution(BuildContext context) {
    final l10n = Translations.of(context);

    int multiplier = 10;
    switch (chapterKey) {
      case 'trick08MultiplyBy9':
        multiplier = 10;
        break;
      case 'trick33MultiplyBy99':
        multiplier = 100;
        break;
      case 'trick96MultiplyBy999':
        multiplier = 1000;
        break;
      default:
        multiplier = 10;
    }

    final int temp1 = op1 * multiplier;
    String steps = "";

    // Step 1: Multiply by Multiplier
    steps += createStepLabel(
      stepNo: 1,
      text: l10n.math_tricks.trick08.step1(
        multiplier: multiplier.toString(),
        original: op2.toString(),
      ),
    );
    steps += createStepValue(
      text:
          "${spanColor(op1, 'red')}${times()}${spanColor(multiplier, 'green')}${equal()}${spanColor(temp1, 'magenta')}",
    );

    // Step 2: Subtract original number
    steps += createStepLabel(
      stepNo: 2,
      text: l10n.math_tricks.trick08.step2(
        temp1: temp1.toString(),
        op1: op1.toString(),
      ),
    );
    steps += createStepValue(
      text:
          "${spanColor(temp1, 'magenta')}${minus()}${spanColor(op1, 'red')}${equal()}${spanColor(answer, 'default')}",
    );

    return buildHtmlContainer(
      problemLabel: l10n.math_tricks.soal,
      problem: '$op1 × $op2',
      steps: steps,
      finalAnswer: l10n.math_tricks.jadi(result: '$op1 × $op2 = $answer'),
    );
  }
}
