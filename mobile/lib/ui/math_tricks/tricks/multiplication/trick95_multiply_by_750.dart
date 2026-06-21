import 'package:flutter/material.dart';
import 'package:bse/i18n/strings.g.dart';
import '../base_trick.dart';

class Trick95MultiplyBy750 extends BaseTrick {
  final String chapterKey;
  late int op1;
  late int op2;

  Trick95MultiplyBy750(super.level, {required this.chapterKey});

  @override
  void generateData() {
    final int i = level;
    int ans = 0;

    op1 = ((BaseTrick.random.nextDouble() * 20.0).toInt()) + ((i - 1) * 10) + 1;
    switch (chapterKey) {
      case 'trick95MultiplyBy750':
        op2 = 750;
        break;
      case 'trick101MultiplyBy75':
        op2 = 75;
        break;
      default:
        op2 = 750;
    }

    ans = op1 * op2;
    answer = ans;
    questionText = '$op1 × $op2';
    choices = generateChoices(answer);
  }

  @override
  void generateDemoData() {
    switch (chapterKey) {
      case 'trick95MultiplyBy750':
        op1 = 16;
        op2 = 750;
        break;
      case 'trick101MultiplyBy75':
        op1 = 24;
        op2 = 75;
        break;
      default:
        op1 = 16;
        op2 = 750;
    }
    answer = op1 * op2;
    questionText = '$op1 × $op2';
    choices = generateChoices(answer);
  }

  @override
  String createHtmlStepsSolution(BuildContext context) {
    final l10n = Translations.of(context);

    int var1 = 0;
    int var2 = 0;
    int var3 = 0;
    switch (chapterKey) {
      case 'trick95MultiplyBy750':
        var1 = 4;
        var2 = 3;
        var3 = 1000;
        break;
      case 'trick101MultiplyBy75':
        var1 = 4;
        var2 = 3;
        var3 = 100;
        break;
      default:
        var1 = 4;
        var2 = 3;
        var3 = 1000;
    }

    final double temp1 = op1 / var1;
    final double temp2 = temp1 * var2;

    final String temp1Str = (op1 % var1 == 0)
        ? temp1.toInt().toString()
        : temp1.toString();

    final String temp2Str = ((op1 * var2) % var1 == 0)
        ? temp2.toInt().toString()
        : temp2.toString();

    String steps = "";

    // Step 1: Divide by var1
    steps += createStepLabel(
      stepNo: 1,
      text: l10n.math_tricks.trick95.step1(
        divisor: var1.toString(),
      ),
    );
    steps += createStepValue(
      text:
          "${spanColor(op1, 'red')}${divide()}${spanColor(var1, 'green')}${equal()}${spanColor(temp1Str, 'magenta')}",
    );

    // Step 2: Multiply by var2
    steps += createStepLabel(
      stepNo: 2,
      text: l10n.math_tricks.trick95.step2(
        temp1: temp1Str,
        multiplier1: var2.toString(),
      ),
    );
    steps += createStepValue(
      text:
          "${spanColor(temp1Str, 'magenta')}${times()}${spanColor(var2, 'yellow')}${equal()}${spanColor(temp2Str, 'blue')}",
    );

    // Step 3: Multiply by var3
    steps += createStepLabel(
      stepNo: 3,
      text: l10n.math_tricks.trick95.step3(
        temp2: temp2Str,
        multiplier2: var3.toString(),
      ),
    );
    steps += createStepValue(
      text:
          "${spanColor(temp2Str, 'blue')}${times()}${spanColor(var3, 'yellow')}${equal()}${spanColor(answer, 'default')}",
    );

    return buildHtmlContainer(
      problemLabel: l10n.math_tricks.soal,
      problem: '$op1 × $op2',
      steps: steps,
      finalAnswer: l10n.math_tricks.jadi(result: '$op1 × $op2 = $answer'),
    );
  }
}
