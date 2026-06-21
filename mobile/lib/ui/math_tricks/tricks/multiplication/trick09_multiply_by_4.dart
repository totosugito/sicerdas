import 'package:flutter/material.dart';
import 'package:bse/i18n/strings.g.dart';
import '../base_trick.dart';

class Trick09MultiplyBy4 extends BaseTrick {
  final String chapterKey;
  late int op1;
  late int op2;

  Trick09MultiplyBy4(super.level, {required this.chapterKey});

  @override
  void generateData() {
    final int i = level;
    int ans = 0;

    switch (chapterKey) {
      case 'trick09MultiplyBy4':
        op1 = ((BaseTrick.random.nextDouble() * 10.0).toInt()) + (i * 5);
        op2 = 4;
        break;
      case 'trick27MultiplyBy20':
        op1 =
            ((BaseTrick.random.nextDouble() * 15.0).toInt() * i) +
            (i * 5);
        op2 = 20;
        break;
      default:
        op1 = ((BaseTrick.random.nextDouble() * 10.0).toInt()) + (i * 5);
        op2 = 4;
    }

    ans = op1 * op2;
    answer = ans;
    questionText = '$op1 × $op2';
    choices = generateChoices(answer);
  }

  @override
  void generateDemoData() {
    switch (chapterKey) {
      case 'trick09MultiplyBy4':
        op1 = 18;
        op2 = 4;
        break;
      case 'trick27MultiplyBy20':
        op1 = 18;
        op2 = 20;
        break;
      default:
        op1 = 18;
        op2 = 4;
    }
    answer = op1 * op2;
    questionText = '$op1 × $op2';
    choices = generateChoices(answer);
  }

  @override
  String createHtmlStepsSolution(BuildContext context) {
    final l10n = Translations.of(context);

    int var1 = 2;
    int var2 = 2;
    switch (chapterKey) {
      case 'trick09MultiplyBy4':
        var1 = 2;
        var2 = 2;
        break;
      case 'trick27MultiplyBy20':
        var1 = 2;
        var2 = 10;
        break;
      default:
        var1 = 2;
        var2 = 2;
    }

    final int temp1 = op1 * var1;
    String steps = "";

    // Step 1: Multiply by var1
    steps += createStepLabel(
      stepNo: 1,
      text: l10n.math_tricks.trick09.step1(
        multiplier1: var1.toString(),
      ),
    );
    steps += createStepValue(
      text:
          "${spanColor(op1, 'red')}${times()}${spanColor(var1, 'green')}${equal()}${spanColor(temp1, 'magenta')}",
    );

    // Step 2: Multiply by var2
    steps += createStepLabel(
      stepNo: 2,
      text: l10n.math_tricks.trick09.step2(
        temp1: temp1.toString(),
        multiplier2: var2.toString(),
      ),
    );
    steps += createStepValue(
      text:
          "${spanColor(temp1, 'magenta')}${times()}${spanColor(var2, 'yellow')}${equal()}${spanColor(answer, 'default')}",
    );

    return buildHtmlContainer(
      problemLabel: l10n.math_tricks.soal,
      problem: '$op1 × $op2',
      steps: steps,
      finalAnswer: l10n.math_tricks.jadi(result: '$op1 × $op2 = $answer'),
    );
  }
}
