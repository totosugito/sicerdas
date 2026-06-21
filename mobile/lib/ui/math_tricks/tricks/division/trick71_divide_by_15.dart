import 'package:flutter/material.dart';
import 'package:bse/i18n/strings.g.dart';
import '../base_trick.dart';

class Trick71DivideBy15 extends BaseTrick {
  final String chapterKey;
  late int op1;
  late int op2;

  Trick71DivideBy15(super.level, {required this.chapterKey});

  @override
  void generateData() {
    final int i = level;
    int ans = ((BaseTrick.random.nextDouble() * 20.0).toInt() + ((i - 1) * 20)) + 1;
    op2 = 15;
    op1 = ans * op2;

    answer = ans;
    questionText = '$op1${divide()}$op2';
    choices = generateChoices(answer);
  }

  @override
  void generateDemoData() {
    op1 = 240;
    op2 = 15;
    answer = op1 / op2;
    questionText = '$op1${divide()}$op2';
    choices = generateChoices(answer);
  }

  @override
  String createHtmlStepsSolution(BuildContext context) {
    final l10n = Translations.of(context);

    int var1 = 10;
    int var2 = 3;
    int var3 = 2;

    final double temp1 = op1 / var1;
    final String temp1Str = (op1 % var1 == 0) ? temp1.toInt().toString() : temp1.toStringAsFixed(1);

    final double temp2 = temp1 / var2;
    final String temp2Str = (temp1 % var2 == 0) ? temp2.toInt().toString() : temp2.toStringAsFixed(1);
    final String answerStr = (answer % 1 == 0) ? answer.toInt().toString() : answer.toString();

    String steps = "";

    // Step 1: Divide by 10
    steps += createStepLabel(
      stepNo: 1,
      text: l10n.math_tricks.trick71.step1(divisor1: var1.toString()),
    );
    steps += createStepValue(
      text:
          "${spanColor(op1, 'red')}${divide()}${spanColor(var1, 'yellow')}${equal()}${spanColor(temp1Str, 'green')}",
    );

    // Step 2: Divide result by 3
    steps += createStepLabel(
      stepNo: 2,
      text: l10n.math_tricks.trick71.step2(temp1: temp1Str, divisor2: var2.toString()),
    );
    steps += createStepValue(
      text:
          "${spanColor(temp1Str, 'green')}${divide()}${spanColor(var2, 'magenta')}${equal()}${spanColor(temp2Str, 'cyan')}",
    );

    // Step 3: Multiply result by 2
    steps += createStepLabel(
      stepNo: 3,
      text: l10n.math_tricks.trick71.step3(temp2: temp2Str, multiplier: var3.toString()),
    );
    steps += createStepValue(
      text:
          "${spanColor(temp2Str, 'cyan')}${times()}${spanColor(var3, 'orange')}${equal()}${spanColor(answerStr, 'default')}",
    );

    return buildHtmlContainer(
      problemLabel: l10n.math_tricks.soal,
      problem: '$op1${divide()}$op2',
      steps: steps,
      finalAnswer: l10n.math_tricks.jadi(result: '$op1${divide()}$op2 = $answerStr'),
    );
  }
}
