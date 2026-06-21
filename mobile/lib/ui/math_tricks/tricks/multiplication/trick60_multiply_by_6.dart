import 'package:flutter/material.dart';
import 'package:bse/i18n/strings.g.dart';
import '../base_trick.dart';

class Trick60MultiplyBy6 extends BaseTrick {
  final String chapterKey;
  late int op1;
  late int op2;

  Trick60MultiplyBy6(super.level, {required this.chapterKey});

  @override
  void generateData() {
    final int i = level;
    int ans = 0;

    op1 = ((BaseTrick.random.nextDouble() * 20.0).toInt()) + ((i - 1) * 10) + 1;
    switch (chapterKey) {
      case 'trick60MultiplyBy6':
        op2 = 6;
        break;
      case 'trick61MultiplyBy7':
        op2 = 7;
        break;
      default:
        op2 = 6;
    }

    ans = op1 * op2;
    answer = ans;
    questionText = '$op1 × $op2';
    choices = generateChoices(answer);
  }

  @override
  void generateDemoData() {
    switch (chapterKey) {
      case 'trick60MultiplyBy6':
        op1 = 16;
        op2 = 6;
        break;
      case 'trick61MultiplyBy7':
        op1 = 24;
        op2 = 7;
        break;
      default:
        op1 = 16;
        op2 = 6;
    }
    answer = op1 * op2;
    questionText = '$op1 × $op2';
    choices = generateChoices(answer);
  }

  @override
  String createHtmlStepsSolution(BuildContext context) {
    final l10n = Translations.of(context);

    const int var1 = 2;
    const int var2 = 10;
    int var3 = 0;
    switch (chapterKey) {
      case 'trick60MultiplyBy6':
        var3 = 1;
        break;
      case 'trick61MultiplyBy7':
        var3 = 2;
        break;
      default:
        var3 = 1;
    }

    final double temp1 = op1 / var1;
    final int temp2 = (temp1 * var2).toInt();
    final int temp3 = op1 * var3;

    final String temp1Str = (op1 % var1 == 0)
        ? temp1.toInt().toString()
        : temp1.toString();

    String steps = "";

    // Step 1: Divide by 2
    steps += createStepLabel(
      stepNo: 1,
      text: l10n.math_tricks.trick60.step1(
        divisor: var1.toString(),
      ),
    );
    steps += createStepValue(
      text:
          "${spanColor(op1, 'red')}${divide()}${spanColor(var1, 'green')}${equal()}${spanColor(temp1Str, 'magenta')}",
    );

    // Step 2: Multiply by 10
    steps += createStepLabel(
      stepNo: 2,
      text: l10n.math_tricks.trick60.step2(
        temp1: temp1Str,
        multiplier: var2.toString(),
      ),
    );
    steps += createStepValue(
      text:
          "${spanColor(temp1Str, 'magenta')}${times()}${spanColor(var2, 'yellow')}${equal()}${spanColor(temp2, 'blue')}",
    );

    // Step 3: Multiply by var3
    steps += createStepLabel(
      stepNo: 3,
      text: l10n.math_tricks.trick60.step3(
        multiplier2: var3.toString(),
      ),
    );
    steps += createStepValue(
      text:
          "${spanColor(op1, 'red')}${times()}${spanColor(var3, 'green')}${equal()}${spanColor(temp3, 'yellow')}",
    );

    // Step 4: Add Step 2 and Step 3 results
    steps += createStepLabel(
      stepNo: 4,
      text: l10n.math_tricks.trick60.step4(
        temp2: temp2.toString(),
        temp3: temp3.toString(),
      ),
    );
    steps += createStepValue(
      text:
          "${spanColor(temp2, 'blue')}${plus()}${spanColor(temp3, 'yellow')}${equal()}${spanColor(answer, 'default')}",
    );

    return buildHtmlContainer(
      problemLabel: l10n.math_tricks.soal,
      problem: '$op1 × $op2',
      steps: steps,
      finalAnswer: l10n.math_tricks.jadi(result: '$op1 × $op2 = $answer'),
    );
  }
}
