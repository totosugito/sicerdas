import 'package:flutter/material.dart';
import 'package:bse/i18n/strings.g.dart';
import '../base_trick.dart';

class Trick107Percent40 extends BaseTrick {
  final String chapterKey;
  late int op1;
  late int op2;

  Trick107Percent40(super.level, {required this.chapterKey});

  @override
  void generateData() {
    final int i = level;
    int ans = ((BaseTrick.random.nextDouble() * 20.0).toInt()) + ((i - 1) * 10);
    ans += 1;

    switch (chapterKey) {
      case 'trick107Percent40':
        ans *= 2;
        op2 = (ans * 10) ~/ 4;
        op1 = 40;
        break;
      case 'trick105Percent75':
        op2 = ans * 4;
        op1 = 75;
        ans = (op2 ~/ 4) * 3;
        break;
      case 'trick70Percent250':
        op2 = ans * 2;
        op1 = 250;
        ans = (op2 * 10) ~/ 4;
        break;
      default:
        ans *= 2;
        op2 = (ans * 10) ~/ 4;
        op1 = 40;
    }

    answer = ans;
    questionText = '$op1% ${t.math_tricks.of} $op2';
    choices = generateChoices(answer);
  }

  @override
  void generateDemoData() {
    switch (chapterKey) {
      case 'trick107Percent40':
        op1 = 40;
        op2 = 80;
        break;
      case 'trick105Percent75':
        op1 = 75;
        op2 = 300;
        break;
      case 'trick70Percent250':
        op1 = 250;
        op2 = 36;
        break;
      default:
        op1 = 40;
        op2 = 80;
    }
    answer = (op1 * op2) ~/ 100;
    questionText = '$op1% ${t.math_tricks.of} $op2';
    choices = generateChoices(answer);
  }

  @override
  String createHtmlStepsSolution(BuildContext context) {
    final l10n = Translations.of(context);

    int var1 = 0; // multiplier
    int var2 = 0; // divisor
    switch (chapterKey) {
      case 'trick107Percent40':
        var1 = 4;
        var2 = 10;
        break;
      case 'trick105Percent75':
        var1 = 3;
        var2 = 4;
        break;
      case 'trick70Percent250':
        var1 = 10;
        var2 = 4;
        break;
      default:
        var1 = 4;
        var2 = 10;
    }

    final double temp1 = op2 / var2;
    final String temp1Str = (op2 % var2 == 0)
        ? temp1.toInt().toString()
        : temp1.toString();

    String steps = "";

    // Step 1: Explain the percentage conversion formula
    steps += createStepLabel(
      stepNo: 1,
      text: l10n.math_tricks.trick107.step1,
    );
    steps += createStepValue(
      text:
          "${spanColor('$op1%', 'red')}${equal()}(100%${divide()}${spanColor(var2, 'yellow')})${times()}${spanColor(var1, 'green')}",
    );

    // Step 2: Divide op2 by var2
    steps += createStepLabel(
      stepNo: 2,
      text: l10n.math_tricks.trick107.step2(divisor: var2.toString()),
    );
    steps += createStepValue(
      text:
          "${spanColor(op2, 'blue')}${divide()}${spanColor(var2, 'yellow')}${equal()}${spanColor(temp1Str, 'magenta')}",
    );

    // Step 3: Multiply step 2 result by var1
    steps += createStepLabel(
      stepNo: 3,
      text: l10n.math_tricks.trick107.step3(temp1: temp1Str, multiplier: var1.toString()),
    );
    steps += createStepValue(
      text:
          "${spanColor(temp1Str, 'magenta')}${times()}${spanColor(var1, 'green')}${equal()}${spanColor(answer, 'default')}",
    );

    return buildHtmlContainer(
      problemLabel: l10n.math_tricks.soal,
      problem: '$op1% ${l10n.math_tricks.of} $op2',
      steps: steps,
      finalAnswer: l10n.math_tricks.jadi(result: '$op1% ${l10n.math_tricks.of} $op2 = $answer'),
    );
  }
}
