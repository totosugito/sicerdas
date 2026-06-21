import 'package:flutter/material.dart';
import 'package:bse/i18n/strings.g.dart';
import '../base_trick.dart';

class Trick106Percent750 extends BaseTrick {
  final String chapterKey;
  late int op1;
  late int op2;

  Trick106Percent750(super.level, {required this.chapterKey});

  @override
  void generateData() {
    final int i = level;
    int ans = ((BaseTrick.random.nextDouble() * 20.0).toInt()) + ((i - 1) * 10);
    ans += 1;
    ans *= 2;
    op2 = ans;
    op1 = 750;
    answer = (op2 ~/ 4) * 3 * 10;

    questionText = '$op1% ${t.math_tricks.of} $op2';
    choices = generateChoices(answer);
  }

  @override
  void generateDemoData() {
    op1 = 750;
    op2 = 10;
    answer = (op1 * op2) ~/ 100;
    questionText = '$op1% ${t.math_tricks.of} $op2';
    choices = generateChoices(answer);
  }

  @override
  String createHtmlStepsSolution(BuildContext context) {
    final l10n = Translations.of(context);

    int var1 = 4;
    int var2 = 3;
    int var3 = 10;

    final double temp1 = op2 / var1;
    final String temp1Str = (op2 % var1 == 0)
        ? temp1.toInt().toString()
        : temp1.toString();

    final double temp2 = (op2 / var1) * var2;
    final String temp2Str = (temp2 % 1 == 0)
        ? temp2.toInt().toString()
        : temp2.toString();

    String steps = "";

    // Step 1: Explain that 750% = ((100% / 4) * 3) * 10
    steps += createStepLabel(
      stepNo: 1,
      text: l10n.math_tricks.trick106.step1,
    );
    steps += createStepValue(
      text:
          "${spanColor('$op1%', 'red')}${equal()}((100%${divide()}${spanColor(var1, 'green')})${times()}${spanColor(var2, 'yellow')})${times()}${spanColor(var3, 'magenta')}",
    );

    // Step 2: Divide op2 by 4
    steps += createStepLabel(
      stepNo: 2,
      text: l10n.math_tricks.trick106.step2(divisor: var1.toString()),
    );
    steps += createStepValue(
      text:
          "${spanColor(op2, 'blue')}${divide()}${spanColor(var1, 'green')}${equal()}${spanColor(temp1Str, 'cyan')}",
    );

    // Step 3: Multiply step 2 result by 3
    steps += createStepLabel(
      stepNo: 3,
      text: l10n.math_tricks.trick106.step3(temp1: temp1Str, multiplier: var2.toString()),
    );
    steps += createStepValue(
      text:
          "${spanColor(temp1Str, 'cyan')}${times()}${spanColor(var2, 'yellow')}${equal()}${spanColor(temp2Str, 'orange')}",
    );

    // Step 4: Multiply step 3 result by 10
    steps += createStepLabel(
      stepNo: 4,
      text: l10n.math_tricks.trick106.step4(temp2: temp2Str, multiplier2: var3.toString()),
    );
    steps += createStepValue(
      text:
          "${spanColor(temp2Str, 'orange')}${times()}${spanColor(var3, 'magenta')}${equal()}${spanColor(answer, 'default')}",
    );

    return buildHtmlContainer(
      problemLabel: l10n.math_tricks.soal,
      problem: '$op1% ${l10n.math_tricks.of} $op2',
      steps: steps,
      finalAnswer: l10n.math_tricks.jadi(result: '$op1% ${l10n.math_tricks.of} $op2 = $answer'),
    );
  }
}
