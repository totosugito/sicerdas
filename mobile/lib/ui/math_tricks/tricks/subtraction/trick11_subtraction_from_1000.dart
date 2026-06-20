import 'package:flutter/material.dart';
import 'package:bse/i18n/strings.g.dart';
import '../base_trick.dart';

class Trick11SubtractionFrom1000 extends BaseTrick {
  late int op1;
  late int op2;

  Trick11SubtractionFrom1000(super.level);

  @override
  void generateData() {
    op1 = 1000;
    op2 = ((BaseTrick.random.nextDouble() * level * 10.0).toInt()) + ((level - 1) * 10);
    if (op2 % 10 == 0) {
      op2 += 1;
    }

    if (op2 > 1000) {
      op2 = op2 ~/ 10;
    }

    if (op2 <= 0) {
      op2 = 123;
    }
    if (op2 >= 1000) {
      op2 = 999;
    }

    answer = op1 - op2;
    questionText = '$op1 - $op2';
    choices = generateChoices(answer);
  }

  @override
  String createHtmlStepsSolution(BuildContext context) {
    final l10n = Translations.of(context);

    final int temp1 = op2 % 10;
    final int temp2 = (op2 ~/ 10) % 10;
    final int temp3 = op2 ~/ 100;

    final int res3 = 9 - temp3;
    final int res2 = 9 - temp2;
    final int res1 = 10 - temp1;

    String steps = "";

    // Step 1: Hundreds digit
    steps += createStepLabel(
      stepNo: 1,
      text: l10n.math_tricks.trick11.step1(digit: temp3.toString()),
    );
    steps += createStepValue(
      text: "9${minus()}${spanColor(temp3, 'red')}${equal()}${spanColor(res3, 'green')}",
    );

    // Step 2: Tens digit
    steps += createStepLabel(
      stepNo: 2,
      text: l10n.math_tricks.trick11.step2(digit: temp2.toString()),
    );
    steps += createStepValue(
      text: "9${minus()}${spanColor(temp2, 'blue')}${equal()}${spanColor(res2, 'magenta')}",
    );

    // Step 3: Ones digit
    steps += createStepLabel(
      stepNo: 3,
      text: l10n.math_tricks.trick11.step3(digit: temp1.toString()),
    );
    steps += createStepValue(
      text: "10${minus()}${spanColor(temp1, 'yellow')}${equal()}${spanColor(res1, 'blue')}",
    );

    // Step 4: Combine
    steps += createStepLabel(
      stepNo: 4,
      text: l10n.math_tricks.trick11.step4,
    );
    steps += createStepValue(
      text: "${spanColor(res3, 'green')}${spanColor(res2, 'magenta')}${spanColor(res1, 'blue')}${equal()}${spanColor(answer, 'default')}",
    );

    return buildHtmlContainer(
      problemLabel: l10n.math_tricks.soal,
      problem: '$op1 - $op2',
      steps: steps,
      finalAnswer: l10n.math_tricks.jadi(result: '$op1 - $op2 = $answer'),
    );
  }
}
