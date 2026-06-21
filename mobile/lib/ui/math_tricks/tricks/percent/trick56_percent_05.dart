import 'package:flutter/material.dart';
import 'package:bse/i18n/strings.g.dart';
import '../base_trick.dart';

class Trick56Percent05 extends BaseTrick {
  final String chapterKey;
  late double op1;
  late int op2;

  String get op1Str => op1 % 1 == 0 ? op1.toInt().toString() : op1.toString();

  Trick56Percent05(super.level, {required this.chapterKey});

  @override
  void generateData() {
    final int i = level;
    int ans = ((BaseTrick.random.nextDouble() * 20.0).toInt()) + ((i - 1) * 10);

    switch (chapterKey) {
      case 'trick56Percent05':
        ans += 1;
        ans *= 200;
        op2 = ans;
        ans = ans ~/ 200;
        op1 = 0.5;
        break;
      case 'trick53Percent5':
        ans += 1;
        ans *= 20;
        op2 = ans;
        ans = ans ~/ 20;
        op1 = 5;
        break;
      default:
        ans += 1;
        ans *= 200;
        op2 = ans;
        ans = ans ~/ 200;
        op1 = 0.5;
    }

    answer = ans;
    questionText = '$op1Str% ${t.math_tricks.of} $op2';
    choices = generateChoices(answer);
  }

  @override
  void generateDemoData() {
    switch (chapterKey) {
      case 'trick56Percent05':
        op1 = 0.5;
        op2 = 1000;
        break;
      case 'trick53Percent5':
        op1 = 5;
        op2 = 60;
        break;
      default:
        op1 = 0.5;
        op2 = 1000;
    }
    answer = (op1 * op2) ~/ 100;
    questionText = '$op1Str% ${t.math_tricks.of} $op2';
    choices = generateChoices(answer);
  }

  @override
  String createHtmlStepsSolution(BuildContext context) {
    final l10n = Translations.of(context);

    int var1 = 0;
    int step1Percent = 1;
    switch (chapterKey) {
      case 'trick56Percent05':
        var1 = 100;
        step1Percent = 1;
        break;
      case 'trick53Percent5':
        var1 = 10;
        step1Percent = 10;
        break;
      default:
        var1 = 100;
        step1Percent = 1;
    }

    final double temp1 = op2 / var1;
    final String temp1Str = (op2 % var1 == 0)
        ? temp1.toInt().toString()
        : temp1.toString();

    String steps = "";

    // Step 1: Divide op2 by var1
    steps += createStepLabel(
      stepNo: 1,
      text: l10n.math_tricks.trick56.step1(
        divisor: var1.toString(),
        percent: step1Percent.toString(),
      ),
    );
    steps += createStepValue(
      text:
          "${spanColor(op2, 'blue')}${divide()}${spanColor(var1, 'yellow')}${equal()}${spanColor(temp1Str, 'green')}",
    );

    // Step 2: Divide result by 2
    steps += createStepLabel(
      stepNo: 2,
      text: l10n.math_tricks.trick56.step2(
        temp1: temp1Str,
        targetPercent: op1Str,
      ),
    );
    steps += createStepValue(
      text:
          "${spanColor(temp1Str, 'green')}${divide()}2${equal()}${spanColor(answer, 'default')}",
    );

    return buildHtmlContainer(
      problemLabel: l10n.math_tricks.soal,
      problem: '$op1Str% ${l10n.math_tricks.of} $op2',
      steps: steps,
      finalAnswer: l10n.math_tricks.jadi(result: '$op1Str% ${l10n.math_tricks.of} $op2 = $answer'),
    );
  }
}
