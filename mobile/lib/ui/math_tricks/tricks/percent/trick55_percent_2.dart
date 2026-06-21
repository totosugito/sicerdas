import 'package:flutter/material.dart';
import 'package:bse/i18n/strings.g.dart';
import '../base_trick.dart';

class Trick55Percent2 extends BaseTrick {
  final String chapterKey;
  late int op1;
  late int op2;

  Trick55Percent2(super.level, {required this.chapterKey});

  @override
  void generateData() {
    final int i = level;
    int ans = ((BaseTrick.random.nextDouble() * 20.0).toInt()) + ((i - 1) * 10);

    switch (chapterKey) {
      case 'trick55Percent2':
        ans += 1;
        ans *= 50;
        op2 = ans;
        ans = ans ~/ 50;
        op1 = 2;
        break;
      case 'trick54Percent4':
        ans += 1;
        ans *= 25;
        op2 = ans;
        ans = ans ~/ 25;
        op1 = 4;
        break;
      case 'trick51Percent20':
        ans += 1;
        op2 = ans * 5;
        op1 = 20;
        break;
      default:
        ans += 1;
        ans *= 50;
        op2 = ans;
        ans = ans ~/ 50;
        op1 = 2;
    }

    answer = ans;
    questionText = '$op1% ${t.math_tricks.of} $op2';
    choices = generateChoices(answer);
  }

  @override
  void generateDemoData() {
    switch (chapterKey) {
      case 'trick55Percent2':
        op1 = 2;
        op2 = 200;
        break;
      case 'trick54Percent4':
        op1 = 4;
        op2 = 500;
        break;
      case 'trick51Percent20':
        op1 = 20;
        op2 = 500;
        break;
      default:
        op1 = 2;
        op2 = 200;
    }
    answer = (op1 * op2) ~/ 100;
    questionText = '$op1% ${t.math_tricks.of} $op2';
    choices = generateChoices(answer);
  }

  @override
  String createHtmlStepsSolution(BuildContext context) {
    final l10n = Translations.of(context);

    int var1 = 0;
    int var2 = 0;
    int step1Percent = 1;
    switch (chapterKey) {
      case 'trick55Percent2':
        var1 = 100;
        var2 = 2;
        step1Percent = 1;
        break;
      case 'trick54Percent4':
        var1 = 100;
        var2 = 4;
        step1Percent = 1;
        break;
      case 'trick51Percent20':
        var1 = 10;
        var2 = 2;
        step1Percent = 10;
        break;
      default:
        var1 = 100;
        var2 = 2;
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
      text: l10n.math_tricks.trick55.step1(
        divisor: var1.toString(),
        percent: step1Percent.toString(),
      ),
    );
    steps += createStepValue(
      text:
          "${spanColor(op2, 'blue')}${divide()}${spanColor(var1, 'yellow')}${equal()}${spanColor(temp1Str, 'green')}",
    );

    // Step 2: Multiply result by var2
    steps += createStepLabel(
      stepNo: 2,
      text: l10n.math_tricks.trick55.step2(
        temp1: temp1Str,
        multiplier: var2.toString(),
      ),
    );
    steps += createStepValue(
      text:
          "${spanColor(temp1Str, 'green')}${times()}${spanColor(var2, 'magenta')}${equal()}${spanColor(answer, 'default')}",
    );

    return buildHtmlContainer(
      problemLabel: l10n.math_tricks.soal,
      problem: '$op1% ${l10n.math_tricks.of} $op2',
      steps: steps,
      finalAnswer: l10n.math_tricks.jadi(result: '$op1% ${l10n.math_tricks.of} $op2 = $answer'),
    );
  }
}
